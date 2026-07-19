import React from 'react';
import { Tag } from 'lucide-react';
import { useCarverAttributes } from '@/hooks/useCarverAttributes';
import { ATTR_TYPE_LABELS } from '@/config/carverAttributes';
import { useLanguage } from '@/contexts/LanguageContext';

// Visar ristarens attribut (släktskap/härkomst/sysselsättning/övrigt) tvåspråkigt.
export const CarverAttributes: React.FC<{ carverId: string }> = ({ carverId }) => {
  const { language } = useLanguage();
  const sv = language !== 'en';
  const { data: attrs } = useCarverAttributes(carverId);

  if (!attrs || attrs.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
        <Tag className="h-3 w-3" /> {sv ? 'Attribut' : 'Attributes'}
      </div>
      <ul className="space-y-1">
        {attrs.map((a) => {
          const label = ATTR_TYPE_LABELS[a.attribute_type]?.[sv ? 'sv' : 'en'] ?? a.attribute_type;
          const val = (sv ? a.value_sv : a.value_en) || a.value_sv || a.value_en || '';
          return (
            <li key={a.id} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="mt-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-amber-300 shrink-0">{label}</span>
              <span>{val}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
