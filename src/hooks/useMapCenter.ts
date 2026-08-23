import { useEffect, useState } from 'react';
import type L from 'leaflet';

// Läser explore-kartans aktuella center via det globala handtaget (window.__vikingMap,
// satt i useMapInstance) och följer panorering/zoom (moveend). Ytor UTANFÖR kartan
// (SMHI-varningspanelen) kan därmed filtrera geografiskt utan prop-drilling.
// Kartan kan monteras EFTER konsumenten → vi pollar tills handtaget finns.
export function useMapCenter(): { lat: number; lng: number } | null {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let map: L.Map | null = null;
    let tries = 0;
    const read = () => {
      try {
        const c = map!.getCenter();
        setCenter({ lat: c.lat, lng: c.lng });
      } catch { /* karta borttagen */ }
    };
    const attach = (): boolean => {
      const m = (window as unknown as { __vikingMap?: L.Map }).__vikingMap;
      if (m && typeof m.getCenter === 'function') {
        map = m;
        read();
        map.on('moveend', read);
        return true;
      }
      return false;
    };

    if (attach()) {
      return () => { if (map) map.off('moveend', read); };
    }
    // Kartan inte redo ännu → polla i ~10 s (40 × 250 ms).
    const iv = setInterval(() => {
      if (attach() || ++tries > 40) clearInterval(iv);
    }, 250);
    return () => {
      clearInterval(iv);
      if (map) map.off('moveend', read);
    };
  }, []);

  return center;
}
