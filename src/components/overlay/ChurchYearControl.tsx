import React from 'react';
import { Church } from 'lucide-react';
import { useChurchYearRange, setChurchYearRange, setChurchShowUndated } from '@/hooks/useChurchYearRange';

// Byggårs-intervall för kyrkolagret (från/till). Presets + fria fält. Visas när
// kyrkolagret är på.
const PRESETS: { sv: string; from: number; to: number }[] = [
  { sv: 'Vikingatid', from: 800, to: 1100 },
  { sv: 'Medeltid', from: 1000, to: 1550 },
  { sv: '1600–1800', from: 1600, to: 1800 },
  { sv: '1800–2000', from: 1800, to: 2000 },
  { sv: 'Alla', from: 700, to: 2025 },
];

export const ChurchYearControl: React.FC = () => {
  const { from, to, showUndated } = useChurchYearRange();
  return (
    <div className="absolute top-4 right-4 z-[1100] w-64 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-3">
      <div className="flex items-center gap-1.5 text-white text-xs font-medium mb-2">
        <Church className="h-4 w-4 text-rose-300" />Kyrkornas byggår
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {PRESETS.map((p) => {
          const active = from === p.from && to === p.to;
          return (
            <button key={p.sv} onClick={() => setChurchYearRange(p.from, p.to)}
              className={`px-2 py-1 rounded text-[10px] border transition-colors ${active ? 'bg-rose-500/25 border-rose-500 text-rose-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
              {p.sv}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-slate-300">
        <label className="flex items-center gap-1">Från
          <input type="number" value={from} onChange={(e) => setChurchYearRange(Number(e.target.value), to)}
            className="w-16 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white" />
        </label>
        <label className="flex items-center gap-1">Till
          <input type="number" value={to} onChange={(e) => setChurchYearRange(from, Number(e.target.value))}
            className="w-16 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white" />
        </label>
      </div>
      <label className="flex items-center gap-2 mt-2 text-[11px] text-slate-300 cursor-pointer">
        <input type="checkbox" checked={showUndated} onChange={(e) => setChurchShowUndated(e.target.checked)}
          className="accent-rose-500" />
        Visa odaterade (okänd datering)
      </label>
      <p className="text-[10px] text-slate-500 mt-1.5">
        Odaterade kyrkor döljs som standard så de inte fyller varje period. Zooma in (≥6) för att se kyrkorna.
      </p>
    </div>
  );
};
