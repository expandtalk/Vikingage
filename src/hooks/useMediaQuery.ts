import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  // Lazy init från matchMedia REDAN vid första render — inte false→true efter mount. Annars hann
  // t.ex. legendens default-seed köra med desktop-defaults innan isMobile blev true, och den
  // kurerade mobil-vyn slog aldrig igenom (Daniel 2026-08-06). Guard för ev. icke-DOM-miljö.
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addListener(listener);

    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

// Common breakpoint hooks
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');