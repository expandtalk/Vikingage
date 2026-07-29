import { useEffect, useRef, type RefObject } from 'react';
import L from 'leaflet';
import { tileUrl } from '@/config/historicalMapLayers';

// Höjdrelief (LiDAR-hillshade, Höjddata Grid 50+ © Lantmäteriet) som togglebart overlay på en
// IMPERATIV Leaflet-karta. Kompletterar SGU-strandlinjen: strandlinjen visar VAR havet stod,
// reliefen visar de fysiska strandvallarna/terrasserna (Höga kusten = typexemplet).
// Tiles serveras statiskt från FTP (public_html/map/tiles/relief/{z}/{x}/{y}.png) — tills de
// laddats upp visar lagret inget (errorTileUrl = genomskinlig), inget kraschar.

const TRANSPARENT = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export function useReliefOverlay(mapRef: RefObject<L.Map | null>, enabled: boolean, opacity = 0.5) {
  const layerRef = useRef<L.TileLayer | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (layerRef.current) { try { map?.removeLayer(layerRef.current); } catch { /* karta borta */ } layerRef.current = null; }
    if (!map || !enabled) return;
    const t = L.tileLayer(tileUrl('relief'), {
      opacity, maxNativeZoom: 15, minZoom: 5, errorTileUrl: TRANSPARENT,
      attribution: 'Höjddata Grid 50+ © Lantmäteriet (hillshade)',
    });
    t.addTo(map);
    try { t.bringToFront(); } catch { /* noop */ }
    layerRef.current = t;
    return () => { try { map.removeLayer(t); } catch { /* noop */ } layerRef.current = null; };
  }, [mapRef, enabled, opacity]);
}
