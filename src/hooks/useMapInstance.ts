
import { useRef, useEffect } from 'react';
import L from 'leaflet';

interface UseMapInstanceProps {
  isVikingMode: boolean;
}

export const useMapInstance = ({ isVikingMode }: UseMapInstanceProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Djuplänk: ?center=lat,lng&zoom=N centrerar kartan på en region (t.ex. från
    // /sv/oland → "Öppna kartan"). Faller tillbaka på Skandinavien-vy om saknas/ogiltig.
    let center: [number, number] = [60.0, 15.0];
    let zoom = 5;
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('center');
      if (c) {
        const [la, ln] = c.split(',').map(Number);
        if (Number.isFinite(la) && Number.isFinite(ln) && la >= 54 && la <= 70 && ln >= 4 && ln <= 32) {
          center = [la, ln];
        }
      }
      const z = Number(params.get('zoom'));
      if (Number.isFinite(z) && z >= 3 && z <= 18) zoom = z;
    } catch { /* ignorera trasig URL */ }

    // ✅ SÄKER map initialization med race condition-skydd
    const mapInstance = L.map(mapContainer.current, {
      center,
      zoom,
      preferCanvas: true, // Förbättrar prestanda och förhindrar DOM-problem
      worldCopyJump: true,
      // ✅ Tilläggsåtgärder för att förhindra race conditions
      fadeAnimation: false, // Undvik CSS transitions som kan orsaka DOM-problem
      zoomAnimation: true,
      markerZoomAnimation: false // Förhindra marker animations under zoom
    });

    map.current = mapInstance;

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return { mapContainer, map };
};
