import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Landmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useKingInscriptionLinks } from '@/hooks/chronicles/useKingInscriptionLinks';
import { useLanguage } from '@/contexts/LanguageContext';

// Visar kung↔runsten-kanterna (king_inscription_links) i kungadetaljen. Hooken ger
// bara inscription_id → vi slår upp signum separat och länkar till kartan.
interface Props { kingId: string }

const CONN: Record<string, { sv: string; en: string }> = {
  raised_by: { sv: 'restes av', en: 'raised by' },
  commemorates: { sv: 'till minne av', en: 'in memory of' },
  mentions: { sv: 'nämner', en: 'mentions' },
  commissioned: { sv: 'beställd av', en: 'commissioned by' },
};
const STRENGTH: Record<string, { sv: string; en: string; cls: string }> = {
  certain: { sv: 'säker', en: 'certain', cls: 'bg-green-700 text-white' },
  strong: { sv: 'stark', en: 'strong', cls: 'bg-amber-600 text-white' },
  contested: { sv: 'omdiskuterad', en: 'contested', cls: 'bg-slate-600 text-slate-100' },
};

export const KingInscriptionLinks: React.FC<Props> = ({ kingId }) => {
  const { language } = useLanguage();
  const sv = language !== 'en';
  const { data: links } = useKingInscriptionLinks(kingId);

  const ids = (links ?? []).map((l) => l.inscription_id);
  const { data: signumMap } = useQuery({
    queryKey: ['king-link-signums', ids.sort().join(',')],
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('runic_inscriptions')
        .select('id, signum')
        .in('id', ids);
      if (error) throw error;
      const m: Record<string, string> = {};
      for (const r of data ?? []) m[r.id] = r.signum;
      return m;
    },
  });

  if (!links || links.length === 0) return null;

  return (
    <div>
      <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
        <Landmark className="h-3 w-3" /> {sv ? 'Runstenar' : 'Runestones'}
      </div>
      <ul className="space-y-2">
        {links.map((l) => {
          const signum = signumMap?.[l.inscription_id];
          const conn = CONN[l.connection_type]?.[sv ? 'sv' : 'en'] ?? l.connection_type;
          const st = STRENGTH[l.evidence_strength];
          return (
            <li key={l.id} className="text-slate-300">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400">{conn}</span>
                {signum ? (
                  <Link
                    to={`/explore?searchQuery=${encodeURIComponent(signum)}`}
                    className="font-medium text-amber-200 hover:text-amber-100 underline underline-offset-2"
                  >
                    {signum}
                  </Link>
                ) : (
                  <span className="font-medium text-amber-200">…</span>
                )}
                {st && (
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${st.cls}`}>
                    {sv ? st.sv : st.en}
                  </span>
                )}
              </div>
              {l.analysis_notes && <p className="text-xs text-slate-400 mt-0.5">{l.analysis_notes}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
