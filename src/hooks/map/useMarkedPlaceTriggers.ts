// src/hooks/map/useMarkedPlaceTriggers.ts
import { useEffect } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';
import { addMarkedPlace } from '@/hooks/useMarkedPlaces';

// Lägger en "📌 Markera"-knapp i ALLA kartpopuper (Task 4, väg 2 av 2 — se
// useMapCreateMarkedPlace.ts för väg 1, långtryck/Shift+klick på tom karta). Speglar
// useReachProbeTriggers.ts / useFieldNavTargetTriggers.ts: EN mekanism registrerad en gång i
// useMapInitialization, injicerar knappen i action-raden på 'popupopen' — funkar på alla
// befintliga OCH framtida objektpopuper utan att varje enskilt lager behöver bygga in det själv.
//
// Koordinat + namn hämtas UTESLUTANDE ur popupens egen bindning (popup.getLatLng() + rubriken i
// popupens DOM) — exakt samma källa som "Led mig hit" redan läser. Aldrig omhärledd/gissad.
interface Props { map: L.Map | null }

const BTN_STYLE =
  'margin-top:6px;margin-left:6px;padding:4px 8px;border:1px solid #dc2626;border-radius:6px;' +
  'background:transparent;color:#dc2626;cursor:pointer;font-size:11px';

// Etikett ur popupens första rubrik/fetstil (samma idé som i de andra trigger-hookarna), annars
// koordinat — ALDRIG ett påhittat namn.
const labelFromPopup = (container: HTMLElement, ll: L.LatLng): string => {
  const el = container.querySelector('h1,h2,h3,strong,b');
  const t = el?.textContent?.trim();
  return t && t.length > 0 ? t : `Punkt ${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)}`;
};

export const useMarkedPlaceTriggers = ({ map }: Props) => {
  useEffect(() => {
    if (!map) return;
    const onPopupOpen = (e: L.PopupEvent) => {
      const popup = e.popup;
      const container = popup.getElement()?.querySelector('.leaflet-popup-content') as HTMLElement | null;
      if (!container || container.querySelector('[data-marked-place-trigger]')) return; // redan injicerad
      // Markerade platsers EGNA popup (Task 3, useMapMarkedPlaces.ts) har redan "Ta bort"/"Väg
      // hit" — en "Markera"-knapp där skulle bara skapa en dubblett av nålen som popupen redan
      // tillhör. Den filen sätter data-marked-place-popup på sin container just för denna koll.
      if (container.dataset.markedPlacePopup) return;
      const ll = popup.getLatLng();
      if (!ll) return;
      const label = labelFromPopup(container, ll);
      const btn = document.createElement('button');
      btn.setAttribute('data-marked-place-trigger', '1');
      btn.type = 'button';
      btn.textContent = '📌 Markera';
      btn.style.cssText = BTN_STYLE;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        addMarkedPlace({ lat: ll.lat, lng: ll.lng, label });
        toast.success('Plats markerad');
        map.closePopup(popup);
      });
      container.appendChild(btn);
    };
    map.on('popupopen', onPopupOpen);
    return () => { map.off('popupopen', onPopupOpen); };
  }, [map]);
};
