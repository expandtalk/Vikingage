import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { overlapsPeriod } from '@/utils/germanicTimeline/periodRange';

// Kartlager för aDNA-platser + deras genetiska individer (genetic_individuals).
// Periodfiltrerat via individernas numeriska period_from/period_to (samma
// overlapsPeriod som övriga lager) — en plats visas bara om den har minst en
// individ vars datering överlappar vald period. Gate: legendknappen 'adna_sites'.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  selectedTimePeriod: string;
}

const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

// Läsbara etiketter för ancestry-komponenter (jsonb → t.ex. "British-Irish 100%").
const ANC_LABEL: Record<string, string> = {
  british_irish: 'British-Irish', uralic: 'Uralisk', eastern_baltic: 'Öst-baltisk',
  southern_european: 'Sydeuropeisk', scandinavian: 'Skandinavisk', continental: 'Kontinental',
};
const fmtPct = (o: unknown) => {
  try { return Object.entries(o as Record<string, unknown>).map(([k, v]) => `${ANC_LABEL[k] ?? k} ${v}%`).join(', '); }
  catch { return ''; }
};
const fmtIso = (o: unknown) => {
  try { return Object.entries(o as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join(', '); }
  catch { return ''; }
};

export const useMapAncestrySites = ({ map, enabledLegendItems, isMapReady, selectedTimePeriod }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const enabled = enabledLegendItems.adna_sites === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    (async () => {
      const [sitesRes, indsRes] = await Promise.all([
        (supabase as any).from('archaeological_sites').select('id,name,period,dating,coordinates,description').not('coordinates', 'is', null),
        (supabase as any).from('genetic_individuals').select('site_id,sample_id,genetic_sex,archaeological_sex,age,y_haplogroup,mt_haplogroup,radiocarbon,ancestry,isotopes,grave_goods,burial_context,museums_inventory,period_from,period_to'),
      ]);
      if (cancelled || !map || sitesRes.error) return;
      const bySite = new Map<string, any[]>();
      (indsRes.data as any[] || []).forEach((i) => {
        if (!i.site_id) return;
        const arr = bySite.get(i.site_id) ?? []; arr.push(i); bySite.set(i.site_id, arr);
      });
      (sitesRes.data as any[] || []).forEach((s) => {
        const m = /\(([^,]+),([^)]+)\)/.exec(String(s.coordinates ?? ''));
        if (!m) return;
        const lng = parseFloat(m[1]); const lat = parseFloat(m[2]);
        if (!isFinite(lat) || !isFinite(lng)) return;
        // Bara individer vars datering överlappar vald period; hoppa över platsen om ingen kvar.
        const inds = (bySite.get(s.id) ?? []).filter((i) => overlapsPeriod(selectedTimePeriod, i.period_from, i.period_to));
        if (inds.length === 0) return;
        const indHtml = inds.map((i) => {
          const anc = i.ancestry ? fmtPct(i.ancestry) : '';
          const iso = i.isotopes ? fmtIso(i.isotopes) : '';
          const goods = Array.isArray(i.grave_goods) && i.grave_goods.length ? i.grave_goods.join(', ') : '';
          const sex = i.genetic_sex === 'XY' ? '♂' : i.genetic_sex === 'XX' ? '♀' : esc(i.genetic_sex);
          return `<li style="margin-bottom:6px">
             <strong>${esc(i.sample_id)}</strong> <span style="color:#64748b">${sex}${i.age ? ` · ${esc(i.age)}` : ''}</span>
             ${i.y_haplogroup ? `<div style="font-size:10px"><span style="color:#3b82f6">♂ faderslinje (Y)</span>: ${esc(i.y_haplogroup)}</div>` : ''}
             ${i.mt_haplogroup ? `<div style="font-size:10px"><span style="color:#db2777">♀ moderslinje (mt)</span>: ${esc(i.mt_haplogroup)}</div>` : ''}
             ${anc ? `<div style="font-size:10px"><span style="color:#7c3aed">Härkomst</span>: ${esc(anc)}</div>` : ''}
             ${iso ? `<div style="font-size:10px;color:#0891b2">Isotoper: ${esc(iso)}</div>` : ''}
             ${i.radiocarbon ? `<div style="font-size:10px;color:#64748b">14C ${esc(i.radiocarbon)}</div>` : ''}
             ${goods ? `<div style="font-size:10px;color:#64748b">Gravgåvor: ${esc(goods)}</div>` : ''}
             ${i.burial_context ? `<div style="font-size:10px;color:#475569;font-style:italic;margin-top:1px">${esc(i.burial_context)}</div>` : ''}
             ${i.museums_inventory ? `<div style="font-size:9px;color:#94a3b8">${esc(i.museums_inventory)}</div>` : ''}
           </li>`;
        }).join('');
        L.marker([lat, lng], {
          icon: L.divIcon({ className: 'adna', html: `<div style="width:14px;height:14px;border-radius:50%;background:#a855f7;border:2px solid #f8fafc"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] }),
        }).bindPopup(
          `<div style="min-width:210px">
             <strong>🧬 ${esc(s.name)}</strong>
             <div style="font-size:11px;color:#475569;margin-top:2px">${esc(s.period)}${s.dating ? ` · ${esc(s.dating)}` : ''}</div>
             ${s.description ? `<div style="font-size:11px;color:#64748b;margin-top:3px">${esc(s.description)}</div>` : ''}
             ${inds.length ? `<div style="font-size:11px;margin-top:4px;border-top:1px solid #e2e8f0;padding-top:4px">${inds.length} aDNA-individ${inds.length > 1 ? 'er' : ''}:<ul style="margin:4px 0 0 16px;padding:0">${indHtml}</ul></div>` : ''}
           </div>`,
          { maxWidth: 300 },
        ).addTo(layer);
      });
    })();
    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, enabled, isMapReady, selectedTimePeriod]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
