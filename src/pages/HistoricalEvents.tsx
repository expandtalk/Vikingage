import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarClock, MapPin, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHistoricalEvents } from '@/hooks/useHistoricalEvents';
import { useSpeciesIntroductions } from '@/hooks/useSpeciesIntroductions';

const formatYear = (y: number | null | undefined, sv: boolean) => {
  if (y == null) return '';
  if (y < 0) return `${Math.abs(y)} ${sv ? 'f.Kr.' : 'BCE'}`;
  return `${y} ${sv ? 'e.Kr.' : 'CE'}`;
};

// Färg per typ/proxy (både händelser och arter).
const TAG_COLOR: Record<string, string> = {
  // händelsetyper
  epidemic: '#ef4444', climate: '#38bdf8', catastrophe: '#fb923c',
  military: '#f87171', raid: '#fb7185', political: '#818cf8', exploration: '#2dd4bf',
  settlement: '#a3e635', religious: '#e879f9',
  // proxy-typer (arter/innovationer)
  adna: '#c084fc', zooarchaeology: '#f59e0b', iconography: '#34d399', onomastics: '#22d3ee', text: '#94a3b8',
};
const TAG_LABEL: Record<string, string> = {
  epidemic: 'epidemi', climate: 'klimat', catastrophe: 'katastrof',
  military: 'militärt', raid: 'plundring', political: 'politiskt', exploration: 'expedition',
  settlement: 'bosättning', religious: 'religiöst',
  adna: 'aDNA', zooarchaeology: 'zooarkeologi', iconography: 'ikonografi', onomastics: 'onomastik', text: 'text',
};
const CONF_STYLE: Record<string, string> = {
  belagd: 'border-emerald-500 text-emerald-300',
  trolig: 'border-amber-500 text-amber-300',
  tradition: 'border-slate-500 text-slate-300',
  hypotes: 'border-rose-500 text-rose-300',
  omtvistad: 'border-rose-500 text-rose-300',
};

interface TItem {
  id: string; kind: 'event' | 'species'; year: number; yearEnd?: number;
  title: string; tag: string; desc: string; confidence?: string;
  region?: string; sources?: string; note?: string;
}

