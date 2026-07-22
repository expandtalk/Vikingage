import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Loader2, ScrollText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Källbibliotek (/texter): alla historiska källor grupperade efter texttyp, med
// länk till läsvyn (/sources/:id). Driver av RPC source_catalog (titel + strofantal).

interface CatalogRow {
  id: string;
  title: string;
  title_en: string | null;
  author: string | null;
  work_type: string | null;
  collection: string | null;
  meter: string | null;
  reliability: string | null;
  stanza_count: number;
}

const sb = supabase as unknown as { rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }> };

// Ordning + etikett per texttyp. Nyckel = work_type.
const SECTIONS: { key: string; sv: string; en: string }[] = [
  { key: 'edda_poem', sv: 'Poetiska Eddan', en: 'The Poetic Edda' },
  { key: 'saga', sv: 'Sagor', en: 'Sagas' },
  { key: 'krönika', sv: 'Krönikor', en: 'Chronicles' },
  { key: 'annaler', sv: 'Annaler', en: 'Annals' },
  { key: 'lag', sv: 'Landskaps- & rikslagar', en: 'Provincial & realm laws' },
  { key: 'stadga', sv: 'Stadgar', en: 'Statutes' },
  { key: 'epos', sv: 'Epos', en: 'Epic' },
  { key: 'biografi', sv: 'Biografier', en: 'Biographies' },
  { key: 'hagiografi', sv: 'Hagiografier', en: 'Hagiography' },
  { key: 'itinerarium', sv: 'Itinerarier', en: 'Itineraries' },
  { key: 'reseskildring', sv: 'Reseskildringar', en: 'Travel accounts' },
  { key: 'traktat', sv: 'Traktater', en: 'Treatises' },
  { key: 'studie', sv: 'Moderna studier', en: 'Modern studies' },
];
const OTHER = { key: '__other', sv: 'Övriga källor', en: 'Other sources' };

const SourceLibrary = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: rows, isLoading } = useQuery({
    queryKey: ['source-catalog'],
    queryFn: async () => {
      const { data, error } = await sb.rpc('source_catalog');
      if (error) throw error;
      return (data ?? []) as CatalogRow[];
    },
  });

  const bySection = (key: string) => {
    const all = rows ?? [];
    if (key === OTHER.key) return all.filter((r) => !r.work_type || !SECTIONS.some((s) => s.key === r.work_type));
    return all.filter((r) => r.work_type === key);
  };

  const Item = ({ r }: { r: CatalogRow }) => {
    const t = sv ? r.title : (r.title_en || r.title);
    return (
      <Link
        to={`/sources/${r.id}`}
        className="flex items-center justify-between gap-3 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 hover:border-gold/50 hover:bg-slate-800 transition-colors"
      >
        <span className="min-w-0">
          <span className="text-sm text-gray-100 truncate">{t}</span>
          {(r.title_en && sv) && <span className="text-xs text-gray-500 ml-2">{r.title_en}</span>}
          {r.meter && <span className="text-[11px] text-gray-500 block">{r.meter}</span>}
        </span>
        {r.stanza_count > 0 ? (
          <Badge variant="outline" className="shrink-0 border-emerald-600/50 text-emerald-300 text-[11px]">
            {r.stanza_count} {sv ? 'strofer' : 'stanzas'}
          </Badge>
        ) : (
          <Badge variant="outline" className="shrink-0 border-slate-600 text-gray-500 text-[11px]">
            {sv ? 'metadata' : 'metadata'}
          </Badge>
        )}
      </Link>
    );
  };

  const Section = ({ s }: { s: { key: string; sv: string; en: string } }) => {
    const items = bySection(s.key);
    if (!items.length) return null;
    // Eddan: dela på collection (Codex Regius vs utanför)
    if (s.key === 'edda_poem') {
      const cr = items.filter((r) => (r.collection || '').includes('Codex Regius') && !(r.collection || '').includes('utanför'));
      const nonCr = items.filter((r) => (r.collection || '').includes('utanför'));
      const rest = items.filter((r) => !cr.includes(r) && !nonCr.includes(r));
      const sub = (label: string, arr: CatalogRow[]) => arr.length ? (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gold/80 mb-2">{label}</h3>
          <div className="grid gap-1.5 sm:grid-cols-2">{arr.map((r) => <Item key={r.id} r={r} />)}</div>
        </div>
      ) : null;
      return (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <ScrollText className="h-5 w-5 text-gold" />{sv ? s.sv : s.en}
            <span className="text-xs text-gray-500 font-normal">({items.length})</span>
          </h2>
          {sub(sv ? 'I Codex Regius' : 'In Codex Regius', cr)}
          {sub(sv ? 'Utanför Codex Regius' : 'Outside Codex Regius', nonCr)}
          {sub(sv ? 'Övrigt' : 'Other', rest)}
        </section>
      );
    }
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-gold" />{sv ? s.sv : s.en}
          <span className="text-xs text-gray-500 font-normal">({items.length})</span>
        </h2>
        <div className="grid gap-1.5 sm:grid-cols-2">{items.map((r) => <Item key={r.id} r={r} />)}</div>
      </section>
    );
  };

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Texter & källor — Viking Age"
        titleEn="Texts & sources — Viking Age"
        description="Läs källorna i fulltext: Poetiska Eddan, landskapslagar, krönikor och sagor, ordnade efter typ."
        descriptionEn="Read the sources in full text: the Poetic Edda, provincial laws, chronicles and sagas, arranged by type."
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-1">{sv ? 'Texter & källor' : 'Texts & sources'}</h1>
        <p className="text-sm text-gray-400 mb-6">
          {sv
            ? 'Källorna i fulltext, strof för strof, ordnade efter typ. Grön markering = lagrad text; annars metadata.'
            : 'The sources in full text, stanza by stanza, arranged by type. Green = stored text; otherwise metadata.'}
        </p>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar…' : 'Loading…'}
          </div>
        )}

        {!isLoading && [...SECTIONS, OTHER].map((s) => <Section key={s.key} s={s} />)}
      </main>
      <Footer />
    </div>
  );
};

export default SourceLibrary;
