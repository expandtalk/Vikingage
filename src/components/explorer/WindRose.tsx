import React, { useState } from 'react';
import { useWindClimatology, useWindLocations } from '@/hooks/useWindClimatology';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wind, Minus } from 'lucide-react';

// Vindros (SMHI-klimatologi). Stapel per sektor = andel av observationer där vinden
// KOM FRÅN den riktningen (meteorologisk konvention). N upp, Ö höger. Källkritiskt:
// visar bara det datan säger — ingen tillrättalagd "naturlig" riktning.
// Minimerbar (Daniel: frigör kartyta) — fälls ihop till en liten vind-chip.
export const WindRose: React.FC<{ location?: string; defaultOpen?: boolean }> = ({ location = 'Kalmarsund', defaultOpen = true }) => {
  const { data } = useWindClimatology(location);
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [open, setOpen] = useState(defaultOpen);
  if (!data || data.length === 0) return null;

  const max = Math.max(1, ...data.map((d) => Number(d.frequency_pct) || 0));
  const top = [...data].sort((a, b) => Number(b.frequency_pct) - Number(a.frequency_pct))[0];
  const meta = data[0];
  const cx = 60, cy = 60, R = 46;

  // Hopfälld: liten chip (vind-ikon + förhärskande riktning) som frigör kartyta.
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        title={sv ? `Vind · ${location}` : `Wind · ${location}`}
        className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-800">
        <Wind className="h-3.5 w-3.5 text-amber-300" />
        <span>{sv ? 'Vind' : 'Wind'} {top.sector} · {Number(top.frequency_pct).toFixed(0)} %</span>
      </button>
    );
  }

  return (
    <div className="relative inline-block rounded-lg border border-slate-700 bg-slate-900/90 p-2.5 text-slate-200 w-[176px]">
      <button onClick={() => setOpen(false)} title={sv ? 'Minimera' : 'Minimize'}
        className="absolute right-1.5 top-1.5 rounded p-0.5 text-slate-400 hover:bg-slate-700 hover:text-slate-100">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <div className="mb-1 pr-5 text-[11px] font-semibold tracking-wide text-amber-300">
        {location}
      </div>
      <svg viewBox="0 0 120 120" className="mx-auto h-auto w-[70%]">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#334155" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={R * 0.5} fill="none" stroke="#334155" strokeWidth="0.5" />
        {data.map((d) => {
          const len = R * (Number(d.frequency_pct) / max);
          const a = (Number(d.sector_deg) * Math.PI) / 180; // 0=N
          const bx = cx + len * Math.sin(a);
          const by = cy - len * Math.cos(a);
          const isTop = d.sector === top.sector;
          return (
            <line key={d.sector} x1={cx} y1={cy} x2={bx} y2={by}
              stroke={isTop ? '#f59e0b' : '#38bdf8'} strokeWidth="3.5" strokeLinecap="round" />
          );
        })}
        <circle cx={cx} cy={cy} r={2.4} fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
        <text x={cx} y={9} textAnchor="middle" fontSize="7" fill="#94a3b8">N</text>
        <text x={cx} y={117} textAnchor="middle" fontSize="7" fill="#94a3b8">S</text>
        <text x={115} y={cy + 2.5} textAnchor="middle" fontSize="7" fill="#94a3b8">Ö</text>
        <text x={5} y={cy + 2.5} textAnchor="middle" fontSize="7" fill="#94a3b8">V</text>
      </svg>
      <div className="mt-1 text-[10px] leading-tight text-slate-400">
        {sv ? `Mest från ${top.sector} (${Number(top.frequency_pct).toFixed(0)} %).${location === 'Kalmarsund' ? ' Sundet kanaliserar N–S.' : ''}`
            : `Mostly from ${top.sector} (${Number(top.frequency_pct).toFixed(0)} %).`}
        {' '}{meta.source || 'SMHI'}{meta.station ? ` · ${meta.station}` : ''}
        {meta.period_from ? ` ${String(meta.period_from).slice(0, 4)}–${String(meta.period_to).slice(0, 4)}` : ''}.
      </div>
    </div>
  );
};

// Vind per farvatten (SMHI) — men EN i taget, valbar via chips (Daniel: visa inte alla på en gång,
// t.ex. Ålands hav, utan bara det vatten man är intresserad av). Default = ett kärnfarvatten.
// (Ideal nästa steg: följ kartans viewport automatiskt — kräver att kartcentrum plumbas hit.)
const CORE_ORDER = ['Kalmarsund', 'Öland–Gotland', 'Öresund', 'Hanöbukten (Bornholm)'];
export const WindRoses: React.FC = () => {
  const { data: locations = [] } = useWindLocations();
  const { language } = useLanguage();
  const sv = language === 'sv';
  // Sortera kärnfarvattnen först; övriga (t.ex. Ålands hav) efter.
  const ordered = [...locations].sort((a, b) => {
    const ia = CORE_ORDER.indexOf(a), ib = CORE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const [active, setActive] = useState<string>(ordered[0] ?? '');
  if (!locations.length) return null;
  const current = ordered.includes(active) ? active : (ordered[0] ?? '');
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        {sv ? 'Vind per farvatten (SMHI)' : 'Wind by sea area (SMHI)'}
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {ordered.map((loc) => (
          <button key={loc} onClick={() => setActive(loc)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              loc === current ? 'border-amber-500/60 bg-amber-500/15 text-amber-100'
                              : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'}`}>
            {loc}
          </button>
        ))}
      </div>
      <WindRose key={current} location={current} />
    </div>
  );
};
