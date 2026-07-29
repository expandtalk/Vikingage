import React from 'react';
import { Shield } from 'lucide-react';
import { useDynastyArms } from '@/hooks/useHeraldry';
import { useLanguage } from '@/contexts/LanguageContext';

// Vapenblock för ätt-/kungasidor. Visar dynastins vapen (blasonering, laddningar, förvärvssätt).
// Renderar inget om dynastin saknar registrerat vapen (graceful — bara Bjälboätten har det ännu).

const ACQ: Record<string, { sv: string; en: string }> = {
  assumed: { sv: 'antaget vapen', en: 'assumed arms' },
  granted_charter: { sv: 'sköldebrev', en: 'granted by charter' },
  inherited: { sv: 'ärvt', en: 'inherited' },
  adopted: { sv: 'adopterat', en: 'adopted' },
  unknown: { sv: 'okänt förvärv', en: 'unknown acquisition' },
};

export const DynastyArms: React.FC<{ dynastyId?: string | null; compact?: boolean }> = ({ dynastyId, compact }) => {
  const { language } = useLanguage();
  const sv = language !== 'en';
  const { data } = useDynastyArms(dynastyId ?? undefined);
  const rows = (data ?? []).filter((r) => r.arms);
  if (rows.length === 0) return null;

  return (
    <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2">
      <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
        <Shield className="h-3 w-3" /> {sv ? 'Vapen' : 'Arms'}
      </div>
      {rows.map((r, i) => r.arms && (
        <div key={r.arms.arms_id + i} className="mb-1.5 last:mb-0">
          <div className="text-white font-medium text-sm">
            {sv ? r.arms.name : (r.arms.name_en ?? r.arms.name)}
            <span className="text-xs font-normal text-slate-400"> · {(ACQ[r.acquisition] ?? ACQ.unknown)[sv ? 'sv' : 'en']}</span>
          </div>
          {r.arms.blazon && <div className="text-slate-300 text-xs italic leading-relaxed">{r.arms.blazon}</div>}
          {!compact && r.arms.charges.length > 0 && (
            <div className="text-slate-400 text-[11px] mt-0.5">
              {r.arms.charges.map((ch) => [ch.motif, ch.tincture, ch.ordinary].filter(Boolean).join(' · ')).join('  |  ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
