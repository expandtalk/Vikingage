import React, { useMemo, useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
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
  settlement: '#a3e635', religious: '#e879f9', migration: '#c026d3',
  // proxy-typer (arter/innovationer)
  adna: '#c084fc', zooarchaeology: '#f59e0b', iconography: '#34d399', onomastics: '#22d3ee', text: '#94a3b8',
};
const TAG_LABEL: Record<string, string> = {
  epidemic: 'epidemi', climate: 'klimat', catastrophe: 'katastrof',
  military: 'militärt', raid: 'plundring', political: 'politiskt', exploration: 'expedition',
  settlement: 'bosättning', religious: 'religiöst', migration: 'migration/genetik',
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
  lat?: number | null; lng?: number | null; status?: string | null; eventId?: string;
}

// Karta över lokaliserade händelser. Ärlig flaggning: belagd = fylld, omtvistad = streckad,
// legendarisk = punktad "?". Omtvistade händelser med flera kandidatlägen (Svolder: Öresund vs
// Rügen) ritas som konkurrerande pins ur event_location_candidates. Klick i tidslinjen → flyg hit.
const STATUS_STYLE: Record<string, { color: string; dash?: string; label: string }> = {
  belagd: { color: '#22c55e', label: 'belagt läge' },
  omtvistad: { color: '#eab308', dash: '4 4', label: 'omtvistat läge' },
  legendarisk: { color: '#94a3b8', dash: '1 5', label: 'legendariskt/okänt läge' },
};
const EventsMap: React.FC<{ items: TItem[]; focus: { lat: number; lng: number } | null }> = ({ items, focus }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [cands, setCands] = useState<any[]>([]);

  useEffect(() => {
    (supabase.from('event_location_candidates') as any).select('*').then(({ data }: { data: any[] }) => setCands(data ?? []));
  }, []);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center: [58.5, 15.5], zoom: 4, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const layer = layerRef.current; if (!layer) return;
    layer.clearLayers();
    items.forEach((i) => {
      if (i.lat == null || i.lng == null) return;
      const st = STATUS_STYLE[i.status ?? 'belagd'] ?? STATUS_STYLE.belagd;
      L.circleMarker([i.lat, i.lng], { radius: 6, color: st.color, weight: 2, fillColor: st.color, fillOpacity: st.dash ? 0.15 : 0.75, dashArray: st.dash })
        .bindPopup(`<strong>${i.title}</strong><br/><span style="font-size:11px">${formatYear(i.year, true)} · ${st.label}</span>${i.note ? `<br/><span style="font-size:11px;color:#94a3b8">${i.note}</span>` : ''}`)
        .addTo(layer);
    });
    // Konkurrerande kandidatlägen (t.ex. Svolder) — dubbla pins med teori.
    cands.forEach((c) => {
      if (c.lat == null || c.lng == null) return;
      L.circleMarker([c.lat, c.lng], { radius: 7, color: '#eab308', weight: 2, fillColor: '#eab308', fillOpacity: 0.1, dashArray: '4 4' })
        .bindPopup(`<strong>Kandidatläge: ${c.theory}</strong><br/><span style="font-size:11px">${c.proponent ?? ''}</span>${c.note ? `<br/><span style="font-size:11px;color:#94a3b8">${c.note}</span>` : ''}${c.supporting_finds ? `<br/><span style="font-size:11px">Fynd: ${c.supporting_finds}</span>` : ''}`)
        .addTo(layer);
    });
  }, [items, cands]);

  useEffect(() => {
    if (focus && mapRef.current) mapRef.current.flyTo([focus.lat, focus.lng], 8, { duration: 0.7 });
  }, [focus]);

  return <div ref={ref} className="w-full rounded-lg border border-border mb-6" style={{ height: '55vh', minHeight: 380 }} />;
};

const HistoricalEvents = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: events = [] } = useHistoricalEvents();
  const { data: species = [], isLoading } = useSpeciesIntroductions();
  const [kind, setKind] = useState<'all' | 'event' | 'species'>('all');
  const [tag, setTag] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);
  const mapAnchorRef = useRef<HTMLDivElement>(null);

  const items = useMemo<TItem[]>(() => {
    const ev: TItem[] = events.map((e) => ({
      id: `e-${e.id}`, kind: 'event', year: e.year_start, yearEnd: e.year_end,
      title: sv ? e.event_name : e.event_name_en || e.event_name,
      tag: e.event_type ?? 'övrigt',
      desc: (sv ? e.description : e.description_en || e.description) ?? '',
      confidence: (e as any).location_status ?? undefined, region: (e.region_affected ?? []).join(', '),
      sources: (e.sources ?? []).join('; '),
      lat: (e as any).lat, lng: (e as any).lng, status: (e as any).location_status, eventId: e.id,
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

        {/* KARTA över lokaliserade händelser — klick i tidslinjen flyger hit */}
        <div ref={mapAnchorRef} />
        {(() => {
          const located = filtered.filter((i) => i.lat != null && i.lng != null);
          if (!located.length) return null;
          return (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />
                {sv
                  ? `${located.length} lokaliserade händelser — klicka en post i tidslinjen för att flyga dit. Fyllt = belagt läge, streckat = omtvistat, punktat = legendariskt/okänt. Gula ringar = konkurrerande kandidatlägen (t.ex. Svolder Öresund vs Rügen).`
                  : `${located.length} located events — click an entry below to fly there. Solid = attested, dashed = disputed, dotted = legendary/unknown. Yellow rings = competing candidate locations.`}</p>
              <EventsMap items={located} focus={focus} />
            </div>
          );
        })()}

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
                  <Card className={`viking-card ${i.lat != null ? 'cursor-pointer hover:ring-1 hover:ring-gold/50 transition-shadow' : ''}`}
                    onClick={i.lat != null && i.lng != null ? () => { setFocus({ lat: i.lat!, lng: i.lng! }); mapAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } : undefined}>
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
