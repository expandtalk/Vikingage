import React from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { PlaceMap } from '../components/map/PlaceMap';
import { HelmetViewer } from '../components/HelmetViewer';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Universell platssida /sv/plats/:slug — en riktig, delbar sida för varje kurerad nod
// (cult_sites + heritage_sites, matchade via place_slug). Renderar den källgranskade
// beskrivningen som LÄSBAR långform: markdown-lätt (## rubriker, ### underrubriker,
// - listor, **fet**, [länk](url)) → rubrikerna bryter av löptexten (400-ords-regeln),
// brödtexten är kontrastrik och satt på läsbar radlängd. Plus återanvändbar PlaceMap.

interface VisitorLink { label: string; url: string; kind?: string }
interface VisitorInfo { getting_there?: string; child_friendly?: string; trail?: string; visit_tips?: string; external_links?: VisitorLink[] }
interface Place {
  slug: string; kind: 'cult_site' | 'heritage'; name: string;
  description: string | null; lat: number; lng: number;
  typeLabel: string | null; meta: string | null; visitorInfo: VisitorInfo | null;
}

const sb = supabase as unknown as { from: (t: string) => any };
const METAL: Record<string, string> = { guld: '#f4c430', silver: '#c0c0c0', brons: '#cd7f32', koppar: '#b87333' };

