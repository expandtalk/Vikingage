// src/hooks/map/useMapCreateMarkedPlace.ts
import { useEffect } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';
import { addMarkedPlace } from '@/hooks/useMarkedPlaces';
import { useRuler } from '@/hooks/useRuler';
import { hasInteractiveVectorLayerAt } from './canvasFeatureHitTest';

// Skapar en röd "markerad plats"-nål genom Shift+klick på tom karta (Task 4, väg 1 av 2 — se
// useMarkedPlaceTriggers.ts för väg 2, popup-knappen "📌 Markera").
//
// FIX ROUND 1 (review Needs-fixes, Daniel godkänd rebuild):
//   - Mobilens egen 550ms-långtryckstimer TOGS BORT HÄRIFRÅN. Appen har redan en långtryck →
//     "Välj åtgärd"-meny (useReachProbeTriggers.ts, via native contextmenu), och den menyn får
//     redan en "📌 Markera"-knapp injicerad av useMarkedPlaceTriggers (popupopen). Två parallella
//     långtryck-mekanismer på samma gest kunde racea varandra (ett långtryck kunde både tyst
//     släppa en nål OCH öppna åtgärdsmenyn). Mobil markering går nu ENDAST via den befintliga
//     menyns knapp — ingen ny mobilgest här.
//   - Desktop Shift+klick behålls, men med två nya spärrar (se nedan): kartan skapas med
//     preferCanvas: true (useMapInstance.ts) så canvas-renderade vektorlager (circleMarker/circle
//     utan egen DOM-nod per feature) missades tidigare av DOM-klasskollen, och andra funktioners
//     egna kart-klickfångare (linjal, "Near me"-nålsläge) kunde trigga SAMTIDIGT som denna.
//
// Varför Shift+klick: vanligt klick används redan för panorering/avmarkering — ett modifier-klick
// är minsta möjliga tillägg som inte kan triggas av misstag.
interface Props { map: L.Map | null }

const isOnInteractiveTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    '.leaflet-interactive, .leaflet-marker-icon, .leaflet-control, .leaflet-popup, .leaflet-tooltip',
  );
};

// "Near me"s "Släpp en nål på kartan"-läge (useMapNearMe.ts, __nearMePickLocation) har INGEN egen
// reaktiv store-flagga att läsa (till skillnad från linjalen, se useRuler() nedan) — enda
// befintliga signalen är att den, precis som linjalen, sätter samma crosshair-cursor på
// kartcontainern medan den väntar på nästa klick. Minimal befintlig signal, inte uppfunnen.
const isCrosshairPickModeActive = (map: L.Map): boolean => map.getContainer().style.cursor === 'crosshair';

const dropMarkedPlaceHere = (lat: number, lng: number) => {
  addMarkedPlace({ lat, lng });
  toast.success('Plats markerad');
};

export const useMapCreateMarkedPlace = ({ map }: Props) => {
  // Linjalens EGNA reaktiva aktiv-flagga (samma store som useMapRuler läser) — den auktoritativa
  // signalen för "linjalläget fångar nästa kartklick just nu".
  const { active: rulerActive } = useRuler();

  useEffect(() => {
    if (!map) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      const orig = e.originalEvent;
      if (!orig?.shiftKey) return; // vanligt klick ska panorera/avmarkera precis som idag
      if (isOnInteractiveTarget(orig.target)) return; // klick landade på en befintlig DOM-markör/kontroll

      // Läges-spärr: en annan funktion väntar redan på "nästa kartklick" — låt DEN vinna, drop:a
      // inget här (annars fyrar båda på samma klick).
      if (rulerActive) return;
      if (isCrosshairPickModeActive(map)) return;

      // Canvas-medveten spärr: DOM-kollen ovan ser inte canvas-renderade vektorlager (circleMarker/
      // circle utan egen DOM-nod). Hit-testa mot Leaflets EGEN interna primitiv (samma kod Canvas-
      // renderaren använder för sitt eget klick) innan vi stämplar en ny nål.
      const layerPoint = map.latLngToLayerPoint(e.latlng);
      if (hasInteractiveVectorLayerAt(map, layerPoint)) return;

      dropMarkedPlaceHere(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [map, rulerActive]);
};
