import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Kartlager: sociala TITLAR på runstenar (runic_title_occurrences). Gate: legendknappen
// 'runic_titles'. Varje punkt = en runsten där ett titel-ORD (inte namnled) står i texten.
// Färg per rang-tier (kung → frigiven). Popupen visar TVÅ statusaxlar samtidigt:
//   1) den verbala titeln i texten, och
//   2) den materiella statusen (signerad/tillskriven verkstad · ornerad stilgrupp · kors),
// eftersom analysen visar att höga titlar sitter ~5× oftare på professionellt ristade,
// ornerade och korsprydda stenar — "den vackra stenen är statusmarkören".
//
// HEDERLIGHET: belägg-tabellen är HEURISTISKT verifierad (standalone-ord, namnled bortrensade,
// goði uteslutet pga guð-kollision, bonde = tvetydig make/husbonde). Popupen bär förbehållet
// och små-N gäller — inga fasta slutsatser dras i UI:t.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

// Färg per samhällsskikt (rang-tier). Sekventiell status-skala hög→låg.
const TIER_COLOR: Record<number, string> = {
  1: '#d4af37', // kung — guld
  2: '#b91c1c', // jarl — crimson
  3: '#ea580c', // thegn/gode — orange
  4: '#16a34a', // bonde/dräng/hird — grön
  5: '#2563eb', // bryte/felage/gille/skeppare/styrman — blå
  6: '#6b7280', // träl/frigiven — grå
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

const CONF_NOTE: Record<string, string> = {
  low: 'osäker (regexbrus möjligt)',
  medium: 'kan vara personnamn',
  ambiguous: 'tvetydig: make/husbonde ~ jordägande bonde',
};

export const useRunicTitles = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const cacheRef = useRef<any[] | null>(null);
  const enabled = enabledLegendItems.runic_titles === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!enabled) return;

    let cancelled = false;
    const render = (rows: any[]) => {
      if (cancelled || !map) return;
      rows.forEach((r) => {
        const lat = Number(r.lat);
        const lng = Number(r.lng);
        if (!isFinite(lat) || !isFinite(lng)) return;
        const tier = Number(r.rank_tier) || 4;
        const color = TIER_COLOR[tier] ?? '#94a3b8';
        // Materialstatus-axeln
        const material: string[] = [];
        if (r.signed) material.push('verkstad (signerad/tillskriven)');
        if (r.ornamented) material.push('ornerad');
        if (r.has_cross) material.push('kors');
        const conf = CONF_NOTE[String(r.confidence ?? '')];
        L.circleMarker([lat, lng], {
          radius: Math.max(4, 9 - tier),
          color: '#0f172a',
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.92,
        })
          .bindPopup(
            `<div style="min-width:200px">
               <div style="font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:${color};font-weight:700">${esc(r.label_sv)}</div>
               <strong>${esc(r.stone_name || r.signum)}</strong>
               ${r.stone_name && r.signum ? `<div style="font-size:11px;color:#64748b">${esc(r.signum)}</div>` : ''}
               ${r.province || r.country ? `<div style="font-size:11px;color:#475569;margin-top:2px">${esc([r.parish, r.province, r.country].filter(Boolean).join(', '))}</div>` : ''}
               ${material.length ? `<div style="font-size:11px;color:#334155;margin-top:5px">🪨 ${esc(material.join(' · '))}</div>` : ''}
               ${r.jordart ? `<div style="font-size:11px;color:#3f6212;margin-top:4px">🌾 ${esc(r.jordart)}${r.elevation_m != null ? ` · ${Math.round(r.elevation_m)} m ö.h.` : ''}</div>` : ''}
               ${r.moved_km != null && r.moved_km > 0.5 ? `<div style="font-size:10px;color:#b45309;margin-top:3px">⚠︎ flyttad ~${r.moved_km < 10 ? r.moved_km.toFixed(1) : Math.round(r.moved_km)} km — jorden avser nuvarande läge</div>` : ''}
               ${conf ? `<div style="font-size:10px;color:#b45309;margin-top:5px">⚠︎ ${esc(conf)}</div>` : ''}
               <div style="font-size:10px;color:#94a3b8;margin-top:5px;border-top:1px solid #e2e8f0;padding-top:4px">
                 Titel-belägg (heuristiskt verifierat, standalone-ord). Litet urval — ej statistiskt bevis.
               </div>
             </div>`,
            { maxWidth: 300 },
          )
          .addTo(layer);
      });
    };

    if (cacheRef.current) {
      render(cacheRef.current);
    } else {
      (async () => {
        const { data, error } = await (supabase as any)
          .from('runic_title_occurrences')
          .select('signum,title_form,label_sv,rank_tier,confidence,lat,lng,parish,province,country,stone_name,signed,ornamented,has_cross,jordart,fertility,elevation_m,moved_km')
          .not('lat', 'is', null);
        if (error || cancelled || !map) return;
        cacheRef.current = (data as any[]) || [];
        render(cacheRef.current);
      })();
    }
    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, enabled, isMapReady]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
