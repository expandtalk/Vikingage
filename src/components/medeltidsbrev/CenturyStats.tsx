import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCharterStats } from '@/hooks/useMedievalCharters';

export const CenturyStats: React.FC<{
  selected: number | null;
  onSelect: (c: number | null) => void;
}> = ({ selected, onSelect }) => {
  const sv = useLanguage().language === 'sv';
  const { data = [] } = useCharterStats();
  const rows = data.filter((r) => r.century != null);
  const max = Math.max(1, ...rows.map((r) => Number(r.n)));
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {sv ? 'Antal brev per århundrade' : 'Charters per century'}
      </div>
      <div className="flex items-end gap-1.5" role="list">
        {rows.map((r) => {
          const c = Number(r.century);
          const active = selected === c;
          const h = Math.round((Number(r.n) / max) * 64) + 4;
          return (
            <button key={c} role="listitem" onClick={() => onSelect(active ? null : c)}
              aria-pressed={active}
              title={`${c}-${sv ? 'tal' : 's'}: ${r.n} (${r.n_fulltext} ${sv ? 'med fulltext' : 'with full text'})`}
              className={`flex flex-col items-center gap-1 rounded px-1 pt-1 ${active ? 'bg-[hsl(var(--gold))]/15' : 'hover:bg-slate-800'}`}>
              <span className="w-5 rounded-t bg-[hsl(var(--gold))]/70" style={{ height: `${h}px` }} />
              <span className="text-[10px] text-slate-400">{String(c).slice(0, 2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
