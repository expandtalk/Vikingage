import React, { useState } from 'react';
import { Waves, X } from 'lucide-react';

// Periodväljare för dåtida strandlinje (landhöjning) på forskningskartorna. null = av.
// Åren matchar SGU-skivorna (get_paleo_shorelines_nearest snappar till närmaste).
// variant='inline' (desktop) = raden ovanför kartan. variant='floating' (mobil) = kompakt
// vågknapp som fäller ut en liten popover → tar inte ~20 % av kartytan (Daniel).

const PERIODS: { label: string; year: number | null }[] = [
  { label: 'Av', year: null },
  { label: 'Rom. järnålder ~250', year: 250 },
  { label: 'Folkvandring ~450', year: 450 },
  { label: 'Vendel ~750', year: 750 },
  { label: 'Vikingatid ~950', year: 950 },
];

const CAPTION = 'SGU strandförskjutningsmodell (CC-BY) — märkbar i Mälardalen/Norrland, försumbar i söder';

interface Props {
  value: number | null;
  onChange: (y: number | null) => void;
  variant?: 'inline' | 'floating';
}

const PeriodButtons: React.FC<Props> = ({ value, onChange }) => (
  <>
    {PERIODS.map((p) => {
      const active = value === p.year;
      return (
        <button key={p.label} type="button" onClick={() => onChange(p.year)}
          className={`rounded border px-2 py-0.5 transition-colors ${active ? 'border-sky-400 text-sky-200 bg-sky-500/10' : 'border-slate-700 text-muted-foreground'}`}>
          {p.label}
        </button>
      );
    })}
  </>
);

export const ShorelinePeriodControl: React.FC<Props> = ({ value, onChange, variant = 'inline' }) => {
  const [open, setOpen] = useState(false);

  if (variant === 'floating') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Dåtida strandlinje"
          aria-expanded={open}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-sky-500/70 bg-slate-900/70 text-sky-200 shadow-lg backdrop-blur hover:bg-slate-800"
        >
          <Waves className="h-5 w-5" />
          {value != null && (
            <span className="absolute -top-1 -right-1 rounded-full bg-sky-500 px-1 text-[9px] font-semibold text-white">{value}</span>
          )}
        </button>
        {open && (
          <div className="absolute left-0 top-12 z-[1110] w-[min(80vw,300px)] rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between gap-1 text-xs font-medium text-sky-300">
              <span className="flex items-center gap-1"><Waves className="h-3.5 w-3.5" /> Dåtida strandlinje</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Stäng" className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <PeriodButtons value={value} onChange={(y) => { onChange(y); }} />
            </div>
            <p className="mt-2 text-[10px] leading-snug text-muted-foreground opacity-80">{CAPTION}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-2 text-xs">
      <span className="inline-flex items-center gap-1 text-sky-300 font-medium"><Waves className="h-3.5 w-3.5" /> Dåtida strandlinje:</span>
      <PeriodButtons value={value} onChange={onChange} />
      <span className="text-[10px] text-muted-foreground opacity-70">{CAPTION}</span>
    </div>
  );
};
