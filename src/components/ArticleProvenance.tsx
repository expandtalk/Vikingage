import React from 'react';

// Återanvändbar proveniens-/redaktionsnot för källbelagda artiklar.
// Redovisar (1) källorna, (2) att analysen gjorts med AI-stöd, och (3) mänsklig
// granskning/godkännande (redaktörens ansvar). Del av plattformens hederlighetslinje:
// belagt eller markerat obelagt — och alltid transparent om metod.

interface Props {
  sv: boolean;
  sources: string[];
  reviewer?: string;      // redaktör som kontrollerat & godkänt
  reviewedDate?: string;  // ISO-datum, t.ex. '2026-08-16'
  className?: string;
}

export const ArticleProvenance: React.FC<Props> = ({
  sv, sources, reviewer = 'Daniel Larsson', reviewedDate, className = '',
}) => (
  <section className={`mt-8 rounded-lg border border-slate-700/70 bg-slate-900/30 p-4 text-[12px] leading-relaxed text-slate-400 ${className}`}>
    <p className="mb-1 font-medium text-slate-300">{sv ? 'Källor' : 'Sources'}</p>
    <p className="mb-3">{sources.join(' · ')}</p>
    <p className="border-t border-slate-700/70 pt-3 text-slate-400">
      <span className="font-medium text-slate-300">{sv ? 'Metod & granskning: ' : 'Method & review: '}</span>
      {sv
        ? `Materialet har sammanställts och analyserats med AI-stöd och därefter kontrollerats och godkänts av ${reviewer}.`
        : `The material was compiled and analysed with AI assistance, then checked and approved by ${reviewer}.`}
      {reviewedDate ? ` (${reviewedDate})` : ''}
      {' '}
      {sv
        ? 'Påståenden är märkta belagt, tolkning eller hypotes; obelagt anges som sådant.'
        : 'Claims are labelled attested, interpretation or hypothesis; unverified points are marked as such.'}
    </p>
  </section>
);
