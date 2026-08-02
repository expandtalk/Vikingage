// src/hooks/map/useFieldNavWakeLock.ts
import { useEffect, useRef } from 'react';
import { useFieldNav } from '@/hooks/useFieldNav';

// Screen Wake Lock API är inte i projektets standard-lib-typer ännu — smal cast istället
// för att dra in nya libs.
interface WakeLockSentinelLike {
  release(): Promise<void>;
  released: boolean;
}
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> };
};

// Håller skärmen vaken medan fältläget (live-följning) är aktivt — annars stängs skärmen av
// efter ~15 min och navigeringen/GPS-följningen tappas ur sikte medan man kör.
// Wake locks släpps automatiskt av webbläsaren när fliken döljs (t.ex. skärmen låses/byter app);
// visibilitychange-lyssnaren återtar låset när sidan blir synlig igen, om fältläget fortfarande
// är aktivt.
export const useFieldNavWakeLock = (): void => {
  const { active } = useFieldNav();
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!active) return;

    const nav = navigator as NavigatorWithWakeLock;
    if (!('wakeLock' in navigator) || !nav.wakeLock) return;

    const requestLock = async () => {
      try {
        const sentinel = await nav.wakeLock!.request('screen');
        sentinelRef.current = sentinel;
      } catch {
        // Icke-fatalt — t.ex. fliken inte fokuserad eller sidan inte servad över https.
      }
    };

    void requestLock();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active) {
        void requestLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel) {
        void sentinel.release().catch(() => { /* noop */ });
      }
    };
  }, [active]);
};
