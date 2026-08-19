import React from 'react';
import { Helmet } from 'react-helmet-async';
import { GraduationCap, AlertTriangle, ArrowRight } from 'lucide-react';

// FAQ/PAA-svar i svarspanelen: fler-perspektiv (en lins per forskningsdisciplin) + öppen bias-ruta
// + "andra frågar också". Differentierar mot Wikipedias NPOV — varje lins bär status/konfidens/källa.
// FAQPage-schema (JSON-LD) → kvalificerar för Googles PAA / AI-Overviews. Data från get_faq-RPC.

interface Lens {
  discipline: string; discipline_label: string; answer_sv: string; answer_en: string | null;
  evidence_sv: string | null; status: string; confidence: number | null; scholar: string | null; sources: string[] | null;
}
interface Bias { type: string; note_sv: string; note_en: string | null; }
interface Related { slug: string; question_sv: string; }
export interface FaqData {
  question_sv: string; question_en?: string | null;
  lenses: Lens[]; bias: Bias[]; related: Related[];
}

const STATUS_STYLE: Record<string, { sv: string; en: string; cls: string }> = {
  belagt: { sv: 'belagt', en: 'established', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' },
  tolkning: { sv: 'tolkning', en: 'interpretation', cls: 'border-amber-500/40 bg-amber-500/10 text-amber-200' },
  omstridt: { sv: 'omstritt', en: 'contested', cls: 'border-rose-500/40 bg-rose-500/10 text-rose-200' },
  obelagt: { sv: 'obelagt', en: 'unattested', cls: 'border-slate-500/40 bg-slate-500/10 text-slate-300' },
};
const BIAS_LABEL: Record<string, { sv: string; en: string }> = {
  nationell: { sv: 'Nationell bias', en: 'National bias' }, genus: { sv: 'Genusbias', en: 'Gender bias' },
  kalloverlevnad: { sv: 'Källöverlevnad', en: 'Source survival' }, teleologi: { sv: 'Teleologi', en: 'Teleology' },
  eurocentrism: { sv: 'Eurocentrism', en: 'Eurocentrism' }, ovrig: { sv: 'Övrigt', en: 'Other' },
};

export const FaqAnswer: React.FC<{ faq: FaqData; sv: boolean; onQuery?: (q: string) => void }> = ({ faq, sv, onQuery }) => {
  if (!faq || (!faq.lenses?.length && !faq.bias?.length)) return null;
  return (
    <section className="border-b border-slate-800 bg-slate-900 px-5 pt-4 pb-4 text-left [&_*]:text-left">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: [{
            '@type': 'Question', name: faq.question_sv,
            acceptedAnswer: { '@type': 'Answer', text: (faq.lenses ?? []).map((l) => `${l.discipline_label}: ${l.answer_sv}`).join(' ') },
          }],
        })}</script>
      </Helmet>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-white">
        <GraduationCap className="h-5 w-5 text-gold" />{sv ? faq.question_sv : (faq.question_en || faq.question_sv)}
      </h2>
      <p className="mb-3 text-xs text-slate-400">
        {sv ? 'Svar per forskningsdisciplin — med belägg, status och källa. Olika metoder ser olika saker.'
            : 'Answers per research discipline — with evidence, status and source. Different methods see different things.'}
      </p>

      {/* TROVÄRDIGHET & METOD (Lennart Rolandssons metodkrav): visa HUR källorna använts + ett ärligt
          trovärdighetsmått + disciplinär konvergens. AI predikerar → transparensen är motgiftet.
          Beräknat ur linsernas status/källor — inget fejkat exakt tal. */}
      {(() => {
        const lenses = faq.lenses ?? [];
        const n = lenses.length;
        if (!n) return null;
        const sc: Record<string, number> = { belagt: 3, tolkning: 2, omstridt: 1, obelagt: 0 };
        const avg = lenses.reduce((a, l) => a + (sc[l.status] ?? 1), 0) / n;
        const withSrc = lenses.filter((l) => l.sources?.length).length;
        const srcSet = new Set<string>(); lenses.forEach((l) => (l.sources ?? []).forEach((s) => srcSet.add(s)));
        const nBel = lenses.filter((l) => l.status === 'belagt').length;
        const nTol = lenses.filter((l) => l.status === 'tolkning').length;
        const nDisp = lenses.filter((l) => l.status === 'omstridt' || l.status === 'obelagt').length;
        const dominant = Math.max(nBel, nTol);
        const converge = n >= 2 && dominant >= Math.ceil(n * 0.6) && nDisp === 0;
        const divergent = n >= 2 && nDisp > 0 && (nBel > 0 || nTol > 0);
        const band = (avg >= 2.3 && withSrc >= Math.ceil(n / 2) && n >= 2) ? 'stark'
                   : (avg >= 1.5 && withSrc >= 1) ? 'medel' : 'svag';
        const BAND: Record<string, { sv: string; en: string; cls: string }> = {
          stark: { sv: 'Stark källgrund', en: 'Strong source basis', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' },
          medel: { sv: 'Medelstark grund', en: 'Moderate basis', cls: 'border-amber-500/40 bg-amber-500/10 text-amber-200' },
          svag: { sv: 'Svag/omstridd grund', en: 'Weak/contested basis', cls: 'border-rose-500/40 bg-rose-500/10 text-rose-200' },
        };
        const b = BAND[band];
        return (
          <div className="mb-3 rounded-lg border border-slate-700 bg-slate-800/50 p-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full border px-2 py-0.5 font-semibold ${b.cls}`}>
                {sv ? 'Trovärdighet: ' : 'Credibility: '}{sv ? b.sv : b.en}
              </span>
              <span className="text-slate-300">
                {converge ? (sv ? `Disciplinär konvergens — ${dominant}/${n} linser samstämmiga` : `Disciplinary convergence — ${dominant}/${n} lenses agree`)
                 : divergent ? (sv ? 'Delad bild — disciplinerna skiljer sig' : 'Divided — the disciplines differ')
                 : (sv ? `${n} disciplinlins${n > 1 ? 'er' : ''}` : `${n} discipline lens${n > 1 ? 'es' : ''}`)}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
              {sv ? `Så använde vi källorna: ${srcSet.size} källor över ${n} discipliner — ${nBel} belagt, ${nTol} tolkning${nDisp ? `, ${nDisp} omstritt/obelagt` : ''}. AI sammanfattar och tolkar ur källorna (predikterar alltså inte fritt) — verifiera via beläggen nedan.`
                  : `How we used the sources: ${srcSet.size} sources across ${n} disciplines — ${nBel} attested, ${nTol} interpretation${nDisp ? `, ${nDisp} contested` : ''}. AI summarises and interprets from the sources (not free prediction) — verify via the evidence below.`}
            </p>
          </div>
        );
      })()}

      <div className="space-y-3">
        {(faq.lenses ?? []).map((l, i) => {
          const st = STATUS_STYLE[l.status] ?? STATUS_STYLE.tolkning;
          return (
            <div key={i} className="border-l-2 border-gold/40 pl-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-gold">{l.discipline_label}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${st.cls}`}>{sv ? st.sv : st.en}</span>
                {l.confidence != null && <span className="text-[10px] text-slate-500">{sv ? 'konfidens' : 'confidence'} {Math.round(l.confidence * 100)}%</span>}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">{sv ? l.answer_sv : (l.answer_en || l.answer_sv)}</p>
              {l.evidence_sv && sv && <p className="mt-0.5 text-xs text-slate-400"><span className="text-slate-500">Belägg: </span>{l.evidence_sv}</p>}
              {l.sources?.length ? <p className="mt-0.5 text-[11px] text-slate-500">{l.sources.join(' · ')}</p> : null}
            </div>
          );
        })}
      </div>

      {faq.bias?.length ? (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />{sv ? 'Perspektiv & bias' : 'Perspective & bias'}
          </div>
          <ul className="space-y-1">
            {faq.bias.map((b, i) => (
              <li key={i} className="text-xs leading-relaxed text-slate-300">
                <span className="font-medium text-amber-200">{(BIAS_LABEL[b.type]?.[sv ? 'sv' : 'en']) ?? b.type}: </span>
                {sv ? b.note_sv : (b.note_en || b.note_sv)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {faq.related?.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500">{sv ? 'Andra frågar också:' : 'People also ask:'}</span>
          {faq.related.map((r, i) => (
            <button key={i} type="button" onClick={() => onQuery?.(r.question_sv)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-200 hover:border-gold/50 hover:text-gold">
              {r.question_sv}<ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
};
