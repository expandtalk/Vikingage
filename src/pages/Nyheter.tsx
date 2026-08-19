import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { Newspaper, ExternalLink } from 'lucide-react';

// /sv/nyheter + /en/news — flödet av senaste (nordiskt relevanta) forskningsartiklar ur lit_intake
// (OpenAlex/Crossref/Europe PMC), relevans-triagerade. Utlänk till DOI, OA-märkta. TIPS, ej granskade
// av oss / ej kanon — färsk forskning man kan följa och vi kan välja att skriva om.

interface Lit { title: string; authors: string; journal: string; doi: string; url: string; is_oa: boolean; publication_date: string; discipline: string; abstract: string; source: string }

const DISC_SV: Record<string, string> = {
  arkeolog: 'Arkeologi', arkeogenetiker: 'aDNA & arkeogenetik', arkeometri: 'Arkeometri',
  'ekonomisk-historiker': 'Ekonomisk historia', marinarkeolog: 'Marinarkeologi', runolog: 'Runologi',
  historiker: 'Historia', osteolog: 'Osteologi', kulturgeograf: 'Kulturgeografi',
};
const sb = supabase as unknown as { rpc: (fn: string, args?: any) => Promise<{ data: any; error: any }> };

const Nyheter: React.FC<{ forceLang?: 'sv' | 'en' }> = ({ forceLang }) => {
  const { language } = useLanguage();
  const sv = (forceLang ?? language) === 'sv';
  const [disc, setDisc] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['nyheter-lit'], staleTime: 15 * 60 * 1000,
    queryFn: async (): Promise<Lit[]> => {
      const { data, error } = await sb.rpc('lit_recent', { p_limit: 200, p_discipline: null });
      if (error) throw error;
      return (data ?? []) as Lit[];
    },
  });

  const disciplines = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) { const k = it.discipline || 'other'; m.set(k, (m.get(k) ?? 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);
  const shown = disc ? items.filter((i) => (i.discipline || 'other') === disc) : items;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Senaste forskningen — nyhetsflöde" titleEn="Latest research — news feed"
        description="Färska forskningsartiklar om vikingatid, arkeologi, aDNA, runor och nordisk historia ur öppna register (OpenAlex/Crossref/Europe PMC) — relevans-sorterade, med utlänk till källan."
        keywords="senaste forskning, arkeologi, aDNA, vikingatid, runor, open access, nyheter" />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-foreground">
          <Newspaper className="h-8 w-8 text-emerald-400" />{sv ? 'Senaste forskningen' : 'Latest research'}
        </h1>
        <p className="mb-5 text-sm text-muted-foreground">
          {sv
            ? 'Färska artiklar om nordisk arkeologi, aDNA, runologi, numismatik m.m. ur öppna register (OpenAlex, Crossref, Europe PMC), relevans-sorterade. Vi länkar ut till källan — dessa är tips att följa, inte granskade av oss.'
            : 'Fresh articles on Nordic archaeology, aDNA, runology, numismatics and more from open registries (OpenAlex, Crossref, Europe PMC), relevance-ranked. We link out to the source — these are leads to follow, not vetted by us.'}
        </p>

        {/* Disciplin-filter */}
        <div className="mb-5 flex flex-wrap gap-2">
          <button onClick={() => setDisc(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${!disc ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100' : 'border-border bg-card/50 text-muted-foreground hover:text-foreground'}`}>
            {sv ? 'Alla' : 'All'} · {items.length}
          </button>
          {disciplines.map(([k, n]) => (
            <button key={k} onClick={() => setDisc(k)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${disc === k ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100' : 'border-border bg-card/50 text-muted-foreground hover:text-foreground'}`}>
              {(sv ? DISC_SV[k] : null) ?? (k === 'other' ? (sv ? 'Övrigt' : 'Other') : k)} · {n}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((a) => (
              <a key={a.doi || a.title} href={a.url} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col rounded-lg border border-border bg-card/40 p-3 hover:border-emerald-500/50 hover:bg-card/70">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold leading-snug text-foreground">{a.title}</span>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-emerald-400" />
                </span>
                {a.authors && <span className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{a.authors}</span>}
                <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                  {a.journal && <span className="italic">{a.journal}</span>}
                  {a.publication_date && <span className="tabular-nums">{a.publication_date.slice(0, 10)}</span>}
                  {a.is_oa && <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-medium text-emerald-300">Open access</span>}
                  {a.discipline && <span className="rounded bg-white/5 px-1.5 py-0.5">{(sv ? DISC_SV[a.discipline] : null) ?? a.discipline}</span>}
                </span>
                {a.abstract && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/85 line-clamp-3">{a.abstract}</p>}
              </a>
            ))}
          </div>
        )}
        <p className="mt-6 text-[11px] text-muted-foreground/70">
          {sv
            ? 'Källor: OpenAlex, Crossref, Europe PMC (öppna metadata-register). Endast nordiskt relevanta träffar visas. Metadata + utlänk till DOI; open access-märkta artiklar är fritt läsbara. Detta är ett tips-/bevakningsflöde — inte granskad kanon.'
            : 'Sources: OpenAlex, Crossref, Europe PMC (open metadata registries). Only Nordic-relevant hits shown. Metadata + DOI link-out; open-access items are freely readable. This is a monitoring feed — not vetted canon.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Nyheter;
