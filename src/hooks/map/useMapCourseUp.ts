import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFieldNav } from '@/hooks/useFieldNav';
import { useDrivingMode, useCourseUp } from '@/hooks/useDrivingMode';

// Färd-upp (course-up): roterar kartan så färdriktningen pekar UPPÅT i billäget.
// Leaflet roterar inte natively → CSS-transform på .leaflet-container (roten; Leaflet sätter
// aldrig transform där). Positionen hålls centrerad av följningen, så rotation runt centrum
// håller mig kvar i mitten. Kontroll-containern MOTROTERAS/mot-skalas exakt → zoomknappar +
// attribution står upprätt och oskalade. scale(1.42) fyller hörnen (≥√2 för 45°). Bäringen
// låg-pass-filtreras (kortaste vinkelväg) så rotationen inte rycker av GPS-brus.
//
// AKTIV endast när: billäge PÅ + courseUp PÅ + följning PÅ + giltig bäring. När man drar
// kartan slår följningen av → rotationen tas bort (norr-upp) och kart-tap blir exakt igen.
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }

const SCALE = 1.42;

export const useMapCourseUp = ({ map, isMapReady }: Props) => {
  const driving = useDrivingMode();
  const courseUp = useCourseUp();
  const { pos, following } = useFieldNav();
  const heading = pos?.headingDeg ?? null;
  const smoothedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    const container = map.getContainer();
    const controls = container.querySelector('.leaflet-control-container') as HTMLElement | null;
    const active = driving && courseUp && following && heading != null && Number.isFinite(heading);

    if (!active) {
      container.style.transition = 'transform 0.4s ease-out';
      container.style.transform = '';
      container.style.transformOrigin = '';
      if (controls) { controls.style.transform = ''; controls.style.transformOrigin = ''; }
      smoothedRef.current = null;
      return;
    }

    // Låg-pass på bäringen (kortaste vinkelväg) → mjuk rotation.
    let h = heading as number;
    const prev = smoothedRef.current;
    if (prev != null) {
      const d = ((h - prev + 540) % 360) - 180;
      h = prev + d * 0.35;
    }
    smoothedRef.current = h;

    container.style.transformOrigin = 'center center';
    container.style.transition = 'transform 0.3s linear';
    container.style.transform = `scale(${SCALE}) rotate(${-h}deg)`;
    // Motverka exakt (samma origin) → kontroller upprätt + oskalade.
    if (controls) {
      controls.style.transformOrigin = 'center center';
      controls.style.transition = 'transform 0.3s linear';
      controls.style.transform = `rotate(${h}deg) scale(${1 / SCALE})`;
    }
  }, [map, isMapReady, driving, courseUp, following, heading]);

  // Städa vid avmontering/kartbyte så ingen roterad container blir kvar.
  useEffect(() => () => {
    try {
      const c = map?.getContainer();
      if (c) { c.style.transform = ''; c.style.transformOrigin = ''; }
      const ctr = c?.querySelector('.leaflet-control-container') as HTMLElement | null;
      if (ctr) { ctr.style.transform = ''; ctr.style.transformOrigin = ''; }
    } catch { /* noop */ }
  }, [map]);
};
