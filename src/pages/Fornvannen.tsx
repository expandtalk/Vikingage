import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, ExternalLink, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/fornvannen (en: /en/fornvannen) — systematisk ingång till hela Fornvännen-beståndet
// (3604 artiklar ur DiVA/RAÄ, openAccess, CC-märkt). Sökningen på "fornvännen" leder hit via
// en samlingsentitet i sök-indexet. Metadata + fakta fritt; verbatim text upphovsrättsskyddad.
// Filtrera på ämneskategori, sök titel/författare, sortera på år. Varje rad → PDF (DiVA).

const sb = supabase as unknown as { from: (t: string) => any };
const PAGE = 60;

// Ämneskategorier (härledda vid harvest). Svenska etiketter + antal fylls i från datan.
const CAT_LABEL: Record<string, { sv: string; en: string }> = {
  arkeologi: { sv: 'Arkeologi (allmänt)', en: 'Archaeology (general)' },
  kyrka_konst: { sv: 'Kyrka & konst', en: 'Church & art' },
  'järnålder_vikingatid': { sv: 'Järnålder & vikingatid', en: 'Iron Age & Viking Age' },
  runologi: { sv: 'Runologi', en: 'Runology' },
  medeltid: { sv: 'Medeltid', en: 'Middle Ages' },
  'stenålder': { sv: 'Stenålder', en: 'Stone Age' },
  'bronsålder': { sv: 'Bronsålder', en: 'Bronze Age' },
  gravar_osteologi: { sv: 'Gravar & osteologi', en: 'Burials & osteology' },
  numismatik: { sv: 'Numismatik', en: 'Numismatics' },
  marinarkeologi: { sv: 'Marinarkeologi', en: 'Marine archaeology' },
  'fornborg_befästning': { sv: 'Fornborgar & befästning', en: 'Hillforts & fortification' },
  ortnamn: { sv: 'Ortnamn', en: 'Place names' },
};
const catLabel = (c: string, sv: boolean) => (CAT_LABEL[c] ? (sv ? CAT_LABEL[c].sv : CAT_LABEL[c].en) : c);

interface Row { id: string; title: string; author: string | null; written_year: number | null; category: string | null; url: string | null }

