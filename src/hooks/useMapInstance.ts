
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
      // OBS: rotate/leaflet-rotate borttaget — bröt canvas-markörers klick-träffdetektering
      // (se main.tsx). Heading-up avstängt; återinförs med hit-detection-fix när rotation ska på.
    });

    map.current = mapInstance;
    // Globalt kart-handtag (samma brygg-mönster som window.__nearMeFlyTo / __openChurchHistory):
    // låter ytor UTANFÖR kartan (t.ex. SMHI-varningspanelen under kartan) läsa aktuellt center
    // för geografisk filtrering utan prop-drilling genom hela explorer-trädet.
    try { (window as unknown as { __vikingMap?: L.Map }).__vikingMap = mapInstance; } catch { /* noop */ }

    // 4-KVADRAT-BUGGEN: kartan initieras ofta INNAN containern fått sin slutstorlek → Leaflet laddar
    // bara ett litet tile-block (2×2) och fyller inte ytan. Måla om vid varje storleksändring
    // (ResizeObserver) + några fördröjda försök tills layouten satt sig (Daniel: "kartan visas som
    // 4 kvadrater; vill att den fyller hela ytan").
    const ro = new ResizeObserver(() => { try { mapInstance.invalidateSize(); } catch { /* noop */ } });
    ro.observe(mapContainer.current);
    const sizeTimers = [60, 250, 600, 1200].map((d) =>
      setTimeout(() => { try { mapInstance.invalidateSize(); } catch { /* noop */ } }, d));

    // Attribution: "Leaflet"-länken är frivillig → bort. OSM/CARTO/Lantmäteri-krediten
    // KVARSTÅR (licenskrav). På små skärmar kollapsas den långa kreditraden
    // ("häradsekonomiska karta …") till en liten "ⓘ Kartdata"-chip som fälls ut vid tap —
    // kravet uppfyllt men texten tar inte över kartan (Daniel: "lång och onödig text på mobil").
    mapInstance.attributionControl.setPrefix(false);
    const attribEl = mapInstance.attributionControl.getContainer();
    if (attribEl && window.matchMedia('(max-width: 640px)').matches) {
      attribEl.classList.add('attribution-collapsed');
      attribEl.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;
        if (t.tagName === 'A') return; // låt licenslänkarna fungera
        L.DomEvent.stop(e);
        attribEl.classList.toggle('attribution-collapsed');
      });
    }

    return () => {
      try { ro.disconnect(); } catch { /* noop */ }
      sizeTimers.forEach(clearTimeout);
      try {
        const w = window as unknown as { __vikingMap?: L.Map | null };
        if (w.__vikingMap === mapInstance) w.__vikingMap = null;
      } catch { /* noop */ }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return { mapContainer, map };
};
