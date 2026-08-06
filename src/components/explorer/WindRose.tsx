import React from 'react';
import { useWindClimatology } from '@/hooks/useWindClimatology';
import { useLanguage } from '@/contexts/LanguageContext';

// Vindros (SMHI-klimatologi). Stapel per sektor = andel av observationer där vinden
// KOM FRÅN den riktningen (meteorologisk konvention). N upp, Ö höger. Källkritiskt:
// visar bara det datan säger — ingen tillrättalagd "naturlig" riktning.
export const WindRose: React.FC<{ location?: string }> = ({ location = 'Kalmarsund' }) => {
  const { data } = useWindClimatology(location);
  const { language } = useLanguage();
  const sv = language === 'sv';
  if (!data || data.length === 0) return null;

  const max = Math.max(1, ...data.map((d) => Number(d.frequency_pct) || 0));
  const top = [...data].sort((a, b) => Number(b.frequency_pct) - Number(a.frequency_pct))[0];
  const meta = data[0];
  const cx = 60, cy = 60, R = 46;

  return (
    <div className="inline-block rounded-lg border border-slate-700 bg-slate-900/90 p-3 text-slate-200 w-[230px]">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        {sv ? 'Förhärskande vind' : 'Prevailing wind'} · {location}
      </div>
      <svg viewBox="0 0 120 120" className="h-auto w-full">
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
        <text x={cx} y={9} textAnchor="middle" fontSize="7" fill="#94a3b8">N</text>
        <text x={cx} y={117} textAnchor="middle" fontSize="7" fill="#94a3b8">S</text>
        <text x={115} y={cy + 2.5} textAnchor="middle" fontSize="7" fill="#94a3b8">Ö</text>
        <text x={5} y={cy + 2.5} textAnchor="middle" fontSize="7" fill="#94a3b8">V</text>
      </svg>
      <div className="mt-1 text-[10px] leading-tight text-slate-400">
        {sv ? `Mest från ${top.sector} (${Number(top.frequency_pct).toFixed(0)} %). Sundet kanaliserar N–S.`
            : `Mostly from ${top.sector} (${Number(top.frequency_pct).toFixed(0)} %).`}
        {' '}{meta.source || 'SMHI'}{meta.station ? ` · ${meta.station}` : ''}
        {meta.period_from ? ` ${String(meta.period_from).slice(0, 4)}–${String(meta.period_to).slice(0, 4)}` : ''}.
      </div>
    </div>
  );
};
