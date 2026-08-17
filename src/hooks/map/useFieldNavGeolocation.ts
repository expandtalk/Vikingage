// src/hooks/map/useFieldNavGeolocation.ts
import { useEffect, useRef } from 'react';
import { useFieldNav, setFieldNavPos, setFieldNavError } from '@/hooks/useFieldNav';
import { resolveHeading } from '@/utils/fieldNav';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useTravelMode } from '@/hooks/useTravelMode';

// EN watcher, ETT gate: startar watchPosition + (om tillgängligt) enhetsorientering när
// fältläget är aktivt (opt-in HUD) ELLER kartan visas på mobil/i billäge (alltid-på "här"-markör,
// Task 2) — och river ALLT i cleanup när ingen av dessa gäller längre. `enabled` matar bara
// `setFieldNavPos` (som INTE rör `active`) — visningen av "här"-markören är alltså frikopplad
// från att fältläge-HUD:en öppnas. Nekad GPS → ingen markör (aldrig en gissad position).
// Kompassen är fallback när man står still; iOS-behörigheten begärs av Near me (enda framdörren,
// requestCompassPermission ur useFieldNav) när fältläge startas — i alltid-på-läget faller vi
// tillbaka på GPS-kurs (`heading` från Geolocation) tills/om användaren aktiverar fältläget.
export const useFieldNavGeolocation = () => {
  const { active, dismissed } = useFieldNav();
  const isMobile = useIsMobile();
  const mode = useTravelMode();
  // dismissed (användaren tryckte X) bryter mobilens always-on-gate → watchern + "här"-markören
  // stängs faktiskt av. startFieldNav nollar dismissed och sätter igång igen.
  const enabled = !dismissed && (active || isMobile || mode === 'car' || mode === 'boat');
  const compassRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!('geolocation' in navigator)) { setFieldNavError('Platstjänst stöds inte i denna webbläsare'); return; }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setFieldNavError('Platstjänst kräver säker anslutning (https).');
      return;
    }

    // Enhetens kompass → compassRef (läses vid varje GPS-uppdatering som fallback).
    const onOrient = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      const wk = e.webkitCompassHeading; // iOS Safari: redan grader medurs från norr
      if (wk != null && Number.isFinite(wk)) { compassRef.current = wk; return; }
      // deviceorientationabsolute (Android/Chrome): alpha = grader MOTURS från norr → medurs.
      if ((e as DeviceOrientationEvent).absolute && e.alpha != null && Number.isFinite(e.alpha)) {
        compassRef.current = (360 - e.alpha) % 360;
      }
    };
    window.addEventListener('deviceorientationabsolute', onOrient as EventListener);
    window.addEventListener('deviceorientation', onOrient as EventListener);

    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        const { latitude, longitude, accuracy, heading, speed } = p.coords;
        const r = resolveHeading({
          gpsHeading: heading ?? null,
          gpsSpeed: speed ?? null,
          compassHeading: compassRef.current,
        });
        setFieldNavPos({
          lat: latitude, lng: longitude, accuracy,
          headingDeg: r.deg, headingSource: r.source, speed: speed ?? null,
        });
      },
      (err) => setFieldNavError(
        err.code === err.PERMISSION_DENIED ? 'Platsåtkomst nekad — tillåt plats i webbläsarinställningarna'
        : err.code === err.POSITION_UNAVAILABLE ? 'Positionen kunde inte fastställas (ingen GPS/nätverksplats).'
        : 'Tidsgränsen gick ut — försök igen.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 },
    );

    return () => {
      try { navigator.geolocation.clearWatch(watchId); } catch { /* noop */ }
      window.removeEventListener('deviceorientationabsolute', onOrient as EventListener);
      window.removeEventListener('deviceorientation', onOrient as EventListener);
      compassRef.current = null;
    };
  }, [enabled]);
};
