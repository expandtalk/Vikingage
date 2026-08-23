import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScrollText } from 'lucide-react';

// Medeltidsbrev (SDHK) kopplade till ett TEMA via innehållssökning på temats nyckelord (regest-ilike
// i medieval_charters_browse). Självgömmande om inga träffar. Länkar till /sv/medeltidsbrev/:sdhk_id.
// Källa: SDHK, Riksarkivet · CC BY 4.0. (Medeltidsbreven är ännu inte KG-entiteter → surfas via RPC, ej has_theme.)

type Row = { sdhk_id: number; year: number | null; regest: string | null; summary: string | null; total_count?: number };

export const ThemeCharters: React.FC<{ terms: string[]; sv: boolean }> = ({ terms, sv }) => {
  // Ta enordstermer (regest-ilike), max 4 — undviker fleordsfraser som "Arboga 1435" som ilike:ar dåligt.
  const words = Array.from(new Set(terms.map((t) => t.trim()).filter((t) => t && !t.includes(' ')))).slice(0, 4);
  const { data: rows = [] } = useQuery({
    queryKey: ['theme-charters', words.join(',')],
    enabled: words.length > 0,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Row[]> => {
      const seen = new Set<number>();
      const out: Row[] = [];
      for (const w of words) {
        const { data } = await (supabase as any).rpc('medieval_charters_browse', { q: w, page_size: 12 });
        for (const r of (data ?? []) as Row[]) {
          if (seen.has(r.sdhk_id)) continue;
          seen.add(r.sdhk_id);
          out.push(r);
        }
      }
      return out.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999)).slice(0, 20);
    },
  });
  if (!rows.length) return null;
  const base = sv ? '/sv/medeltidsbrev' : '/en/medieval-charters';
  const years = rows.map((r) => r.year).filter((y): y is number => y != null);
  const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : null;

  return (
    <section className="mb-6 rounded-lg border border-slate-700 bg-slate-800/30 p-4 text-left">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-amber-300">
        <ScrollText className="h-4 w-4" />{sv ? 'Medeltidsbrev som nämner temat' : 'Medieval charters mentioning this theme'}
      </h2>
      <p className="mb-2 text-[11px] text-slate-500">
        {sv ? `${rows.length} brev ur SDHK${span ? `, ${span}` : ''} · innehållssökning på temats nyckelord` : `${rows.length} charters from SDHK${span ? `, ${span}` : ''}`}
      </p>
      <ul className="divide-y divide-slate-800/60 rounded-md border border-slate-800 bg-slate-900/40">
        {rows.map((c) => (
          <li key={c.sdhk_id}>
            <Link to={`${base}/${c.sdhk_id}`} className="group flex items-baseline gap-3 px-3 py-1.5">
              <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-amber-300/80">{c.year ?? '—'}</span>
              <span className="line-clamp-2 text-xs text-slate-200 group-hover:text-amber-100">{c.regest || c.summary || (sv ? '(regest saknas)' : '(no abstract)')}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-slate-500/70">{sv ? 'Källa: SDHK, Riksarkivet · CC BY 4.0' : 'Source: SDHK, National Archives · CC BY 4.0'}</p>
    </section>
  );
};
