import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Tingsplats-lager (thing_sites) — förhistoriska/medeltida tingsplatser (Wildte 1926 m.fl.).
// Litet lager (~31 rader) → laddar allt en gång och cachar. Gate: legendknappen 'thing_sites'.
// Färg per tingstyp; opacitet sänks för låg konfidens (approximativt läge).

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

interface ThingSite {
  name: string;
  thing_type: string | null;
  jurisdiction: string | null;
  landscape: string | null;
  monument_type: string | null;
  evidence_type: string | null;
  period_start: number | null;
  period_end: number | null;
  usage_note: string | null;
  confidence: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
}

// Färg per tingstyp så hierarkin (landsting > häradsting > hundaresting) går att läsa.
const TYPE_COLOR: Record<string, string> = {
  landsting: '#b45309',      // guld/amber — högsta nivån
  häradsting: '#0d9488',     // teal
  hundaresting: '#0891b2',   // cyan
};
const colorFor = (t: string | null) => (t && TYPE_COLOR[t]) || '#7c3aed';

const thingIcon = (t: string | null, confidence: string | null) => {
  const c = colorFor(t);
  const op = confidence === 'low' ? 0.5 : confidence === 'medium' ? 0.8 : 1;
  // Ruter-markör (⧫) med tingfärg; ihålig ring vid låg konfidens.
  return L.divIcon({
    html: `<div style="
      width:16px;height:16px;transform:rotate(45deg);
      background:${c};opacity:${op};
      border:2px solid #1e293b;box-shadow:0 1px 3px rgba(0,0,0,0.45);"></div>`,
    className: 'thing-site-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
};

const sb = supabase as unknown as {
  from: (t: string) => { select: (c: string) => Promise<{ data: any; error: any }> };
};

export const useMapThingSites = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const cacheRef = useRef<ThingSite[] | null>(null);
  const show = enabledLegendItems.thing_sites === true;

  useEffect(() => {
    if (!map || !isMapReady.current) return;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!show) return;

    let cancelled = false;

    const draw = (rows: ThingSite[]) => {
      if (cancelled) return;
      layer.clearLayers();
      rows.forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        const period =
          r.period_start || r.period_end
            ? `${r.period_start ?? '?'}–${r.period_end ?? '?'}`
            : '';
        const rows_html = [
          r.thing_type && `<span style="color:${colorFor(r.thing_type)};font-weight:600">${r.thing_type}</span>`,
          r.jurisdiction,
          r.monument_type,
          period && `⏳ ${period}`,
        ].filter(Boolean).join(' · ');
        const note = r.usage_note ? `<br/><em style="font-size:11px">${r.usage_note}</em>` : '';
        const desc = r.description ? `<br/><span style="font-size:11px;color:#475569">${r.description}</span>` : '';
        const conf = r.confidence && r.confidence !== 'high'
          ? `<br/><span style="font-size:10px;color:#94a3b8">läge ${r.confidence === 'low' ? 'osäkert' : 'approximativt'}</span>`
          : '';
        L.marker([r.lat, r.lng], { icon: thingIcon(r.thing_type, r.confidence) })
          .bindPopup(
            `<strong>⚖️ ${r.name}</strong><br/><span style="font-size:12px">${rows_html}</span>${note}${desc}${conf}`,
            { maxWidth: 300 }
          )
          .addTo(layer);
      });
    };

    if (cacheRef.current) {
      draw(cacheRef.current);
    } else {
      sb.from('thing_sites')
        .select('name,thing_type,jurisdiction,landscape,monument_type,evidence_type,period_start,period_end,usage_note,confidence,description,lat,lng')
        .then(({ data, error }) => {
          if (error) { console.error('thing_sites fetch error', error); return; }
          cacheRef.current = (data || []) as ThingSite[];
          draw(cacheRef.current);
        });
    }

    return () => { cancelled = true; layer.clearLayers(); };
  }, [map, show, isMapReady]);
};
