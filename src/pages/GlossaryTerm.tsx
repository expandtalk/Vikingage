import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink } from 'lucide-react';
import { DiscussionThread } from '../components/discussion/DiscussionThread';

// Ordliste-termsida /sv/ordlista/:slug (+ /en/glossary/:slug). Renderar EN källgranskad fackterm
// ur public.glossary med epistemisk märkning + källa + licens. Endast verifierade, fritt licensierade
// poster (RLS: verified=true and license in (PD,CC-BY,CC0,egen)). Se scratch-ordlista-utredning.md.

interface GlossaryRow {
  slug: string; term: string; short_def: string; definition: string | null;
  category: string; epistemic: string; source: string | null; source_url: string | null;
  license: string; see_also: string[] | null; lang: string;
}
const sb = supabase as unknown as { from: (t: string) => any };

const EPISTEMIC: Record<string, { sv: string; en: string; cls: string }> = {
  belagt:    { sv: 'belagt', en: 'attested', cls: 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50' },
  hypotes:   { sv: 'hypotes', en: 'hypothesis', cls: 'bg-amber-900/40 text-amber-200 border-amber-700/50' },
  omtvistat: { sv: 'omtvistat', en: 'contested', cls: 'bg-orange-900/40 text-orange-200 border-orange-700/50' },
  obelagt:   { sv: 'obelagt', en: 'unattested', cls: 'bg-rose-900/40 text-rose-200 border-rose-700/50' },
};

export default function GlossaryTerm({ forceLang }: { forceLang?: 'sv' | 'en' }) {
  const { slug } = useParams<{ slug: string }>();
  const sv = forceLang !== 'en';
  const { data: row, isLoading } = useQuery({
    queryKey: ['glossary-term', slug],
    enabled: !!slug,
    queryFn: async (): Promise<GlossaryRow | null> => {
      const { data } = await sb.from('glossary').select(
        'slug,term,short_def,definition,category,epistemic,source,source_url,license,see_also,lang',
      ).eq('slug', slug).maybeSingle();
      return (data as GlossaryRow) ?? null;
    },
  });

  const ep = row ? (EPISTEMIC[row.epistemic] ?? EPISTEMIC.belagt) : null;
  const title = row ? `${row.term} — ${sv ? 'ordlista' : 'glossary'}` : (sv ? 'Ordlista' : 'Glossary');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta title={title} description={row?.short_def ?? (sv ? 'Fackterm ur Viking Age-ordlistan.' : 'Term from the Viking Age glossary.')} />
      <Header />
      <Breadcrumbs />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {isLoading && <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>}
        {!isLoading && !row && (
          <div className="rounded-lg border border-border p-6">
            <p className="text-muted-foreground">{sv ? 'Termen hittades inte.' : 'Term not found.'}</p>
            <Link to={sv ? '/sv/ordlista' : '/en/glossary'} className="text-gold hover:underline">{sv ? '← Ordlistan' : '← Glossary'}</Link>
          </div>
        )}
        {row && (
          <>
          <article>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-muted-foreground"><BookOpen className="h-3.5 w-3.5" /> {sv ? 'Fackterm' : 'Term'}</span>
              <Badge variant="outline">{row.category}</Badge>
              {ep && <span className={`rounded border px-2 py-0.5 ${ep.cls}`}>{sv ? ep.sv : ep.en}</span>}
            </div>
            <h1 className="mb-2 text-2xl font-bold">{row.term}</h1>
            <p className="mb-5 text-lg text-muted-foreground">{row.short_def}</p>
            {row.definition && <p className="mb-6 leading-relaxed">{row.definition}</p>}

            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <div className="mb-1 font-semibold">{sv ? 'Källa & licens' : 'Source & licence'}</div>
              <div className="text-muted-foreground">
                {row.source ?? (sv ? 'egen sammanställning' : 'own compilation')}
                {row.source_url && (
                  <>
                    {' · '}
                    {/^https?:\/\//.test(row.source_url)
                      ? <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">{sv ? 'läs mer' : 'read more'} <ExternalLink className="h-3 w-3" /></a>
                      : <Link to={row.source_url} className="text-gold hover:underline">{sv ? 'läs mer' : 'read more'}</Link>}
                  </>
                )}
                {' · '}<span className="uppercase">{row.license}</span>
              </div>
            </div>

            {row.see_also && row.see_also.length > 0 && (
              <div className="mt-5 text-sm">
                <span className="text-muted-foreground">{sv ? 'Se även: ' : 'See also: '}</span>
                {row.see_also.map((s, i) => (
                  <React.Fragment key={s}>
                    {i > 0 && ', '}
                    <Link to={`${sv ? '/sv/ordlista/' : '/en/glossary/'}${s}`} className="text-gold hover:underline">{s.replace(/-/g, ' ')}</Link>
                  </React.Fragment>
                ))}
              </div>
            )}
          </article>

          {/* Fas 1: UGC-bidragstråd på begreppet — inloggade skriver/diskuterar (samtyckesgrind i
              komponenten), modererat via flagga → discussion_post_flags → UgcModerationQueue.
              Kurator kan senare befordra ett bidrag till kanonisk definition (fas 1b, promote-RPC). */}
          <section className="mt-10 border-t border-border/60 pt-6">
            <DiscussionThread
              entityType="glossary_term"
              entityKey={row.slug}
              heading={sv ? 'Diskussion & bidrag' : 'Discussion & contributions'}
            />
          </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
