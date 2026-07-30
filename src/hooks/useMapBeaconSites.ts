import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '@/integrations/supabase/client';
import { createPlaceMedallion, markerColor } from '@/utils/map/placeMarker';

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

// Enhetlig medaljong (kompakt, utan etikett) med vårdkase-låga — ersätter tidigare 🔥-emoji-pin.
const beaconIcon = createPlaceMedallion({
  color: markerColor('beacon'), icon: 'beacon', label: '', size: 24, className: 'vp-medallion--beacon',
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
            <h3 class="font-bold text-sm" style="color:#b45309">${r.name}</h3>
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
