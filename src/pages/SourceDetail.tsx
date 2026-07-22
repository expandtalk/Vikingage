import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, ScrollText, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Källsida: hela källtexten (source_texts, strof för strof) för en historisk källa.
// Nås från globalsöket (källa → /sources/:id, källtext → /sources/text/:textId).
// Källor utan lagrad fulltext (t.ex. Beowulf) visar metadata + beskrivning.

interface SourceRow {
  id: string;
  title: string;
  title_en: string | null;
  author: string | null;
  written_year: number | null;
  covers_period_start: number | null;
  covers_period_end: number | null;
  reliability: string | null;
  language: string | null;
  description: string | null;
  work_type: string | null;
  collection: string | null;
  manuscript: string | null;
  meter: string | null;
}

interface TextRow {
  id: string;
  stanza_no: number | null;
  original_norse: string | null;
  translation_sv: string | null;
  translation_en: string | null;
}

const sb = supabase as unknown as { from: (t: string) => any };

const SourceDetail = () => {
  const { id, textId } = useParams<{ id?: string; textId?: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';

  // /sources/text/:textId → slå upp vilken källa strofen hör till.
  const { data: textRef } = useQuery({
    queryKey: ['source-text-ref', textId],
    enabled: !!textId,
    queryFn: async () => {
      const { data, error } = await sb.from('source_texts').select('id, source_id').eq('id', textId).maybeSingle();
      if (error) throw error;
      return data as { id: string; source_id: string } | null;
    },
  });

  const sourceId = id ?? textRef?.source_id;

  const { data: source, isLoading } = useQuery({
    queryKey: ['source-detail', sourceId],
    enabled: !!sourceId,
    queryFn: async () => {
      const { data, error } = await sb.from('historical_sources').select('*').eq('id', sourceId).maybeSingle();
      if (error) throw error;
      return data as SourceRow | null;
    },
  });

  const { data: texts } = useQuery({
    queryKey: ['source-texts', sourceId],
    enabled: !!sourceId,
    queryFn: async () => {
      const { data, error } = await sb.from('source_texts')
        .select('id, stanza_no, original_norse, translation_sv, translation_en')
        .eq('source_id', sourceId)
        .order('stanza_no', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as TextRow[];
    },
  });

  // Deep-link till strof: scrolla + markera när texterna laddats.
  useEffect(() => {
    if (!textId || !texts?.length) return;
    const el = document.getElementById(`stanza-${textId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-gold');
      const t = window.setTimeout(() => el.classList.remove('ring-2', 'ring-gold'), 2000);
      return () => window.clearTimeout(t);
    }
  }, [textId, texts]);

  const title = source ? (sv ? source.title : (source.title_en || source.title)) : '';

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={source ? `${source.title} — Källa` : 'Källa'}
        titleEn={source ? `${source.title_en || source.title} — Source` : 'Source'}
        description={source?.description ?? 'Historisk källa med fulltext.'}
        descriptionEn={source?.description ?? 'Historical source with full text.'}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/royal-chronicles" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Kungakrönikor & källor' : 'Chronicles & sources'}
        </Link>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />{sv ? 'Laddar källa…' : 'Loading source…'}
          </div>
        )}

        {!isLoading && !source && (
          <p className="text-muted-foreground py-16 text-center">{sv ? 'Källan hittades inte.' : 'Source not found.'}</p>
        )}

        {source && (
          <>
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-gold shrink-0" />{title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {source.work_type && <Badge variant="secondary" className="text-xs">{source.work_type}</Badge>}
                {source.author && <Badge variant="outline" className="text-xs">{source.author}</Badge>}
                {source.written_year != null && <Badge variant="outline" className="text-xs">{sv ? 'nedtecknad' : 'written'} {source.written_year}</Badge>}
                {(source.covers_period_start != null || source.covers_period_end != null) && (
                  <Badge variant="outline" className="text-xs">
                    {sv ? 'skildrar' : 'covers'} {source.covers_period_start ?? '?'}–{source.covers_period_end ?? '?'}
                  </Badge>
                )}
                {source.language && <Badge variant="outline" className="text-xs">{source.language}</Badge>}
                {source.meter && <Badge variant="outline" className="text-xs">{source.meter}</Badge>}
              </div>
              {source.description && <p className="text-muted-foreground text-lg max-w-3xl">{source.description}</p>}
              {(source.collection || source.manuscript) && (
                <p className="text-sm text-muted-foreground/70 mt-2">
                  {[source.collection, source.manuscript].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {texts && texts.length > 0 ? (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-gold" />
                  {sv ? 'Källtexten' : 'The source text'}
                  <span className="text-sm font-normal text-muted-foreground">· {texts.length} {sv ? 'strofer/stycken' : 'stanzas/passages'}</span>
                </h2>
                <div className="space-y-4">
                  {texts.map((t) => (
                    <article
                      id={`stanza-${t.id}`}
                      key={t.id}
                      className="viking-card rounded-lg border border-border p-4 scroll-mt-24 transition-shadow"
                    >
                      {t.stanza_no != null && (
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                          {sv ? 'Strof' : 'Stanza'} {t.stanza_no}
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {t.original_norse && (
                          <p className="text-sm text-slate-200 font-serif italic whitespace-pre-line">{t.original_norse}</p>
                        )}
                        {(sv ? t.translation_sv : (t.translation_en || t.translation_sv)) && (
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {sv ? t.translation_sv : (t.translation_en || t.translation_sv)}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              texts && (
                <p className="text-sm text-muted-foreground border border-border rounded-lg p-4 viking-card">
                  {sv
                    ? 'Fulltexten för denna källa är ännu inte inlagd i databasen — ovan visas källans metadata och beskrivning.'
                    : 'The full text of this source has not yet been added to the database — its metadata and description are shown above.'}
                </p>
              )
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SourceDetail;
