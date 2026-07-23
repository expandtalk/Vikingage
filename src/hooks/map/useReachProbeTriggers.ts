import { useEffect } from 'react';
import L from 'leaflet';
import { setProbe } from '@/hooks/useProximityProbe';

// EN enda mekanism som gör räckvidds-sonden ("piltavlan") tillgänglig ÖVERALLT —
// inte handinklistrad knapp per lager. Två utlösare, båda går till samma setProbe:
//
//   1. popupopen  — injicerar en "Mät räckvidd härifrån"-knapp i VARJE popup som
//                   öppnas (alla lager, nuvarande som framtida). Läser popupens
//                   egen koordinat och en etikett ur popup-DOM:en.
//   2. contextmenu (högerklick) — sätter sonden på en godtycklig punkt (bergsfot,
//                   vadställe) som inte är ett katalogfört objekt.
//
// Registreras en gång i useMapInitialization.
interface Props { map: L.Map | null }

const BTN_STYLE =
  'margin-top:8px;width:100%;font-size:11px;padding:5px 8px;border-radius:6px;border:1px solid #f59e0b;background:#fef3c7;color:#78350f;cursor:pointer';

// Bästa möjliga etikett ur en godtycklig popup: första rubriken/fetstilen.
const labelFromPopup = (root: HTMLElement | null, lat: number, lng: number): string => {
  const head = root?.querySelector('h1,h2,h3,strong,b');
  const txt = head?.textContent?.trim().replace(/\s+/g, ' ');
  return txt && txt.length > 0 ? txt.slice(0, 80) : `Punkt ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

export const useReachProbeTriggers = ({ map }: Props) => {
  useEffect(() => {
    if (!map) return;

    // 1. Injicera sond-knappen i varje popup som öppnas.
    const onPopupOpen = (e: L.PopupEvent) => {
      const popup = e.popup;
      const container = popup.getElement()?.querySelector('.leaflet-popup-content') as HTMLElement | null;
      if (!container || container.querySelector('[data-reach-probe]')) return; // redan injicerad
      const ll = popup.getLatLng();
      if (!ll) return;
      const label = labelFromPopup(container, ll.lat, ll.lng);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.reachProbe = '1';
      btn.textContent = 'Mät räckvidd härifrån';
      btn.setAttribute('style', BTN_STYLE);
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setProbe(ll.lat, ll.lng, label);
        map.closePopup(popup);
      });
      container.appendChild(btn);
    };

    // 2. Högerklick var som helst → sond på den punkten.
    const onContextMenu = (e: L.LeafletMouseEvent) => {
      e.originalEvent?.preventDefault();
      setProbe(e.latlng.lat, e.latlng.lng, `Punkt ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
    };

    map.on('popupopen', onPopupOpen);
    map.on('contextmenu', onContextMenu);
    return () => {
      map.off('popupopen', onPopupOpen);
      map.off('contextmenu', onContextMenu);
    };
  }, [map]);
};
