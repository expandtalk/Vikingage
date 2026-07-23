import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Maktsäten (estates) — kungsgårdar, handelsplatser, husabyar m.m. med innehav över tid
// (estate_holdings: vem höll platsen, när, och via vilket fiskalt system: ledung/tionde).
// Ekonomihistorikerns lager. Gate: legendknappen 'estates' (opt-in). Cachar data i ref så
// omkörningar aldrig gör nya nätverksanrop (loop-säkert, jfr river/inscription-frysningarna).

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}

interface Holding {
  holder_name: string | null;
  role: string | null;
  period_start: number | null;
  period_end: number | null;
  fiscal_system: string | null;
  note: string | null;
}
interface EstateRow {
  name: string;
  estate_type: string;
  lat: number;
  lng: number;
  first_attested: number | null;
  description: string | null;
  estate_holdings: Holding[] | null;
}

const sb = supabase as unknown as { from: (t: string) => any };

const COLOR: Record<string, string> = {
  kungsgård: '#b91c1c', handelsplats: '#a16207', husaby: '#c2410c',
  sätesgård: '#7c2d12', förläning: '#9a3412', uppsala_öd: '#78350f',
};
const iconFor = (type: string) => L.divIcon({
  html: `<div style="width:15px;height:15px;border-radius:3px;transform:rotate(45deg);
    background:${COLOR[type] || '#b45309'};border:1.5px solid #fde68a;
    box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
  className: 'estate-marker', iconSize: [15, 15], iconAnchor: [7, 7], popupAnchor: [0, -10],
});

const esc = (s: unknown) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
// Escape för JS-sträng i en onclick-attribut (enkla citat + backslash).
const jsStr = (s: unknown) => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

// estate_type → legend-barn-nyckel (per-typ-toggle). Okända typer → övrigt.
const TYPE_CHILD: Record<string, string> = {
  'kungsgård': 'estates_kungsgard', husaby: 'estates_husaby', borg: 'estates_borg',
  handelsplats: 'estates_handelsplats', 'mötesplats': 'estates_handelsplats',
};
const childKeyFor = (t: string) => TYPE_CHILD[t] ?? 'estates_ovrigt';
const TYPE_KEYS = ['estates_kungsgard', 'estates_husaby', 'estates_borg', 'estates_handelsplats', 'estates_ovrigt'];

export const useMapEstates = ({ map, enabledLegendItems, isMapReady, safelyAddLayer }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const dataRef = useRef<EstateRow[] | null>(null);

  // Stabil primitiv av per-typ-tillståndet → loop-säker dep (jfr refetch-frysningarna).
  const typeMask = TYPE_KEYS.map((k) => (enabledLegendItems[k] === false ? '0' : '1')).join('');

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    let cancelled = false;

    const clear = () => {
      if (layerRef.current) { try { map.removeLayer(layerRef.current); } catch { /* noop */ } layerRef.current = null; }
    };
    clear();
    if (enabledLegendItems.estates !== true) return;

    const draw = (rows: EstateRow[]) => {
      if (cancelled || !map || !rows.length) return;
      const group = L.layerGroup();
      rows.forEach((r) => {
        // Per-typ-gate: hoppa över rader vars typ-barn är avstängt.
        if (enabledLegendItems[childKeyFor(r.estate_type)] === false) return;
        const holdings = (r.estate_holdings ?? [])
          .slice()
          .sort((a, b) => (a.period_start ?? 0) - (b.period_start ?? 0));
        const rowsHtml = holdings.map((h) => {
          const yrs = [h.period_start, h.period_end].filter((y) => y != null).join('–');
          const fisc = h.fiscal_system ? ` <span style="color:#0d9488">[${esc(h.fiscal_system)}]</span>` : '';
          return `<li style="margin:2px 0"><strong>${esc(h.holder_name)}</strong>${yrs ? ` (${yrs})` : ''}${h.role ? ` · ${esc(h.role)}` : ''}${fisc}${h.note ? `<br/><span style="color:#64748b">${esc(h.note)}</span>` : ''}</li>`;
        }).join('');
        const marker = L.marker([r.lat, r.lng], { icon: iconFor(r.estate_type) }).bindPopup(`
          <div class="p-2" style="max-width:320px">
            <h3 class="font-bold text-sm" style="color:${COLOR[r.estate_type] || '#b45309'}">⚔️ ${esc(r.name)}</h3>
            <p class="text-xs text-gray-600">${esc(r.estate_type)}${r.first_attested ? ` · tidigast belagt ${r.first_attested}` : ''}</p>
            ${r.description ? `<p class="text-xs text-gray-500 mt-1">${esc(r.description)}</p>` : ''}
            ${rowsHtml ? `<div class="text-xs mt-1" style="color:#334155"><div style="font-weight:600;margin-top:4px">Innehav</div><ul style="padding-left:14px;margin:2px 0">${rowsHtml}</ul></div>` : ''}
          </div>
        `, { maxWidth: 340 });
        group.addLayer(marker);
      });
      if (safelyAddLayer(group)) layerRef.current = group;
    };

    if (dataRef.current) { draw(dataRef.current); return () => { cancelled = true; }; }

    (async () => {
      const { data } = await sb.from('estates')
        .select('name, estate_type, lat, lng, first_attested, description, estate_holdings(holder_name, role, period_start, period_end, fiscal_system, note)');
      if (cancelled || !data) return;
      dataRef.current = data as EstateRow[];
      draw(dataRef.current);
    })();

    return () => { cancelled = true; };
  }, [map, enabledLegendItems.estates, typeMask, isMapReady, safelyAddLayer]);
};
