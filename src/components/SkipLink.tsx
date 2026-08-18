import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// "Hoppa till innehåll" — första fokuserbara elementet på sidan (WCAG 2.4.1). Hittar sidans
// <main> dynamiskt (fungerar på alla sidor utan att varje sida behöver ett id) och fokuserar det.
export const SkipLink: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const main = document.querySelector('main') as HTMLElement | null;
    if (main) {
      e.preventDefault();
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.scrollIntoView({ block: 'start' });
    }
  };
  return (
    <a href="#main-content" className="skip-link" onClick={onClick}>
      {sv ? 'Hoppa till innehåll' : 'Skip to content'}
    </a>
  );
};
