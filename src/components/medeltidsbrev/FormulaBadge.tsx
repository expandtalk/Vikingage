import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Flags charters that are formula/template letters (is_formula from
 * sdhk_is_formula) — not a genuine individual original, e.g. the Öberg
 * "Formularia Lincopensia" series. Purely informational; derived by the
 * step-1 migration from print_ref / comments, not asserted as fact about
 * the physical letter itself.
 */
export const FormulaBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const sv = useLanguage().language === 'sv';
  return (
    <span
      title={
        sv
          ? 'Formulärmall — inte ett bevarat, individuellt original (härlett ur tryckreferens/kommentar)'
          : 'Template letter — not a preserved, individual original (derived from print reference/comment)'
      }
      className={`inline-flex items-center rounded border border-amber-700/50 bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-400 ${className}`}
    >
      {sv ? 'Formulär' : 'Template'}
    </span>
  );
};