const Fornvannen: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  // ?cat=<slug> deep-länk (t.ex. från en kategori-sökning) → öppna redan filtrerad.
  const [params] = useSearchParams();
  const initialCat = params.get('cat');
  // ?q=<term> deep-länk (t.ex. "Se alla i Fornvännen" från svarspanelen) → öppna förfiltrerad.
  const initialQ = params.get('q') ?? '';
  const [cat, setCat] = useState<string | null>(initialCat && CAT_LABEL[initialCat] ? initialCat : null);
  const [q, setQ] = useState(initialQ);
  const [dq, setDq] = useState(initialQ);
  const [page, setPage] = useState(0);
  React.useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(0); }, 300); return () => clearTimeout(t); }, [q]);
  React.useEffect(() => { setPage(0); }, [cat]);

  // Kategori-facett med antal (en gång).
  const { data: facets = [] } = useQuery({
    queryKey: ['fornvannen-facets'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<{ category: string; n: number }[]> => {
      // Räkna per kategori via lätt aggregat i klienten (12 kategorier → hämta bara category-kolumnen).
      const { data } = await sb.from('historical_sources').select('category').eq('collection', 'Fornvännen');
      const m = new Map<string, number>();
      for (const r of (data ?? []) as { category: string | null }[]) {
        const k = r.category || '(okategoriserad)'; m.set(k, (m.get(k) || 0) + 1);
      }
      return [...m.entries()].map(([category, n]) => ({ category, n })).sort((a, b) => b.n - a.n);
    },
  });
  const total = useMemo(() => facets.reduce((a, f) => a + f.n, 0), [facets]);

  const { data, isFetching } = useQuery({
    queryKey: ['fornvannen-list', cat, dq, page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<{ rows: Row[]; count: number }> => {
      let query = sb.from('historical_sources')
        .select('id, title, author, written_year, category, url', { count: 'exact' })
        .eq('collection', 'Fornvännen');
      if (cat) query = query.eq('category', cat);
      if (dq.trim().length >= 2) {
        const t = dq.trim();
        query = query.or(`title.ilike.%${t}%,author.ilike.%${t}%`);
      }
      const { data, count } = await query
        .order('written_year', { ascending: false, nullsFirst: false })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      return { rows: (data ?? []) as Row[], count: typeof count === 'number' ? count : (data?.length ?? 0) };
    },
  });
  const rows = data?.rows ?? [];
  const count = data?.count ?? 0;
  const pages = Math.ceil(count / PAGE);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Fornvännen — hela beståndet (3 604 artiklar)"
        titleEn="Fornvännen — the full run (3,604 articles)"
        description="Systematisk ingång till Fornvännen, Sveriges äldsta arkeologiska tidskrift: 3 604 artiklar ur DiVA/Riksantikvarieämbetet (openAccess), filtrerbara på ämne, med direkt PDF-länk per artikel."
        descriptionEn="A systematic entry to Fornvännen, Sweden's oldest archaeology journal: 3,604 openAccess articles from DiVA, filterable by subject, each with a direct PDF link."
        keywords="Fornvännen, arkeologi, tidskrift, DiVA, Riksantikvarieämbetet, runologi, vikingatid, järnålder, artiklar"
        path={sv ? '/sv/fornvannen' : '/en/fornvannen'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-gold shrink-0" /> Fornvännen
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">
            {sv ? `Sveriges äldsta arkeologiska tidskrift · ${total ? total.toLocaleString('sv-SE') : '3 604'} artiklar` : `Sweden's oldest archaeology journal · ${total ? total.toLocaleString('sv-SE') : '3,604'} articles`}
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            {sv
              ? 'Hela det harvestade Fornvännen-beståndet ur DiVA (Riksantikvarieämbetet), öppet tillgängligt (openAccess). Filtrera på ämne, sök på titel eller författare, öppna PDF:en direkt. Metadata och fakta är fria; den verbatima texten är upphovsrättsskyddad och ligger hos DiVA — vi länkar ut.'
              : 'The full harvested Fornvännen run from DiVA (Swedish National Heritage Board), openAccess. Filter by subject, search title or author, open the PDF directly. Metadata and facts are free; the verbatim text is copyrighted and lives at DiVA — we link out.'}
          </p>
        </div>

        {/* Sök + kategori-facett */}
        <div className="mb-4 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={sv ? 'Sök titel eller författare…' : 'Search title or author…'}
              className="w-full rounded-lg border border-border bg-card/60 py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-gold" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setCat(null)}
              className={`rounded-full border px-3 py-1 text-xs ${cat === null ? 'border-gold bg-gold/15 text-amber-100' : 'border-border text-muted-foreground hover:border-gold/50'}`}>
              {sv ? 'Alla' : 'All'} <span className="opacity-60">{total || ''}</span>
            </button>
            {facets.filter((f) => f.category !== '(okategoriserad)').map((f) => (
              <button key={f.category} onClick={() => setCat(f.category)}
                className={`rounded-full border px-3 py-1 text-xs ${cat === f.category ? 'border-gold bg-gold/15 text-amber-100' : 'border-border text-muted-foreground hover:border-gold/50'}`}>
                {catLabel(f.category, sv)} <span className="opacity-60">{f.n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resultaträkning */}
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-gold" />}
          {count.toLocaleString('sv-SE')} {sv ? 'artiklar' : 'articles'}
          {cat && <span>· {catLabel(cat, sv)}</span>}
          {dq.trim().length >= 2 && <span>· "{dq.trim()}"</span>}
        </div>

        {/* Lista */}
        <ul className="divide-y divide-border/60 rounded-lg border border-border overflow-hidden">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 hover:bg-slate-800/30">
              <Link to={`/sources/${r.id}`} className="min-w-0 flex-1 text-sm text-foreground hover:text-gold">
                {r.title}
              </Link>
              {r.author && <span className="text-xs text-muted-foreground">{r.author}</span>}
              {r.written_year != null && <span className="text-xs text-muted-foreground tabular-nums">{r.written_year}</span>}
              {r.category && <Badge variant="outline" className="text-[10px] text-slate-300">{catLabel(r.category, sv)}</Badge>}
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" title={sv ? 'Ladda ner PDF (DiVA)' : 'Download PDF (DiVA)'}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
                  <Download className="h-3.5 w-3.5" />PDF
                </a>
              )}
            </li>
          ))}
          {rows.length === 0 && !isFetching && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">{sv ? 'Inga artiklar matchar filtret.' : 'No articles match the filter.'}</li>
          )}
        </ul>

        {/* Paginering */}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded border border-border px-3 py-1.5 text-muted-foreground disabled:opacity-40 hover:border-gold/50">
              {sv ? '← Föregående' : '← Previous'}
            </button>
            <span className="text-muted-foreground tabular-nums">{page + 1} / {pages}</span>
            <button disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              className="rounded border border-border px-3 py-1.5 text-muted-foreground disabled:opacity-40 hover:border-gold/50">
              {sv ? 'Nästa →' : 'Next →'}
            </button>
          </div>
        )}

        <p className="mt-6 text-[12px] text-muted-foreground/70 max-w-3xl flex items-center gap-1.5">
          <ExternalLink className="h-3.5 w-3.5" />
          {sv
            ? 'Källa: Fornvännen via DiVA (Riksantikvarieämbetet), openAccess. Fackgranskad. PDF-filerna ligger hos DiVA — vi hostar dem inte.'
            : 'Source: Fornvännen via DiVA (Swedish National Heritage Board), openAccess, peer-reviewed. PDFs live at DiVA — we do not host them.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Fornvannen;
