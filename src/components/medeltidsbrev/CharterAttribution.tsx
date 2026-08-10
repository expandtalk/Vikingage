import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const CharterAttribution: React.FC = () => {
  const sv = useLanguage().language === 'sv';
  return (
    <p className="text-xs text-slate-500 leading-relaxed">
      {sv ? 'Regest: ' : 'Abstract: '}
      <span className="text-slate-400">Svenskt Diplomatariums huvudkartotek (SDHK), Riksarkivet</span>
      {' — '}
      <a href="https://creativecommons.org/licenses/by/4.0/deed.sv" target="_blank" rel="noopener noreferrer"
         className="underline hover:text-[hsl(var(--gold))]">CC BY 4.0</a>.{' '}
      {sv
        ? 'Bearbetad: datum- och ortstolkning tillagd.'
        : 'Adapted: derived date/place interpretation added.'}
    </p>
  );
};
