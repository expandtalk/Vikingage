import { useEffect } from 'react';
import L from 'leaflet';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { startFieldNav, setFieldNavTarget, getFieldNavSnapshot } from '@/hooks/useFieldNav';

// Lägger en "Led mig hit"-knapp i ALLA kartpopuper (mobil) + exponerar window.__fieldNavTarget så
// popup-HTML (byggd utanför React) kan sätta mål direkt. Speglar useReachProbeTriggers.
// Sätter mål och startar fältläget (om det inte redan är aktivt) — ORDNING: start FÖRE settarget,
// annars nollar startFieldNav målet.
const BTN_STYLE =
  'margin-top:6px;margin-left:6px;padding:4px 8px;border:1px solid #f59e0b;border-radius:6px;' +
  'background:transparent;color:#f59e0b;cursor:pointer;font-size:11px';

const leadTo = (lat: number, lng: number, label: string, uncertaintyNote?: string) => {
  const isMobileViewport = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  if (!getFieldNavSnapshot().active && isMobileViewport) startFieldNav();
  setFieldNavTarget({ lat, lng, label, uncertaintyNote });
};

// Etikett ur popupens första rubrik/fetstil (samma idé som reach-probe), annars koordinat.
const labelFromPopup = (container: HTMLElement, ll: L.LatLng): string => {
  const el = container.querySelector('h1,h2,h3,strong,b');
  const t = el?.textContent?.trim();
  return t && t.length > 0 ? t : `Punkt ${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)}`;
};

export const useFieldNavTargetTriggers = ({ map }: { map: L.Map | null }) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Brygga alltid tillgänglig (även desktop) för popup-HTML som själv vill sätta mål.
    (window as unknown as { __fieldNavTarget?: (a: number, b: number, l: string, u?: string) => void })
      .__fieldNavTarget = (lat, lng, label, uncertaintyNote) => leadTo(lat, lng, label, uncertaintyNote);
    return () => {
      try { delete (window as unknown as { __fieldNavTarget?: unknown }).__fieldNavTarget; } catch { /* noop */ }
    };
  }, []);

  useEffect(() => {
    if (!map || !isMobile) return; // knapp-injektionen bara på mobil
    const onPopupOpen = (e: L.PopupEvent) => {
      const popup = e.popup;
      const container = popup.getElement()?.querySelector('.leaflet-popup-content') as HTMLElement | null;
      if (!container || container.querySelector('[data-field-nav-target]')) return;
      const ll = popup.getLatLng();
      if (!ll) return;
      const label = labelFromPopup(container, ll);
      const btn = document.createElement('button');
      btn.setAttribute('data-field-nav-target', '1');
      btn.type = 'button';
      btn.textContent = '🧭 Led mig hit';
      btn.style.cssText = BTN_STYLE;
      btn.addEventListener('click', (ev) => { ev.stopPropagation(); leadTo(ll.lat, ll.lng, label); map.closePopup(popup); });
      container.appendChild(btn);
    };
    map.on('popupopen', onPopupOpen);
    return () => { map.off('popupopen', onPopupOpen); };
  }, [map, isMobile]);
};
