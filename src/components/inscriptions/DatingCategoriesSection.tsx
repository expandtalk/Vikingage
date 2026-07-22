import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

// Datering-kategorisering av runstenarna efter Gräslunds STILKRONOLOGI (style_group i
// runic_inscriptions) — den vedertagna dateringsmetoden för sena vikingatida runstenar.
// Ingen datering hittas på: perioderna är Gräslunds publicerade intervall, och stenar utan
// style_group hamnar i "Odaterade". Källa: A-S. Gräslund, ristningsstilar (Fp/Pr 1–5/RAK).

interface Bucket {
  key: string; sv: string; en: string; range: string;
  styles: string[]; color: string;
}
// Style-grupp → periodhink. Intervall = Gräslunds kronologi (cirkavärden, redovisade).
const BUCKETS: Bucket[] = [
  { key: 'early', sv: 'Tidig (ca 980–1015)', en: 'Early (c. 980–1015)', range: '≈980–1015',
    styles: ['Rak', 'RAK', 'Kb', 'KB'], color: '#f97316' },
  { key: 'mid', sv: 'Mellersta (ca 1010–1070)', en: 'Middle (c. 1010–1070)', range: '≈1010–1070',
    styles: ['Fp', 'Pr 1', 'Pr 2', 'Pr 3', 'Pr1', 'Pr2', 'Pr3'], color: '#eab308' },
  { key: 'late', sv: 'Sen (ca 1070–1130)', en: 'Late (c. 1070–1130)', range: '≈1070–1130',
    styles: ['Pr 4', 'Pr 5', 'Pr4', 'Pr5'], color: '#84cc16' },
];

const bucketFor = (style: string | null): string => {
  if (!style) return 'undated';
  const s = style.trim();
  // Tag första stil-token vid kombinationer (t.ex. "Pr 3/Pr 4" → Pr 3).
  const first = s.split('/')[0].trim();
  for (const b of BUCKETS) if (b.styles.includes(first) || b.styles.includes(s)) return b.key;
  return 'other';
};

export const DatingCategoriesSection: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: rows } = useQuery({
    queryKey: ['runestone-style-groups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('runic_inscriptions').select('style_group');
      if (error) throw error;
      return (data ?? []) as { style_group: string | null }[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (rows ?? []).forEach((r) => { const k = bucketFor(r.style_group); c[k] = (c[k] ?? 0) + 1; });
    return c;
  }, [rows]);

  if (!rows?.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <CalendarClock className="h-6 w-6 text-gold" />
        {sv ? 'Datering (stilkronologi)' : 'Dating (style chronology)'}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {sv
          ? 'Sena vikingatida runstenar dateras efter ristningsstil (Gräslund). Fördelningen bygger på style_group i databasen — stenar utan stilbedömning räknas som odaterade.'
          : 'Late Viking-Age runestones are dated by carving style (Gräslund). The distribution uses style_group in the database — stones without a style assessment count as undated.'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {BUCKETS.map((b) => (
          <div key={b.key} className="rounded-lg border border-border bg-card/60 p-3">
            <div className="h-1.5 w-10 rounded mb-2" style={{ background: b.color }} />
            <div className="text-2xl font-bold text-foreground tabular-nums">{(counts[b.key] ?? 0).toLocaleString('sv-SE')}</div>
            <div className="text-sm text-foreground">{sv ? b.sv : b.en}</div>
          </div>
        ))}
        <div className="rounded-lg border border-border bg-card/40 p-3">
          <div className="h-1.5 w-10 rounded mb-2 bg-slate-600" />
          <div className="text-2xl font-bold text-muted-foreground tabular-nums">
            {((counts['undated'] ?? 0) + (counts['other'] ?? 0)).toLocaleString('sv-SE')}
          </div>
          <div className="text-sm text-muted-foreground">{sv ? 'Odaterade / övriga stilar' : 'Undated / other styles'}</div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/70 mt-2">
        {sv
          ? 'Kronologi: Anne-Sofie Gräslund, ristningsstilar (RAK/Fp/Pr 1–5). Intervallen är cirkavärden.'
          : 'Chronology: Anne-Sofie Gräslund, carving styles (RAK/Fp/Pr 1–5). Ranges are approximate.'}
      </p>
    </section>
  );
};
