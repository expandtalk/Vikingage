import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Headphones, ExternalLink, Clock } from 'lucide-react';

// Riktiga poddavsnitt ur media_items (medium='podcast', ~2900 avsnitt från 8 svenska historiepoddar).
// Ersätter de gamla hårdkodade egna avsnitten. Länkar UT till avsnittet (vi rehostar inte ljudet).
interface Ep { id: string; title: string; url: string; published_at: string | null; duration_seconds: number | null; media_sources: { name: string; creator: string | null } | null }

const fmtDur = (s: number | null) => (s ? `${Math.round(s / 60)} min` : null);

export const PodcastEpisodes: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [q, setQ] = useState('');
  const { data: eps = [], isLoading } = useQuery({
    queryKey: ['podcast-episodes', q],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Ep[]> => {
      let query = (supabase as any).from('media_items')
        .select('id,title,url,published_at,duration_seconds,media_sources(name,creator)')
        .eq('medium', 'podcast');
      if (q.trim()) query = query.ilike('title', `%${q.trim()}%`);
      const { data } = await query.order('published_at', { ascending: false, nullsFirst: false }).limit(40);
      return (data ?? []) as Ep[];
    },
  });
  return (
    <section className="mt-10">
      <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-foreground">
        <Headphones className="h-6 w-6 text-amber-400" />{sv ? 'Avsnitt att lyssna på' : 'Episodes to listen to'}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">{sv ? 'Färska avsnitt från svenska historie- och arkeologipoddar. Vi länkar ut till avsnittet.' : 'Fresh episodes from Swedish history & archaeology podcasts. We link out to each episode.'}</p>
      <input value={q} onChange={(e) => setQ(e.target.value)}
        placeholder={sv ? 'Sök avsnitt…' : 'Search episodes…'}
        aria-label={sv ? 'Sök poddavsnitt' : 'Search podcast episodes'}
        className="mb-4 w-full max-w-md rounded-lg border border-border bg-card/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60" />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {eps.map((e) => (
            <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border border-border bg-card/40 p-3 hover:border-amber-500/50 hover:bg-card/70">
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold leading-snug text-foreground">{e.title}</span>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-amber-400" />
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                {e.media_sources?.name && <span className="italic">{e.media_sources.name}</span>}
                {e.published_at && <span className="tabular-nums">{e.published_at.slice(0, 10)}</span>}
                {fmtDur(e.duration_seconds) && <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" />{fmtDur(e.duration_seconds)}</span>}
              </span>
            </a>
          ))}
          {!eps.length && <p className="text-sm text-muted-foreground">{sv ? 'Inga avsnitt matchade.' : 'No episodes matched.'}</p>}
        </div>
      )}
    </section>
  );
};
