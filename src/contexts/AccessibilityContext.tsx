import React, { createContext, useContext, useEffect, useState } from 'react';

// WCAG-inställningar som användaren styr själv: textstorlek, högkontrast, reducerad rörelse.
// Persistas i localStorage och appliceras på <html> (CSS i index.css läser --a11y-font-scale +
// data-contrast / data-motion). Respekterar även OS-inställningen prefers-reduced-motion som default.

export type FontScale = 1 | 1.15 | 1.3;

interface AccessibilityState {
  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
}

const Ctx = createContext<AccessibilityState | undefined>(undefined);

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v == null ? fallback : (JSON.parse(v) as T); }
  catch { return fallback; }
}

const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScale] = useState<FontScale>(() => read<FontScale>('a11y-font', 1));
  const [highContrast, setHighContrast] = useState<boolean>(() => read<boolean>('a11y-contrast', false));
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => read<boolean>('a11y-motion', prefersReducedMotion()));

  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--a11y-font-scale', String(fontScale));
    if (highContrast) el.setAttribute('data-contrast', 'high'); else el.removeAttribute('data-contrast');
    if (reducedMotion) el.setAttribute('data-motion', 'reduced'); else el.removeAttribute('data-motion');
    try {
      localStorage.setItem('a11y-font', JSON.stringify(fontScale));
      localStorage.setItem('a11y-contrast', JSON.stringify(highContrast));
      localStorage.setItem('a11y-motion', JSON.stringify(reducedMotion));
    } catch { /* private mode */ }
  }, [fontScale, highContrast, reducedMotion]);

  return (
    <Ctx.Provider value={{ fontScale, setFontScale, highContrast, setHighContrast, reducedMotion, setReducedMotion }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAccessibility = (): AccessibilityState => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return c;
};
