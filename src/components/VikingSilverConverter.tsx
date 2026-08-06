import React, { useMemo, useState } from 'react';
import { useValueUnits, type ValueUnit } from '@/hooks/useValueUnits';
import { useLanguage } from '@/contexts/LanguageContext';
import { Scale, Info } from 'lucide-react';

// Vikingatida silvervåg: den vägda silverekonomin. Räkna om mellan mark/öre/örtug/penning + dirham
// via gemensam nämnare (gram fint silver) och se ett INDIKATIVT dagsvärde. Balansvåg som metafor —
// vikingahandlaren bar en hopfällbar skålvåg med vikter (arkeologiskt belagt, bl.a. från Södermanland).
// Källkritik: viktomräkningarna är TROLIGA (öre varierade 24–26 g); ratios är belagda i landskapslagar.

const CONF_LABEL: Record<string, { sv: string; en: string; cls: string }> = {
  belagd: { sv: 'belagt', en: 'attested', cls: 'text-emerald-300 border-emerald-500/40' },
  trolig: { sv: 'troligt', en: 'likely', cls: 'text-amber-300 border-amber-500/40' },
  omtvistad: { sv: 'omtvistat', en: 'contested', cls: 'text-rose-300 border-rose-500/40' },
};

export const VikingSilverConverter: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: units = [] } = useValueUnits();
  const weighable = useMemo(() => units.filter((u) => u.silver_grams != null), [units]);

  const [amount, setAmount] = useState(1);
  const [fromKey, setFromKey] = useState('mark');
  const [spot, setSpot] = useState(9); // SEK per gram silver — INDIKATIVT, användarjusterbart

  const from = weighable.find((u) => u.key === fromKey) ?? weighable[0];
  const grams = from && amount ? amount * (from.silver_grams as number) : 0;

  // Dekorativ vågtippning: jämför inmatad silvervikt mot 1 mark (~200 g) på log-skala.
  const tilt = grams > 0 ? Math.max(-14, Math.min(14, Math.log(grams / 200) * 4)) : 0;

  const nf = (n: number) => n.toLocaleString(sv ? 'sv-SE' : 'en-US', { maximumFractionDigits: n < 10 ? 2 : 0 });
  const nm = (u: ValueUnit) => (sv ? u.name_sv : (u.name_en || u.name_sv));

  if (!from) return null;

  return (
    <div className="max-w-4xl mx-auto bg-slate-800/70 border border-slate-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gold mb-1 flex items-center gap-2">
        <Scale className="h-6 w-6" /> {sv ? 'Vikingatida silvervåg' : 'Viking silver scale'}
      </h2>
      <p className="text-slate-300 text-sm mb-5 max-w-2xl">
        {sv
          ? 'Vikingatidens ekonomi var en vägd silverekonomi — silver mättes i vikt, inte i mynt med fast valör. Handlaren bar en hopfällbar balansvåg med skålar och vikter (belagd i gravfynd, bl.a. från Södermanland). Räkna om mellan enheterna nedan.'
          : 'The Viking economy was a weighed-silver economy — silver was measured by weight, not by coins of fixed denomination. Merchants carried a folding balance scale with pans and weights (attested in grave finds, incl. from Södermanland). Convert between the units below.'}
      </p>

      {/* Balansvåg (dekorativ, tippar efter inmatad silvervikt) */}
      <div className="flex justify-center mb-5">
        <svg viewBox="0 0 240 120" className="w-64 h-32">
          <line x1="120" y1="14" x2="120" y2="96" stroke="#a8a29e" strokeWidth="3" />
          <circle cx="120" cy="12" r="5" fill="#eab308" />
          <g transform={`rotate(${tilt} 120 20)`}>
            <line x1="40" y1="20" x2="200" y2="20" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="20" x2="40" y2="44" stroke="#a8a29e" strokeWidth="1.5" />
            <path d="M26 44 a14 8 0 0 0 28 0 z" fill="#78716c" stroke="#57534e" />
            <line x1="200" y1="20" x2="200" y2="44" stroke="#a8a29e" strokeWidth="1.5" />
            <path d="M186 44 a14 8 0 0 0 28 0 z" fill="#78716c" stroke="#57534e" />
          </g>
          <rect x="96" y="96" width="48" height="6" rx="2" fill="#57534e" />
        </svg>
      </div>

      {/* Inmatning: mängd + enhet */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="number" min={0} step="any" value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          className="w-28 px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-lg"
          aria-label={sv ? 'Mängd' : 'Amount'}
        />
        <div className="flex flex-wrap gap-1">
          {weighable.map((u) => (
            <button key={u.key} onClick={() => setFromKey(u.key)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${from.key === u.key ? 'bg-amber-500/20 border-amber-500 text-amber-100' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}`}>
              {nm(u)}
            </button>
          ))}
        </div>
      </div>

      {/* Resultat: silvervikt + omräkning till alla enheter */}
      <div className="rounded-lg bg-slate-900/60 border border-slate-700 p-4">
        <div className="text-slate-400 text-xs uppercase tracking-wide">{sv ? 'Motsvarar' : 'Equals'}</div>
        <div className="text-2xl font-bold text-white mb-3">
          {nf(grams)} {sv ? 'g fint silver' : 'g fine silver'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {weighable.map((u) => (
            <div key={u.key} className={`rounded border p-2 ${u.key === from.key ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700'}`}>
              <div className="text-slate-400 text-[11px]">{nm(u)}</div>
              <div className="text-white font-semibold">{nf(grams / (u.silver_grams as number))}</div>
            </div>
          ))}
        </div>

        {/* Indikativt dagsvärde */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-700 pt-3">
          <span className="text-slate-300 text-sm">{sv ? 'Indikativt dagsvärde:' : 'Indicative today:'}</span>
          <span className="text-emerald-300 font-bold text-lg">{nf(grams * spot)} SEK</span>
          <label className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
            {sv ? 'silverpris' : 'silver price'}
            <input type="number" min={0} step="any" value={spot} onChange={(e) => setSpot(Math.max(0, Number(e.target.value)))}
              className="w-16 px-1.5 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200" /> SEK/g
          </label>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {sv ? 'Dagsvärdet är bara silvermetallens vikt × spotpris — inte ett historiskt köpkraftsmått.' : 'The modern value is only silver metal weight × spot price — not a historical purchasing-power measure.'}
        </p>
      </div>

      {/* Källkritik + enhetsnoter */}
      <div className="mt-4 text-xs text-slate-400 space-y-1.5">
        <p className="flex items-start gap-1.5">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-500" />
          <span>{sv
            ? 'Förhållandena (1 mark = 8 öre = 24 örtugar = 192 penningar) är belagda i landskapslagarna. De absoluta gramvikterna är troliga snarare än exakta — öret vägde ca 24–26 g och varierade över tid och region.'
            : 'The ratios (1 mark = 8 öre = 24 örtugar = 192 penningar) are attested in the provincial laws. The absolute gram weights are likely rather than exact — the öre weighed c. 24–26 g and varied over time and region.'}</span>
        </p>
        <ul className="space-y-0.5 pl-5">
          {weighable.map((u) => {
            const cf = CONF_LABEL[u.confidence] ?? CONF_LABEL.trolig;
            return (
              <li key={u.key}>
                <span className="text-slate-300">{nm(u)}</span>
                <span className={`ml-1 rounded border px-1 text-[10px] ${cf.cls}`}>{sv ? cf.sv : cf.en}</span>
                {u.note && <span className="text-slate-500"> — {u.note}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default VikingSilverConverter;
