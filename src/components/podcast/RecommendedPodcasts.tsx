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
  const [topic, setTopic] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['media_directory'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('media_directory');
      if (error) throw error;
      return (data ?? []) as Src[];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Total-antal avsnitt över alla poddar/kanaler (visar skalan: "mer än 10 poddar").
  const totals = useMemo(() => {
    const rows = data ?? [];
    const eps = rows.reduce((a, s) => a + (s.episodes || 0), 0);
    const pods = rows.filter((s) => s.medium !== 'youtube').length;
    return { eps, pods, channels: rows.length };
  }, [data]);
  const fmt = (n: number) => n.toLocaleString('sv-SE').replace(/ |,/g, ' '); // svenskt mellanslag

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = (data ?? []).slice();
    if (topic) rows = rows.filter((s) => (s.topics ?? []).includes(topic));
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
  }, [data, q, sort, topic]);

  // Kategorier (teman) = distinkta topics över hela katalogen, med antal poddar per tema.
  // Härledda ur redan laddad media_directory-data (ingen extra fråga). Sorterade på antal, fallande.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of data ?? []) {
      for (const t of s.topics ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'sv'));
  }, [data]);

  return (
    <section className="mt-12 pt-8 border-t border-border/60 text-left">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Headphones className="h-6 w-6 text-gold" />
        {en ? 'History podcasts & channels' : 'Historiepoddar & kanaler'}
      </h2>
      <p className="text-sm text-muted-foreground mb-1 max-w-3xl">
        {en
          ? 'Third-party podcasts and YouTube channels we recommend. They belong to their respective creators — we link out.'
          : 'Externa poddar och YouTube-kanaler vi tipsar om. De tillhör respektive skapare — vi länkar bara ut.'}
      </p>
      {totals.channels > 0 && (
        <p className="text-sm text-gold/90 font-medium mb-4">
          {en
            ? `${totals.channels} channels · ${fmt(totals.eps)} episodes catalogued`
            : `${totals.channels} kanaler · ${fmt(totals.eps)} kategoriserade avsnitt`}
        </p>
      )}

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

      {/* Kategorier: vilka teman poddarna täcker. Klick filtrerar; klick igen (eller "Alla") nollar. */}
      {categories.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80 mb-2">
            {en ? 'Categories' : 'Kategorier'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setTopic(null)}
              aria-pressed={topic === null}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                topic === null
                  ? 'border-gold bg-gold/15 text-gold font-medium'
                  : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {en ? 'All' : 'Alla'}
            </button>
            {categories.map(([name, count]) => (
              <button
                key={name}
                type="button"
                onClick={() => setTopic((cur) => (cur === name ? null : name))}
                aria-pressed={topic === name}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  topic === name
                    ? 'border-gold bg-gold/15 text-gold font-medium'
                    : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {name} <span className="tabular-nums text-muted-foreground/70">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {shown.length === 0 && (
        <p className="text-sm text-muted-foreground">{en ? 'No matches.' : 'Inga träffar.'}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              {s.episodes > 0 && <span className="text-gold/90 font-medium">· {fmt(s.episodes)} {en ? 'episodes' : 'avsnitt'}</span>}
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
