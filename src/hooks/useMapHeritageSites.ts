import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// VIEWPORT-servering (proof-of-concept för Steg 1). Till skillnad från övriga
// kartlager laddar detta INTE allt — det frågar sites_in_bbox / sites_bbox_clusters
// på varje map-move och ritar bara det som är i vyn. Server-side-kluster vid låg
// zoom, enskilda punkter vid hög zoom. Därför tål lagret obegränsat antal punkter.
// Gate: legendknappen 'heritage_sites'.

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
}

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: any; error: any }> };
const ZOOM_INDIVIDUAL = 11;

const clusterIcon = (count: number) => {
  const size = count < 10 ? 30 : count < 100 ? 38 : count < 1000 ? 46 : 54;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:radial-gradient(circle at 40% 35%, #fed7aa 0%, #f59e0b 55%, #b45309 100%);
      border:2px solid #7c2d12;box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:#3b1a05;font-weight:700;font-size:${count<1000?'12':'11'}px;">${count}</div>`,
    className: 'heritage-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Färg per lämningstyp så kartan går att läsa. Fallback grå för okända typer.
const TYPE_COLOR: Record<string, string> = {
  'vårdkase': '#f59e0b',        // eld-orange
  'dös': '#7c3aed',             // megalit-lila
  'gånggrift': '#9333ea',       // megalit-lila (ljusare)
  'bildsten': '#0891b2',        // gotländsk cyan
  'skeppssättning': '#0d9488',  // teal
  'kyrka': '#e11d48',           // kyrk-rött
  'kloster': '#c026d3',         // kloster-magenta
  'kapell': '#db2777',          // kapell-rosa
  'Källa med tradition': '#0ea5e9', // källa — vatten-blå
};
const dotIconFor = (t: string) => {
  const c = TYPE_COLOR[t] || '#64748b';
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${c};border:1.5px solid #1e293b;box-shadow:0 1px 2px rgba(0,0,0,0.4);"></div>`,
    className: 'heritage-dot', iconSize: [12, 12], iconAnchor: [6, 11], popupAnchor: [0, -10],
  });
};

// Legendnyckel → raa_type. Per-typ-kryssen i "Kulturlager"-kategorin styr vilka
// typer som hämtas (sites_in_bbox tar p_types). Bak-kompat: 'heritage_sites'=true → alla.
const HERITAGE_TYPE_KEYS: Record<string, string> = {
  heritage_kyrka: 'kyrka', heritage_kapell: 'kapell', heritage_kloster: 'kloster',
  heritage_vardkase: 'vårdkase', heritage_dos: 'dös', heritage_ganggrift: 'gånggrift',
  heritage_bildsten: 'bildsten', heritage_skeppssattning: 'skeppssättning',
  heritage_kalla: 'Källa med tradition', heritage_labyrint: 'labyrint',
};

export const useMapHeritageSites = ({ map, enabledLegendItems, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const tokenRef = useRef(0);

  // Kartan drivs enbart av per-typ-kryssen. Föräldern (heritage_sites) fungerar
  // som huvudström: är den explicit av döljs/släcks hela kulturlagret.
  const parentOn = enabledLegendItems.heritage_sites !== false;
  const types = Object.entries(HERITAGE_TYPE_KEYS)
    .filter(([k]) => enabledLegendItems[k] === true).map(([, v]) => v);
  const typesKey = parentOn ? types.join(',') : 'OFF';

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    const enabled = parentOn && types.length > 0;

    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;

    if (!enabled) { layer.clearLayers(); return; }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = async () => {
      const myToken = ++tokenRef.current;
      const z = Math.round(map.getZoom());
      const b = map.getBounds();
      const args = {
        min_lng: b.getWest(), min_lat: b.getSouth(),
        max_lng: b.getEast(), max_lat: b.getNorth(), p_zoom: z,
        p_types: types,
      };
      const fn = z >= ZOOM_INDIVIDUAL ? 'sites_in_bbox' : 'sites_bbox_clusters';
      const { data, error } = await sb.rpc(fn, args);
      if (error || myToken !== tokenRef.current || !map) return; // stale/avbruten
      layer.clearLayers();
      if (!data) return;

      if (z >= ZOOM_INDIVIDUAL) {
        (data as any[]).forEach((r) => {
          const yr = r.period ? ` · ${r.period}` : '';
          const desc = r.description ? `<br/><span style="font-size:11px;color:#475569">${String(r.description).slice(0, 260)}</span>` : '';
          L.marker([r.lat, r.lng], { icon: dotIconFor(r.raa_type) })
            .bindPopup(`<strong>${r.name ?? r.raa_type}</strong><br/><span style="color:${TYPE_COLOR[r.raa_type] || '#64748b'}">${r.raa_type}${yr}</span>${desc}`)
            .addTo(layer);
        });
      } else {
        (data as any[]).forEach((c) => {
          const m = L.marker([c.lat, c.lng], { icon: clusterIcon(Number(c.cnt)) });
          m.on('click', () => map.setView([c.lat, c.lng], Math.min(z + 3, 13)));
          m.addTo(layer);
        });
      }
    };

    const debounced = () => { if (timer) clearTimeout(timer); timer = setTimeout(refresh, 250); };
    map.on('moveend zoomend', debounced);
    refresh();

    return () => {
      map.off('moveend zoomend', debounced);
      if (timer) clearTimeout(timer);
      layer.clearLayers();
    };
  }, [map, typesKey, isMapReady]);
};
