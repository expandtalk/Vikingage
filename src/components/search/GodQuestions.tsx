import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useGodQuestions } from '@/hooks/useGodQuestions';

// "Vanliga frågor om [gud]" — de vanligaste sökningarna (Ahrefs) för guden, klickbara.
// Visas i söket KnowledgePanel bredvid relationskartan.
export const GodQuestions: React.FC<{ godId: string; godName: string; onGo: (route: string) => void; sv: boolean }> = ({ godId, godName, onGo, sv }) => {
  const { data } = useGodQuestions(godId);
  if (!data || data.length === 0) return null;
  return (
    <div className="border-t border-slate-800 px-4 py-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
        <HelpCircle className="h-3 w-3" /> {sv ? `Vanliga frågor om ${godName}` : `Common questions about ${godName}`}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {data.map((q) => (
          <button key={q.question} onClick={() => onGo(`/explore?searchQuery=${encodeURIComponent(q.question)}`)}
            className="rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/50 hover:text-amber-100">
            {q.question}
          </button>
        ))}
      </div>
    </div>
  );
};
