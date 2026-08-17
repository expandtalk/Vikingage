import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';

// Söktips / avancerad sök-hjälp (Daniel/Sture). Diskret hopfälld rad i sökpanelen; fälls ut med
// syntax + exempel. Källkritisk not: sök styr synlighet, aldrig fakta; kategorier är härledda.
interface Tip { ex: string; sv: string; en: string }
const TIPS: Tip[] = [
  { ex: 'U 11', sv: 'runsten-signum (landskapskod + nummer)', en: 'runestone signum (province code + number)' },
  { ex: '"Kung Valdemars segelled"', sv: 'exakt fras — hela uttrycket', en: 'exact phrase' },
  { ex: 'Uppsala', sv: 'ort, socken, stad, landskap', en: 'place, parish, town, province' },
  { ex: 'Gustav', sv: 'personnamn → namnbetydelse + individer (kungar, ristare, helgon)', en: 'person name → meaning + individuals' },
  { ex: 'runologi', sv: 'ämne/kategori (t.ex. i Fornvännen)', en: 'subject/category (e.g. in Fornvännen)' },
  { ex: 'Malmo', sv: 'utan prickar funkar (Malmö) — men lägre rankat', en: 'ASCII without diacritics works (lower-ranked)' },
];

export const SearchHelp: React.FC<{ sv: boolean }> = ({ sv }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-slate-800 px-4 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-200"
        aria-expanded={open}
      >
        <HelpCircle className="h-3.5 w-3.5" />
        {sv ? 'Söktips' : 'Search tips'}
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          <ul className="space-y-1">
            {TIPS.map((t) => (
              <li key={t.ex} className="flex flex-wrap items-baseline gap-2 text-[12px]">
                <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-200">{t.ex}</code>
                <span className="text-slate-400">{sv ? t.sv : t.en}</span>
              </li>
            ))}
          </ul>
          <p className="pt-1 text-[11px] text-slate-500">
            {sv
              ? 'Å, Ä, Ö skiljs (vala ≠ väla ≠ våla). Kategorier är härledda, inte auktoritativ klassning. Sök styr synlighet — aldrig fakta.'
              : 'Å, Ä, Ö are distinct (vala ≠ väla ≠ våla). Categories are derived, not authoritative. Search affects visibility — never facts.'}
          </p>
        </div>
      )}
    </div>
  );
};
