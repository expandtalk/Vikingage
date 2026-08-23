import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Landmark, ScrollText } from 'lucide-react';

// BJÄLBOÄTTENS GODS & ARV — källkritisk PROVENANSANALYS (OpenAI-metoden, källgranskad): börja från
// DOKUMENTERADE ägarövergångar, inte "platser som sägs tillhöra ätten". Grupperat på provenansnivå
// 1–4. Data ur person_place_claims (gods/arv-relationer). Negativ kontroll (Ulvåsa) + kandidat
// (Vallersta) märks tydligt. AI-källa annoteras (transparens). Människa-i-loopen: primärkällor ej slutverifierade.

type Row = {
  place_label: string; relation_type: string; evidence_grade: string; coord_status: string;
  provenance_level: number | null; event: string | null; inheritance_chain: string | null;
  primary_source: string | null; uncertain: boolean; notes: string | null; analysis_source: string | null;
};

const LEVEL: Record<number, { sv: string; en: string; hint_sv: string }> = {
  1: { sv: 'Nivå 1 — explicit arv', en: 'Level 1 — explicit inheritance', hint_sv: 'Dokumentet säger uttryckligen "arv" (jure hereditario). Guldstandard.' },
  2: { sv: 'Nivå 2 — dokumenterad ägarkedja', en: 'Level 2 — documented ownership chain', hint_sv: 'Ägarkedja belagd, men inte uttryckligen som arv.' },
  3: { sv: 'Nivå 3 — dynastisk egendom', en: 'Level 3 — dynastic property', hint_sv: 'Ätten äger senare, men inträdet i familjen kan inte säkert rekonstrueras.' },
  4: { sv: 'Nivå 4 — hypotes', en: 'Level 4 — hypothesis', hint_sv: 'Intressant hypotes, ingen bevisad arvskedja.' },
};
const GRADE: Record<string, string> = { 'A+': '#10b981', 'A': '#f59e0b', 'B': '#60a5fa', 'C': '#94a3b8', 'D': '#64748b' };

export const BjalboEstates: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: rows = [] } = useQuery({
    queryKey: ['bjalbo-estates'],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const { data } = await (supabase as any).from('person_place_claims')
        .select('place_label,relation_type,evidence_grade,coord_status,provenance_level,event,inheritance_chain,primary_source,uncertain,notes,analysis_source')
        .ilike('person_name', 'Birger jarl')
        .in('relation_type', ['inheritance', 'estate', 'purchase', 'office_property', 'uncertain'])
        .order('provenance_level', { ascending: true });
      return (data ?? []) as Row[];
    },
  });
  if (!rows.length) return null;
  const aiSource = rows.find((r) => r.analysis_source)?.analysis_source;
  const byLevel = (lvl: number) => rows.filter((r) => (r.provenance_level ?? 9) === lvl);

  return (
    <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900/60 p-5 text-left">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
        <Landmark className="h-4 w-4" /> {sv ? 'Bjälboättens gods & arv — provenansanalys' : "The Bjälbo dynasty's estates & inheritance"}
      </div>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-slate-300">
        {sv
          ? 'Källkritisk metod: vi utgår från DOKUMENTERADE ägarövergångar och följer dem bakåt/framåt genom ättens succession — inte från platser som traditionellt tillskrivits Birger jarl. Varje post graderas på provenansnivå 1–4.'
          : 'Source-critical method: we start from documented ownership transfers and follow them through the dynastic succession — not from places traditionally attributed to Birger jarl. Each entry is graded by provenance level 1–4.'}
      </p>

      {[1, 2, 3, 4].map((lvl) => {
        const items = byLevel(lvl);
        if (!items.length) return null;
        return (
          <div key={lvl} className="mb-4 last:mb-0">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {sv ? LEVEL[lvl].sv : LEVEL[lvl].en} <span className="font-normal normal-case text-slate-500">— {LEVEL[lvl].hint_sv}</span>
            </div>
            <ul className="space-y-2">
              {items.map((r) => (
                <li key={r.place_label} className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: GRADE[r.evidence_grade] ?? '#94a3b8' }} />
                    <span className="font-semibold text-slate-100">{r.place_label}</span>
                    <span className="rounded border border-slate-600 px-1.5 text-[10px] text-slate-300">{r.evidence_grade}</span>
                    {r.relation_type === 'uncertain' && <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 text-[10px] text-red-200">{sv ? 'negativ kontroll — ej Birger-gods' : 'negative control'}</span>}
                    {r.coord_status === 'none' && <span className="text-[10px] text-slate-500">{sv ? 'ej kartlagd' : 'not mapped'}</span>}
                  </div>
                  {r.event && <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{r.event}</p>}
                  {r.inheritance_chain && <p className="mt-1 text-[11px] leading-snug text-amber-200/80">↳ {r.inheritance_chain}</p>}
                  {r.primary_source && <p className="mt-0.5 text-[10px] text-slate-500">{sv ? 'Källa' : 'Source'}: {r.primary_source}</p>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="mt-3 flex items-start gap-2 border-t border-slate-700 pt-3 text-[11px] leading-relaxed text-slate-500">
        <ScrollText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          {sv ? 'Analys: ' : 'Analysis: '}{aiSource || 'AI-assisterad; ej slutverifierad av människa.'}{' '}
          {sv ? 'BJI/evidensgrad är en jämförelseheuristik, inte historiskt faktum. Koordinater via Wikidata P625 (verified/approx/disputed).' : 'Grades are a comparison heuristic, not fact.'}
        </p>
      </div>
    </section>
  );
};