// ---- Läsbar renderer (markdown-lätt → React) -------------------------------
// Stödjer: '## H2', '### H3', '- listrad', tom rad = styckebrytning, samt inline
// **fet** och [text](url). Bakåtkompatibelt: gammal löptext (stycken på \n\n) blir <p>.
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={`${keyBase}-b${i}`} className="font-semibold text-foreground">{m[1]}</strong>);
    } else {
      const external = /^https?:\/\//.test(m[3]);
      out.push(
        <a key={`${keyBase}-a${i}`} href={m[3]} className="text-gold hover:underline"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[2]}</a>
      );
    }
    last = m.index + m[0].length; i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderProse(text: string): React.ReactNode[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let k = 0;
  const flushPara = () => {
    if (!para.length) return;
    const key = `p${k++}`;
    blocks.push(<p key={key} className="text-[15px] leading-7 text-foreground/85 mb-4">{renderInline(para.join(' '), key)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    const key = `u${k++}`;
    blocks.push(
      <ul key={key} className="list-disc pl-5 mb-5 space-y-1.5 text-[15px] leading-7 text-foreground/85 marker:text-gold/60">
        {list.map((li, idx) => <li key={idx}>{renderInline(li, `${key}-${idx}`)}</li>)}
      </ul>
    );
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (line.startsWith('### ')) {
      flushPara(); flushList();
      const key = `h${k++}`;
      blocks.push(<h3 key={key} className="text-lg font-semibold text-foreground mt-7 mb-2">{renderInline(line.slice(4), key)}</h3>);
      continue;
    }
    if (line.startsWith('## ')) {
      flushPara(); flushList();
      const key = `h${k++}`;
      blocks.push(<h2 key={key} className="text-2xl font-semibold text-foreground mt-10 mb-3 pb-1.5 border-b border-border/50 first:mt-0">{renderInline(line.slice(3), key)}</h2>);
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) { flushPara(); list.push(line.slice(2)); continue; }
    flushList(); para.push(line);
  }
  flushPara(); flushList();
  return blocks;
}
// ---------------------------------------------------------------------------

async function fetchPlace(slug: string): Promise<Place | null> {
  // 1) cult_sites
  const { data: c } = await sb.from('cult_sites')
    .select('name, description, lat, lng, type, region, sources, place_slug, visitor_info')
    .eq('place_slug', slug).maybeSingle();
  if (c) {
    const src = Array.isArray(c.sources) ? c.sources.join(' · ') : (c.sources ?? '');
    return { slug, kind: 'cult_site', name: c.name, description: c.description,
      lat: Number(c.lat), lng: Number(c.lng), typeLabel: c.type ?? 'kultplats',
      meta: [c.region, src].filter(Boolean).join(' · ') || null, visitorInfo: c.visitor_info ?? null };
  }
  // 2) heritage_sites
  const { data: h } = await sb.from('heritage_sites')
    .select('name, description, lat, lng, raa_type, register_id, parish, landscape, period, place_slug, visitor_info')
    .eq('place_slug', slug).maybeSingle();
  if (h) {
    return { slug, kind: 'heritage', name: h.name, description: h.description,
      lat: Number(h.lat), lng: Number(h.lng), typeLabel: h.raa_type ?? 'lämning',
      meta: [h.period, h.parish ? `${h.parish} sn` : null, h.landscape, h.register_id].filter(Boolean).join(' · ') || null,
      visitorInfo: h.visitor_info ?? null };
  }
  return null;
}

const PlacePage: React.FC = () => {
  const { slug = '' } = useParams();
  const { language } = useLanguage();
  const sv = language === 'sv';

  const { data: place, isLoading } = useQuery({
    queryKey: ['place-page', slug],
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchPlace(slug),
  });

  // 3D-modeller kopplade till platsen (models_3d.place_slug) — t.ex. Valsgärde → vendelhjälmarna.
  const { data: models3d = [] } = useQuery({
    queryKey: ['place-models3d', slug], enabled: !!slug, staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await sb.from('models_3d')
        .select('slug, file_path, name_sv, attribution, sketchfab_url')
        .eq('place_slug', slug).order('sort', { ascending: true });
      return (data ?? []) as any[];
    },
  });

  // Relaterat: andra platssidor (syskon) + fynd från platsen (coins/SHM).
  const { data: siblings = [] } = useQuery({
    queryKey: ['place-siblings', slug], enabled: !!slug, staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const [c, h] = await Promise.all([
        sb.from('cult_sites').select('name, place_slug, type').not('place_slug', 'is', null),
        sb.from('heritage_sites').select('name, place_slug, raa_type').not('place_slug', 'is', null),
      ]);
      const rows = [
        ...((c.data ?? []) as any[]).map((r) => ({ name: r.name, slug: r.place_slug as string, type: r.type as string | null })),
        ...((h.data ?? []) as any[]).map((r) => ({ name: r.name, slug: r.place_slug as string, type: r.raa_type as string | null })),
      ];
      return rows.filter((r) => r.slug && r.slug !== slug);
    },
  });
  const { data: finds = [] } = useQuery({
    queryKey: ['place-finds', place?.name], enabled: !!place?.name, staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await sb.from('coins').select('id, name, find_place, metal').ilike('find_place', `%${place!.name}%`).limit(8);
      return (data ?? []) as any[];
    },
  });

  // Rita platsens egen guldmarkör ovanpå PlaceMap:ens omgivningslager.
  const onMapReady = React.useCallback((map: L.Map) => {
    if (!place) return;
    try {
      L.circleMarker([place.lat, place.lng], { radius: 9, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1 })
        .bindPopup(`<b>${place.name}</b>`).addTo(map).openPopup();
    } catch { /* noop */ }
  }, [place]);

  // Första stycket (rubrik-fritt) → meta-description.
  const firstPara = (place?.description ?? '')
    .split(/\n\n+/).map((p) => p.trim()).find((p) => p && !p.startsWith('#')) ?? '';

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={place?.name ?? (sv ? 'Plats' : 'Place')}
        description={firstPara.slice(0, 200)}
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : !place ? (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-foreground mb-2">{sv ? 'Platsen hittades inte' : 'Place not found'}</h1>
            <p className="text-muted-foreground">{sv ? 'Ingen kurerad plats med den adressen.' : 'No curated place at that address.'} <a href="/explore" className="text-gold hover:underline">Explore →</a></p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* HERO */}
            <header className="mb-6">
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <MapPin className="h-8 w-8 text-gold shrink-0" />{place.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {place.typeLabel && <Badge variant="secondary" className="text-xs capitalize">{place.typeLabel}</Badge>}
                {place.meta && <span className="text-sm text-muted-foreground">{place.meta}</span>}
              </div>
            </header>

            {/* MAGASINSLAYOUT: läsbar artikel + sticky karta-aside (staplas på mobil) */}
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:items-start">
              <article className="max-w-[68ch]">
                {renderProse(place.description ?? (sv ? 'Beskrivning saknas ännu.' : 'No description yet.'))}
                <a href={`/explore?lat=${place.lat}&lng=${place.lng}`}
                  className="inline-flex items-center gap-1 text-gold hover:underline mt-2">
                  <MapPin className="h-4 w-4" />{sv ? 'Öppna i utforskaren (Explore)' : 'Open in Explore'}
                </a>
              </article>

              <aside className="mt-8 lg:mt-0 lg:sticky lg:top-20">
                <PlaceMap center={{ lat: place.lat, lng: place.lng }} zoom={12} radiusM={20000} heightClass="h-[460px]" onMapReady={onMapReady} legendPlacement="inline" />
                <p className="text-[11px] text-muted-foreground/70 mt-2">
                  {sv ? 'Guldmarkören = platsen; övriga punkter = fornlämningar/fynd i omgivningen (kronologiska lager i legenden).' : 'Gold marker = the place; other points = nearby remains/finds (chronological layers in the legend).'}
                </p>
              </aside>
            </div>

            {models3d.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4 pb-1.5 border-b border-border/50">{sv ? 'Föremål från platsen i 3D' : 'Objects from the place in 3D'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {models3d.map((m) => (
                    <div key={m.slug}>
                      <HelmetViewer src={m.file_path} alt={m.name_sv} heightClass="h-[280px]"
                        attribution={<>{m.attribution}{m.sketchfab_url && <> · <a href={m.sketchfab_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Sketchfab</a></>}</>} />
                      <p className="text-sm text-foreground font-medium mt-1">{m.name_sv}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* BESÖK PLATSEN — praktiskt (källbelagt; tomma fält renderas inte, gissas ej) */}
            {place.visitorInfo && (
              (place.visitorInfo.external_links?.length || place.visitorInfo.getting_there || place.visitorInfo.child_friendly || place.visitorInfo.trail || place.visitorInfo.visit_tips) ? (
                <section className="mt-12 max-w-[68ch]">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 pb-1.5 border-b border-border/50">{sv ? 'Besök platsen' : 'Visiting'}</h2>
                  <div className="space-y-3 text-[15px] leading-7 text-foreground/85">
                    {place.visitorInfo.getting_there && <p><strong className="text-foreground">{sv ? 'Hitta dit: ' : 'Getting there: '}</strong>{place.visitorInfo.getting_there}</p>}
                    {place.visitorInfo.child_friendly && <p><strong className="text-foreground">{sv ? 'Barnvänligt: ' : 'Child-friendly: '}</strong>{place.visitorInfo.child_friendly}</p>}
                    {place.visitorInfo.trail && <p><strong className="text-foreground">{sv ? 'Vandringsled: ' : 'Trail: '}</strong>{place.visitorInfo.trail}</p>}
                    {place.visitorInfo.visit_tips && <p><strong className="text-foreground">{sv ? 'Värt att kolla extra på: ' : 'Worth a closer look: '}</strong>{place.visitorInfo.visit_tips}</p>}
                    {place.visitorInfo.external_links?.length ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {place.visitorInfo.external_links.map((l) => (
                          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-sm text-amber-100 hover:bg-gold/20">
                            {l.label} ↗
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null
            )}

            {/* RELATERAT — fynd från platsen + andra platssidor */}
            {(finds.length > 0 || siblings.length > 0) && (
              <section className="mt-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4 pb-1.5 border-b border-border/50">{sv ? 'Relaterat' : 'Related'}</h2>
                {finds.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-amber-300/90 mb-1.5">{sv ? 'Fynd från platsen' : 'Finds from the site'}</h3>
                    <div className="flex flex-wrap gap-2">
                      {finds.map((f) => (
                        <a key={f.id} href={`/coins/${f.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-foreground/90 hover:border-gold/50 hover:text-gold">
                          {f.metal && <span className="h-2 w-2 rounded-full" style={{ background: METAL[(f.metal || '').toLowerCase()] ?? '#e5e7eb' }} />}
                          {f.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {siblings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-300/90 mb-1.5">{sv ? 'Andra platser' : 'Other places'}</h3>
                    <div className="flex flex-wrap gap-2">
                      {siblings.map((s) => (
                        <a key={s.slug} href={`/sv/plats/${s.slug}`} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm text-foreground/90 hover:border-gold/50 hover:text-gold">
                          <MapPin className="h-3 w-3" />{s.name}
                        </a>
                      ))}
                      <a href="/sv/plats" className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm text-amber-100 hover:bg-gold/20">
                        {sv ? 'Alla platser →' : 'All places →'}
                      </a>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PlacePage;
