import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/integrations/supabase/client';

// Vårdkasar (beacon-fire sites) från RAÄ/K-samsök — 211 verifierade lämningar med
// WGS84-koordinat. Ett eget kartlager, gate: legendknappen 'beacon_sites'.
// Klustras eftersom det annars blir en oläslig prickmatta längs kusterna.
// INGA gissade lägen — bara poster med koordinat direkt ur RAÄ (source_uri).

interface Props {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}

interface BeaconRow {
  name: string;
  landscape: string | null;
  municipality: string | null;
  parish: string | null;
  lat: number;
  lng: number;
  source_uri: string | null;
}

const sb = supabase as unknown as { from: (t: string) => any };

const beaconIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    background:radial-gradient(circle at 50% 35%, #fde68a 0%, #f59e0b 45%, #b45309 100%);
    border:1.5px solid #7c2d12;box-shadow:0 1px 3px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;">
    <span style="transform:rotate(45deg);font-size:9px;line-height:1;">🔥</span>
  </div>`,
  className: 'beacon-site-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 15],
  popupAnchor: [0, -14],
});

export const useMapBeaconSites = ({ map, enabledLegendItems, isMapReady, safelyAddLayer }: Props) => {
  const layerRef = useRef<L.Layer | null>(null);
  const dataRef = useRef<BeaconRow[] | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    let cancelled = false;

    const clear = () => {
      if (layerRef.current) { try { map.removeLayer(layerRef.current); } catch { /* noop */ } layerRef.current = null; }
    };
    clear();

    if (enabledLegendItems.beacon_sites !== true) return;

    const draw = (rows: BeaconRow[]) => {
      if (cancelled || !map || !rows.length) return;
      const cluster = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 55,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 11,
      }) as L.LayerGroup;

      rows.forEach((r) => {
        const place = [r.parish, r.municipality, r.landscape].filter(Boolean).join(', ');
        const url = r.source_uri ? `https://${r.source_uri.replace(/^https?:\/\//, '')}` : null;
        const marker = L.marker([r.lat, r.lng], { icon: beaconIcon }).bindPopup(`
          <div class="p-2 max-w-xs">
            <h3 class="font-bold text-sm" style="color:#b45309">🔥 ${r.name}</h3>
            ${place ? `<p class="text-xs text-gray-600 mt-0.5">${place}</p>` : ''}
            <p class="text-xs text-gray-500 mt-1">Vårdkase — signaleld för att varna vid annalkande fara. Restes på höjder inom synhåll från nästa kase, så budet kunde springa längs kusten på timmar.</p>
            ${url ? `<a href="${url}" target="_blank" rel="noopener" class="text-xs" style="color:#2563eb">RAÄ Fornsök — källa</a>` : ''}
          </div>
        `);
        cluster.addLayer(marker);
      });

      if (safelyAddLayer(cluster)) layerRef.current = cluster;
    };

    if (dataRef.current) { draw(dataRef.current); return () => { cancelled = true; }; }

    (async () => {
      const { data } = await sb.from('beacon_sites')
        .select('name, landscape, municipality, parish, lat, lng, source_uri')
        .order('landscape', { ascending: true });
      if (cancelled || !data) return;
      dataRef.current = data as BeaconRow[];
      draw(dataRef.current);
    })();

    return () => { cancelled = true; };
  }, [map, enabledLegendItems.beacon_sites, isMapReady, safelyAddLayer]);
};
