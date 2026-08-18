import React from 'react';
import { Accessibility, Check } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAccessibility, type FontScale } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';

// WCAG-inställningsmeny i toppnavigeringen: textstorlek, högkontrast, reducerad rörelse.
// onSelect e.preventDefault() håller menyn öppen så man kan ställa in flera saker.
export const AccessibilityMenu: React.FC = () => {
  const { fontScale, setFontScale, highContrast, setHighContrast, reducedMotion, setReducedMotion } = useAccessibility();
  const sv = useLanguage().language === 'sv';
  const t = sv
    ? { label: 'Tillgänglighet', text: 'Textstorlek', normal: 'Normal', large: 'Stor', xl: 'Störst', contrast: 'Högkontrast', motion: 'Reducera rörelse', aria: 'Tillgänglighetsinställningar' }
    : { label: 'Accessibility', text: 'Text size', normal: 'Normal', large: 'Large', xl: 'Largest', contrast: 'High contrast', motion: 'Reduce motion', aria: 'Accessibility settings' };

  const sizes: { v: FontScale; l: string }[] = [{ v: 1, l: t.normal }, { v: 1.15, l: t.large }, { v: 1.3, l: t.xl }];
  const row = 'flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.aria}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <Accessibility className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 bg-slate-900 border-slate-700 text-slate-200">
        <DropdownMenuLabel className="text-slate-400">{t.label}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        <div className="px-2 py-1 text-xs text-slate-400">{t.text}</div>
        <div className="flex gap-1 px-2 pb-2" role="group" aria-label={t.text}>
          {sizes.map((s) => (
            <button
              key={s.v}
              type="button"
              aria-pressed={fontScale === s.v}
              onClick={() => setFontScale(s.v)}
              className={[
                'flex-1 rounded border px-1.5 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold',
                fontScale === s.v ? 'border-gold bg-gold/15 text-gold font-semibold' : 'border-slate-600 text-slate-300 hover:bg-slate-800',
              ].join(' ')}
              style={{ fontSize: `${0.75 * s.v}rem` }}
            >A</button>
          ))}
        </div>
        <DropdownMenuSeparator className="bg-slate-700" />
        <button type="button" role="switch" aria-checked={highContrast} className={row} onClick={() => setHighContrast(!highContrast)}>
          <span>{t.contrast}</span>
          <span className={`flex h-4 w-4 items-center justify-center rounded border ${highContrast ? 'border-gold bg-gold/20' : 'border-slate-600'}`}>
            {highContrast && <Check className="h-3 w-3 text-gold" />}
          </span>
        </button>
        <button type="button" role="switch" aria-checked={reducedMotion} className={row} onClick={() => setReducedMotion(!reducedMotion)}>
          <span>{t.motion}</span>
          <span className={`flex h-4 w-4 items-center justify-center rounded border ${reducedMotion ? 'border-gold bg-gold/20' : 'border-slate-600'}`}>
            {reducedMotion && <Check className="h-3 w-3 text-gold" />}
          </span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
