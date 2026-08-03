import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Lokalguide ur `experiences` (badplatser m.fl.) — SÄSONGS- & tidsmedvetet. Gate: legendknappen
// 'experiences' (default av). Popupen visar säsong + "i säsong nu?" (klientens månad), öppettider,
// fakta och KÄLLA (source_uri + rights_note) — koordinatproveniens byggd i tabellen, ingen gissning.
interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

interface Exp {
  id: string; name: string; category: string; subtype: string | null;
  lat: number; lng: number; season_from_month: number | null; season_to_month: number | null;
  opening_hours: string | null; facts: Record<string, unknown> | null;
  source: string | null; source_uri: string | null; rights_note: string | null;
  locality: string | null; municipality: string | null; landscape: string | null;
}

const CAT: Record<string, { sv: string; color: string }> = {
  badplats: { sv: 'Badplats', color: '#0ea5e9' },
  camping: { sv: 'Camping', color: '#16a34a' },
  vandringsled: { sv: 'Vandringsled', color: '#a16207' },
  utsiktsplats: { sv: 'Utsiktsplats', color: '#7c3aed' },
  simhall: { sv: 'Simhall', color: '#0891b2' },
  golfbana: { sv: 'Golfbana', color: '#65a30d' },
  attraktion: { sv: 'Attraktion', color: '#db2777' },
  cafe: { sv: 'Café', color: '#b45309' },
  turistbyra: { sv: 'Turistbyrå', color: '#f59e0b' },
};
const catInfo = (c: string) => CAT[c] ?? { sv: c, color: '#64748b' };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
// Säsong kan spänna över årsskiftet (t.ex. simhall okt–apr) → hantera wrap.
const inSeason = (from: number | null, to: number | null, m: number) => {
  if (!from || !to) return true; // ingen säsong angiven = året runt
  return from <= to ? (m >= from && m <= to) : (m >= from || m <= to);
};

const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));
const sb = supabase as unknown as { from: (t: string) => { select: (c: string) => Promise<{ data: unknown; error: unknown }> } };

const popupHtml = (e: Exp, month: number) => {
  const ci = catInfo(e.category);
  const open = inSeason(e.season_from_month, e.season_to_month, month);
  const season = (e.season_from_month && e.season_to_month)
    ? `${MONTHS[e.season_from_month - 1]}–${MONTHS[e.season_to_month - 1]}` : 'året runt';
  const place = [e.locality, e.municipality, e.landscape].filter(Boolean).join(' · ');
  const factsRows = e.facts && typeof e.facts === 'object' && !Array.isArray(e.facts)
    ? Object.entries(e.facts).slice(0, 4).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join('<br/>') : '';
  const src = e.source_uri
    ? `<a href="${esc(e.source_uri)}" target="_blank" rel="noopener" style="color:#0ea5e9">${esc(e.source || 'Källa')}</a>`
    : esc(e.source || '');
  return `<div style="max-width:280px">
    <strong>${esc(e.name)}</strong> <span style="color:${ci.color};font-size:11px">· ${esc(ci.sv)}${e.subtype ? ` (${esc(e.subtype)})` : ''}</span>
    ${place ? `<div style="font-size:11px;color:#64748b">${esc(place)}</div>` : ''}
    <div style="font-size:12px;margin-top:4px">Säsong: ${season} ${open ? '<span style="color:#16a34a">· i säsong nu</span>' : '<span style="color:#b45309">· utanför säsong</span>'}</div>
    ${e.opening_hours ? `<div style="font-size:11px;color:#475569">Öppettider: ${esc(e.opening_hours)}</div>` : ''}
    ${factsRows ? `<div style="font-size:11px;color:#475569;margin-top:4px">${factsRows}</div>` : ''}
    ${src ? `<div style="font-size:10px;color:#94a3b8;margin-top:6px">Källa: ${src}${e.rights_note ? ` · ${esc(e.rights_note)}` : ''}</div>` : ''}
  </div>`;
};

export const useMapExperiences = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const dataRef = useRef<Exp[] | null>(null);
  const tokenRef = useRef(0);
  const enabled = enabledLegendItems['experiences'] === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    if (!enabled) { layer.clearLayers(); return; }
    const month = new Date().getMonth() + 1; // klientens månad → säsongs-status "nu"

    const render = () => {
      const rows = dataRef.current;
      if (!rows) return;
      layer.clearLayers();
      for (const e of rows) {
        if (e.lat == null || e.lng == null) continue;
        const ci = catInfo(e.category);
        const open = inSeason(e.season_from_month, e.season_to_month, month);
        // I säsong = fylld prick; utanför säsong = ihålig/dämpad (men fortfarande klickbar).
        const icon = L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${open ? ci.color : 'transparent'};border:2px solid ${ci.color};box-shadow:0 1px 2px rgba(0,0,0,.4);${open ? '' : 'opacity:.75;'}"></div>`,
          className: 'experience-dot', iconSize: [12, 12], iconAnchor: [6, 6], popupAnchor: [0, -7],
        });
        L.marker([e.lat, e.lng], { icon }).bindPopup(popupHtml(e, month), { maxWidth: 300 }).addTo(layer);
      }
    };

    (async () => {
      const myToken = ++tokenRef.current;
      if (!dataRef.current) {
        const { data, error } = await sb.from('experiences')
          .select('id,name,category,subtype,lat,lng,season_from_month,season_to_month,opening_hours,facts,source,source_uri,rights_note,locality,municipality,landscape');
        if (error || myToken !== tokenRef.current) return;
        dataRef.current = (data as Exp[]) ?? [];
      }
      render();
    })();

    return () => { layer.clearLayers(); };
  }, [map, isMapReady, enabled]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
