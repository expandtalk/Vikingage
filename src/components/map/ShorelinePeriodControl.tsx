import React from 'react';
import { Waves } from 'lucide-react';

// Periodväljare för dåtida strandlinje (landhöjning) på forskningskartorna. null = av.
// Åren matchar SGU-skivorna (get_paleo_shorelines_nearest snappar till närmaste).

const PERIODS: { label: string; year: number | null }[] = [
  { label: 'Av', year: null },
  { label: 'Rom. järnålder ~250', year: 250 },
  { label: 'Folkvandring ~450', year: 450 },
  { label: 'Vendel ~750', year: 750 },
  { label: 'Vikingatid ~950', year: 950 },
];

export const ShorelinePeriodControl: React.FC<{ value: number | null; onChange: (y: number | null) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center gap-1.5 mb-2 text-xs">
    <span className="inline-flex items-center gap-1 text-sky-300 font-medium"><Waves className="h-3.5 w-3.5" /> Dåtida strandlinje:</span>
    {PERIODS.map((p) => {
      const active = value === p.year;
      return (
        <button key={p.label} type="button" onClick={() => onChange(p.year)}
          className={`rounded border px-2 py-0.5 transition-colors ${active ? 'border-sky-400 text-sky-200 bg-sky-500/10' : 'border-slate-700 text-muted-foreground'}`}>
          {p.label}
        </button>
      );
    })}
    <span className="text-[10px] text-muted-foreground opacity-70">SGU strandförskjutningsmodell (CC-BY)</span>
  </div>
);
