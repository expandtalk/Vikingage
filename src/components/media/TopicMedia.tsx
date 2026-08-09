import React, { useMemo, useState } from 'react';
import { Headphones, Youtube, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMediaForTopic, type MediaHit } from '@/hooks/useMediaForTopic';

// Ämnesmatchad media i söksvaret, GRUPPERAD per podd/kanal (namnet står som underrubrik EN gång),
// sorterad nyast först, 6 per sida med paginering. Länkarna bär UTM (RPC) + CortIQ data-wfa-track.
// Länk-out, aldrig hostat. Vänsterställd text.
const PAGE = 6;

const MediaCard: React.FC<{ m: MediaHit }> = ({ m }) => (
  <a
    href={m.url}
    target="_blank"
    rel="noopener noreferrer"
    data-wfa-track
    data-wfa-event="click"
    data-wfa-content-id={`media:${m.medium}:${m.item_id}`}
    className="group block text-left rounded-lg border border-border bg-card/60 p-3 hover:bg-card transition-colors"
  >
    <div className="flex items-start justify-between gap-2">
      <span className="font-semibold text-gold leading-snug">{m.title}</span>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold shrink-0 mt-0.5" />
    </div>
    {m.summary_sv && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">{m.summary_sv}</p>}
    {m.published_at && <div className="text-[10px] text-muted-foreground/70 mt-1 tabular-nums">{m.published_at}</div>}
  </a>
);

// Ett medium (poddar el. video): gruppera per källa (ordnat på relevans = första förekomst),
// sortera avsnitt inom grupp (nyast/mest sedda först), platta ut och paginera 6/sida.
const MediumBlock: React.FC<{ icon: React.ReactNode; label: string; items: MediaHit[]; sortBy: 'date' | 'views'; en: boolean }>
  = ({ icon, label, items, sortBy, en }) => {
  const [page, setPage] = useState(0);
  const flat = useMemo(() => {
    const order: string[] = [];
    const bySource = new Map<string, MediaHit[]>();
    for (const m of items) {
      if (!bySource.has(m.source_name)) { bySource.set(m.source_name, []); order.push(m.source_name); }
      bySource.get(m.source_name)!.push(m);
    }
    const cmp = sortBy === 'date'
      ? (a: MediaHit, b: MediaHit) => (b.published_at ?? '').localeCompare(a.published_at ?? '')
      : (a: MediaHit, b: MediaHit) => (Number(b.view_count) || 0) - (Number(a.view_count) || 0);
    return order.flatMap((src) => bySource.get(src)!.slice().sort(cmp));
  }, [items, sortBy]);

  if (!flat.length) return null;
  const pages = Math.ceil(flat.length / PAGE);
  const slice = flat.slice(page * PAGE, page * PAGE + PAGE);

  const rows: React.ReactNode[] = [];
  let lastSrc = '';
  slice.forEach((m) => {
    if (m.source_name !== lastSrc) {
      lastSrc = m.source_name;
      rows.push(
        <h4 key={`h-${m.item_id}`} className="text-sm font-semibold text-foreground mt-3 first:mt-0">
          {m.source_name}{m.creator ? <span className="font-normal text-muted-foreground"> · {m.creator}</span> : null}
        </h4>,
      );
    }
    rows.push(<MediaCard key={m.item_id} m={m} />);
  });

  return (
    <div className="mb-5 text-left">
      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">{icon}{label}</h3>
      <div className="space-y-2">{rows}</div>
      {pages > 1 && (
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex items-center gap-1 disabled:opacity-40 hover:text-gold"><ChevronLeft className="h-3.5 w-3.5" />{en ? 'Prev' : 'Föreg.'}</button>
          <span className="tabular-nums">{page + 1} / {pages}</span>
          <button disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            className="inline-flex items-center gap-1 disabled:opacity-40 hover:text-gold">{en ? 'Next' : 'Nästa'}<ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </div>
  );
};

export const TopicMedia: React.FC<{ query: string }> = ({ query }) => {
  const { language } = useLanguage();
  const en = language === 'en';
  const { data } = useMediaForTopic(query, 30);
  const pods = data?.podcasts ?? [];
  const vids = data?.videos ?? [];
  if (!pods.length && !vids.length) return null;

  return (
    <section className="mt-8 pt-6 border-t border-border/60 text-left">
      <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Headphones className="h-5 w-5 text-gold" />
        {en ? `Podcasts & video about “${query}”` : `Poddar & video om ”${query}”`}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        {en ? 'Third-party episodes and films we recommend — we link out to the respective creators.'
            : 'Externa avsnitt och filmer vi tipsar om — vi länkar ut till respektive skapare.'}
      </p>
      <MediumBlock icon={<Headphones className="h-4 w-4 text-gold" />} label={en ? 'Podcasts' : 'Poddar'} items={pods} sortBy="date" en={en} />
      <MediumBlock icon={<Youtube className="h-4 w-4 text-gold" />} label="Video" items={vids} sortBy="views" en={en} />
    </section>
  );
};
