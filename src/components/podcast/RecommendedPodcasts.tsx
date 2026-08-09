import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Headphones, Youtube, ExternalLink, Search } from 'lucide-react';

// Kuraterade externa historiepoddar + YouTube-kanaler ur mediegrafen (media_directory-RPC).
// Sök (namn/skapare/tema/beskrivning) + sortering (avsnitt/namn/senaste/medium). Copyright-säkert:
// vi länkar ut till respektive skapare med UTM, skriver EGNA blurbar — inget hostat, inga avsnittstexter.
interface Src {
  id: string; name: string; medium: string; creator: string | null; url: string;
  blurb_sv: string | null; blurb_en: string | null; authority: boolean;
  episodes: number; latest: string | null; topics: string[] | null;
}
type Sort = 'episodes' | 'name' | 'latest' | 'medium';
const UTM = '?utm_source=vikingage.se&utm_medium=referral&utm_campaign=poddkatalog';
const withUtm = (u: string) => (u.includes('?') ? u : u + UTM);

export const RecommendedPodcasts: React.FC = () => {
  const { language } = useLanguage();
  const en = language === 'en';
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('episodes');

  const { data } = useQuery({
    queryKey: ['media_directory'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('media_directory');
      if (error) throw error;
      return (data ?? []) as Src[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = (data ?? []).slice();
    if (needle) {
      rows = rows.filter((s) => {
        const hay = [s.name, s.creator ?? '', s.blurb_sv ?? '', s.blurb_en ?? '', (s.topics ?? []).join(' ')]
          .join(' ').toLowerCase();
        return hay.includes(needle);
      });
    }
    rows.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'sv');
      if (sort === 'medium') return a.medium.localeCompare(b.medium) || b.episodes - a.episodes;
      if (sort === 'latest') return (b.latest ?? '').localeCompare(a.latest ?? '');
      return b.episodes - a.episodes; // 'episodes'
    });
    return rows;
  }, [data, q, sort]);

  return (
    <section className="mt-12 pt-8 border-t border-border/60 text-left">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Headphones className="h-6 w-6 text-gold" />
        {en ? 'History podcasts & channels' : 'Historiepoddar & kanaler'}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {en
          ? 'Third-party podcasts and YouTube channels we recommend. They belong to their respective creators — we link out.'
          : 'Externa poddar och YouTube-kanaler vi tipsar om. De tillhör respektive skapare — vi länkar bara ut.'}
      </p>

      {/* Sök + sortering */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={en ? 'Search podcasts, creators, topics…' : 'Sök podd, skapare, tema…'}
            className="w-full rounded-lg border border-border bg-card/60 py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <select
          value={sort} onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-lg border border-border bg-card/60 py-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
        >
          <option value="episodes">{en ? 'Most episodes' : 'Flest avsnitt'}</option>
          <option value="latest">{en ? 'Recently updated' : 'Senast uppdaterad'}</option>
          <option value="name">{en ? 'Name (A–Ö)' : 'Namn (A–Ö)'}</option>
          <option value="medium">{en ? 'By medium' : 'Efter medium'}</option>
        </select>
      </div>

      {shown.length === 0 && (
        <p className="text-sm text-muted-foreground">{en ? 'No matches.' : 'Inga träffar.'}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((s) => (
          <a key={s.id} href={withUtm(s.url)} target="_blank" rel="noopener noreferrer"
            className="group rounded-lg border border-border bg-card/60 p-4 hover:bg-card transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gold leading-snug">{s.name}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 mb-1">
              {s.medium === 'youtube'
                ? <Youtube className="h-3.5 w-3.5 text-gold/80" />
                : <Headphones className="h-3.5 w-3.5 text-gold/80" />}
              {s.creator && <span>{s.creator}</span>}
              {s.episodes > 0 && <span>· {s.episodes} {en ? 'episodes' : 'avsnitt'}</span>}
              {s.latest && <span className="tabular-nums">· {en ? 'updated' : 'uppd.'} {s.latest}</span>}
            </div>
            {(en ? s.blurb_en : s.blurb_sv) && (
              <p className="text-xs text-muted-foreground leading-relaxed">{en ? s.blurb_en : s.blurb_sv}</p>
            )}
            {s.topics && s.topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {s.topics.slice(0, 5).map((t) => (
                  <span key={t} className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};