const HistoricalEvents = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: events = [] } = useHistoricalEvents();
  const { data: species = [], isLoading } = useSpeciesIntroductions();
  const [kind, setKind] = useState<'all' | 'event' | 'species'>('all');
  const [tag, setTag] = useState<string>('all');
  const [query, setQuery] = useState('');

  const items = useMemo<TItem[]>(() => {
    const ev: TItem[] = events.map((e) => ({
      id: `e-${e.id}`, kind: 'event', year: e.year_start, yearEnd: e.year_end,
      title: sv ? e.event_name : e.event_name_en || e.event_name,
      tag: e.event_type ?? 'övrigt',
      desc: (sv ? e.description : e.description_en || e.description) ?? '',
      confidence: undefined, region: (e.region_affected ?? []).join(', '),
      sources: (e.sources ?? []).join('; '),
    }));
    const sp: TItem[] = species
      .filter((s) => s.date_from != null)
      .map((s) => ({
        id: `s-${s.id}`, kind: 'species', year: s.date_from as number, yearEnd: s.date_to ?? undefined,
        title: `${s.entity}${s.site_name ? ` — ${s.site_name}` : ''}`,
        tag: s.proxy_type, desc: s.date_text ?? '', confidence: s.confidence,
        region: [s.region, s.landscape].filter(Boolean).join(' · '),
        sources: s.source, note: s.note ?? undefined,
      }));
    return [...ev, ...sp].sort((a, b) => a.year - b.year);
  }, [events, species, sv]);

  const tags = useMemo(() => {
    const c = new Map<string, number>();
    items.forEach((i) => c.set(i.tag, (c.get(i.tag) ?? 0) + 1));
    return Array.from(c.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const q = query.trim().toLowerCase();
  const filtered = items.filter((i) => {
    if (kind !== 'all' && i.kind !== kind) return false;
    if (tag !== 'all' && i.tag !== tag) return false;
    if (q && ![i.title, i.desc, i.region, i.sources, i.note].some((t) => (t ?? '').toLowerCase().includes(q))) return false;
    return true;
  });

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Tidslinje"
        titleEn="Timeline"
        description="En kombinerad tidslinje över Nordens förhistoria: historiska händelser, klimatchocker och pestutbrott samt introduktioner av arter och innovationer (hund, katt, häst, segel) — med datering, proxy, osäkerhet och källor."
        descriptionEn="A combined timeline of Scandinavian prehistory: historical events, climate shocks and plague outbreaks, plus introductions of species and innovations, with dating, proxy, uncertainty and sources."
        keywords="tidslinje, historiska händelser, artintroduktioner, aDNA, pest, klimat, fimbulvinter, hund, katt, vikingatid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-gold" />
            {sv ? 'Tidslinje' : 'Timeline'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {sv
              ? 'Händelser (slag, kungaval, klimatchocker, pestutbrott) tillsammans med introduktioner av arter och innovationer (hund, katt, häst, segel) — samma tidsaxel, olika bevislinjer. Färgen visar typ/proxy; osäkerhet och källa redovisas per post.'
              : 'Events (battles, royal elections, climate shocks, plague) alongside introductions of species and innovations — one time axis, different lines of evidence. Colour shows type/proxy; uncertainty and source are shown per entry.'}
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{events.length}</strong> {sv ? 'händelser' : 'events'}</span>
            <span><strong className="text-foreground">{species.length}</strong> {sv ? 'art-/innovationsposter' : 'species/innovation entries'}</span>
          </div>
        </div>

        {/* Filter: typ av post */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(['all', 'event', 'species'] as const).map((k) => (
            <Button key={k} variant={kind === k ? 'default' : 'outline'} size="sm" onClick={() => setKind(k)}>
              {k === 'all' ? (sv ? 'Allt' : 'All') : k === 'event' ? (sv ? 'Händelser' : 'Events') : (sv ? 'Arter & innovationer' : 'Species & innovations')}
            </Button>
          ))}
        </div>

        {/* Fritextsök */}
        <div className="relative mb-3 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={sv ? 'Sök (t.ex. katt, pest, segel)…' : 'Search…'}
            className="pl-9 bg-slate-800/60 border-slate-600 text-white" />
        </div>

        {/* Filter: typ/proxy */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Button variant={tag === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTag('all')}>
            {sv ? 'Alla typer' : 'All types'}
          </Button>
          {tags.map(([t, n]) => (
            <Button key={t} variant={tag === t ? 'default' : 'outline'} size="sm" onClick={() => setTag(t)}
              className="gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TAG_COLOR[t] ?? '#fbbf24' }} />
              {TAG_LABEL[t] ?? t} <Badge variant="secondary">{n}</Badge>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-5 text-sm text-muted-foreground">
          <span>{sv ? 'Visar' : 'Showing'} <strong className="text-foreground">{filtered.length}</strong> {sv ? 'av' : 'of'} {items.length}</span>
          {(kind !== 'all' || tag !== 'all' || query) && (
            <Button variant="ghost" size="sm" onClick={() => { setKind('all'); setTag('all'); setQuery(''); }}
              className="h-7 text-xs text-gold hover:bg-slate-700/40">
              <X className="h-3 w-3 mr-1" />{sv ? 'Rensa' : 'Clear'}
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <div className="relative border-l-2 border-slate-600/50 ml-3 space-y-6">
            {filtered.map((i) => {
              const years = i.yearEnd && i.yearEnd !== i.year
                ? `${formatYear(i.year, sv)} – ${formatYear(i.yearEnd, sv)}`
                : formatYear(i.year, sv);
              const color = TAG_COLOR[i.tag] ?? '#fbbf24';
              return (
                <div key={i.id} className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-slate-900" style={{ backgroundColor: color }} />
                  <Card className="viking-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-mono text-gold">{years}</span>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                            {i.kind === 'event' ? (sv ? 'Händelse' : 'Event') : (sv ? 'Art/innovation' : 'Species')}
                          </Badge>
                          <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
                            {TAG_LABEL[i.tag] ?? i.tag}
                          </Badge>
                          {i.confidence && (
                            <Badge variant="outline" className={`text-xs ${CONF_STYLE[i.confidence] ?? 'border-slate-500 text-slate-300'}`}>
                              {i.confidence}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-foreground text-lg">{i.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {i.desc && <p className="text-sm text-muted-foreground">{i.desc}</p>}
                      {i.note && <p className="text-xs text-muted-foreground italic opacity-80">{i.note}</p>}
                      {i.region && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                          <MapPin className="h-3 w-3" />{i.region}
                        </div>
                      )}
                      {i.sources && (
                        <p className="text-[11px] text-muted-foreground opacity-75">
                          {sv ? 'Källa' : 'Source'}: {i.sources}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HistoricalEvents;
