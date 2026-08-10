// src/hooks/map/useMapCreateMarkedPlace.ts
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';
import { addMarkedPlace } from '@/hooks/useMarkedPlaces';
import { exceedsMoveThreshold, LONG_PRESS_MS } from './longPressGeometry';

// Skapar en röd "markerad plats"-nål genom att trycka/klicka på TOM karta (Task 4, väg 1 av 2 —
// se useMarkedPlaceTriggers.ts för den andra vägen, popup-knappen "Markera"). Två gester, en per
// plattform, ingen får kapa normal panorering eller "klicka för att avmarkera":
//
//   Mobil (pekskärm):  långtryck (~550 ms stillastående). Ett kort tryck panorerar/väljer precis
//                       som idag — bara ett tryck som INTE rör sig och INTE lyfts inom tidsgränsen
//                       räknas som "släpp nål här". Leaflet saknar ett eget longpress-event, så vi
//                       lyssnar på native touchstart/touchmove/touchend direkt på kartcontainern
//                       (Leaflets egna pan/zoom-hantering stör vi inte — vi callar aldrig
//                       preventDefault/stopPropagation).
//   Desktop (mus):      Shift+klick. Valt eftersom vanligt klick redan används för panorering och
//                       (i andra lager) avmarkering av val — ett modifier-klick är minsta möjliga
//                       tillägg som inte kan triggas av misstag. Ctrl/Alt+klick vore likvärdiga,
//                       Shift är minst sannolikt att krocka med webbläsarens egna genvägar.
//
// Guard mot befintliga markörer/kontroller: Leaflet stoppar redan click-bubbling till kartan när
// målet har en egen click-listener (bindPopup lägger till en sådan) och Control-behållare stänger
// av click-propagering själva (L.DomEvent.disableClickPropagation, inbyggt i Leaflet). Vi lägger
// ändå till en explicit DOM-koll (closest på interaktiva Leaflet-klasser) som andra försvarslinje
// och som ENDA skyddet för långtrycket, vars touch-lyssnare ligger utanför Leaflets click-system.
interface Props { map: L.Map | null }

const isOnInteractiveTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    '.leaflet-interactive, .leaflet-marker-icon, .leaflet-control, .leaflet-popup, .leaflet-tooltip',
  );
};

const dropMarkedPlaceHere = (lat: number, lng: number) => {
  addMarkedPlace({ lat, lng });
  toast.success('Plats markerad');
};

export const useMapCreateMarkedPlace = ({ map }: Props) => {
  // Desktop: Shift+klick på tom karta.
  useEffect(() => {
    if (!map) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      const orig = e.originalEvent;
      if (!orig?.shiftKey) return; // vanligt klick ska panorera/avmarkera precis som idag
      if (isOnInteractiveTarget(orig.target)) return; // klick landade på en befintlig markör/kontroll
      dropMarkedPlaceHere(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [map]);

  // Mobil: långtryck på tom karta. State (timer + startpunkt) lever i refs — ren DOM-lyssnare,
  // inget behov av re-render mellan touchstart/touchmove/touchend.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();

    const cancel = () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      startRef.current = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { cancel(); return; } // pinch/flerfingertryck ≠ långtryck
      if (isOnInteractiveTarget(e.target)) return; // tryck på befintlig markör/kontroll/popup
      const touch = e.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY };
      timerRef.current = setTimeout(() => {
        const start = startRef.current;
        if (!start) return; // avbrutet av touchmove/touchend innan timern slog till
        const rect = container.getBoundingClientRect();
        const point = L.point(start.x - rect.left, start.y - rect.top);
        const latlng = map.containerPointToLatLng(point);
        cancel();
        dropMarkedPlaceHere(latlng.lat, latlng.lng);
      }, LONG_PRESS_MS);
    };

    const onTouchMove = (e: TouchEvent) => {
      const start = startRef.current;
      if (!start || e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (exceedsMoveThreshold(touch.clientX - start.x, touch.clientY - start.y)) cancel(); // blev en panorering
    };

    // touchend/touchcancel innan timern slår till = kort tryck → inget att göra, avbryt bara.
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', cancel, { passive: true });
    container.addEventListener('touchcancel', cancel, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', cancel);
      container.removeEventListener('touchcancel', cancel);
      cancel();
    };
  }, [map]);
};
