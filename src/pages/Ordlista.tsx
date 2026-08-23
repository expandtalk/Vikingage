import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { BookOpen } from 'lucide-react';

// Ordliste-index /sv/ordlista (+ /en/glossary). Listar fackbegrepp per kategori och länkar till
// varje termsida (definition + bidragstråd). Utkast (verified=false) märks — de finns för att
// bjuda in bidrag men syns ännu inte i den ordinarie sökningen.
const sb = supabase as unknown as { from: (t: string) => any };
interface Row { slug: string; term: string; short_def: string | null; category: string | null; verified: boolean }

export default function Ordlista({ forceLang }: { forceLang?: 'sv' | 'en' }) {
  const sv = forceLang !== 'en';
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['glossary-index'],
    queryFn: async (): Promise<Row[]> => {
      const { data } = await sb.from('glossary')
        .select('slug,term,short_def,category,verified')
        .eq('exclude_from_search', false).order('category').order('term');
      return (data ?? []) as Row[];
    },
  });

  const byCat: Record<string, Row[]> = {};
  for (const r of rows) (byCat[r.category ?? 'övrigt'] ??= []).push(r);
  const cats = Object.keys(byCat).sort();
  const base = sv ? '/sv/ordlista/' : '/en/glossary/';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title={sv ? 'Ordlista — fackbegrepp' : 'Glossary — terms'}
        description={sv ? 'Källgranskade fackbegrepp för runologi, arkeologi och historia — bidra på varje termsida.' : 'Source-critical terms for runology, archaeology and history.'}
      />
      <Header />
      <Breadcrumbs />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold">
          <BookOpen className="h-6 w-6 text-gold" />{sv ? 'Ordlista' : 'Glossary'}
        </h1>
        <p className="mb-6 text-muted-foreground">
          {sv ? 'Källgranskade fackbegrepp. Diskutera och bidra på varje termsida.' : 'Source-critical terms. Discuss and contribute on each term page.'}
        </p>
        {isLoading && <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>}
        {!isLoading && rows.length === 0 && <p className="text-muted-foreground">{sv ? 'Inga termer än.' : 'No terms yet.'}</p>}
        {cats.map((c) => (
          <section key={c} className="mb-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold/80">{c}</h2>
            <ul className="space-y-1.5">
              {byCat[c].map((r) => (
                <li key={r.slug}>
                  <Link to={base + r.slug} className="group flex flex-wrap items-baseline gap-2">
                    <span className="text-foreground group-hover:text-gold">{r.term}</span>
                    {!r.verified && (
                      <span className="rounded border border-amber-700/50 bg-amber-900/30 px-1 text-[10px] text-amber-200">{sv ? 'utkast' : 'draft'}</span>
                    )}
                    {r.short_def && <span className="line-clamp-1 text-xs text-muted-foreground">— {r.short_def}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
