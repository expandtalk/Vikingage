import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { MapPin, Route as RouteIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// /sv/plats — automatiskt index över alla kurerade platssidor (cult_sites + heritage_sites med
// place_slug), i alfabetisk ordning. Ny nod som får en place_slug dyker upp här av sig själv.

interface PlaceLink { slug: string; name: string; kind: string }
interface RoadLink { slug: string; name: string; road_type: string | null }
interface RegionLink { title: string; url: string; kind: string }
const sb = supabase as unknown as { from: (t: string) => any };

// Regioner & städer (content_pages, kurerade kunskapsnoder som Göteborg/Kalmar) — browsbara på /place.
async function fetchRegions(): Promise<RegionLink[]> {
  const { data } = await sb.from('content_pages').select('title_sv, url, kind').in('kind', ['region', 'page']);
  return ((data ?? []) as any[]).map((r) => ({ title: r.title_sv, url: r.url, kind: r.kind }))
    .filter((r) => r.title && r.url).sort((a, b) => a.title.localeCompare(b.title, 'sv'));
}

// Färdvägar & leder (viking_roads) — browsbara på samma index som platserna (Daniel).
async function fetchRoads(): Promise<RoadLink[]> {
  const { data } = await sb.from('viking_roads').select('slug, name, road_type').not('slug', 'is', null);
  return ((data ?? []) as any[]).sort((a, b) => a.name.localeCompare(b.name, 'sv'));
}
const ROAD_TYPE_SV: Record<string, string> = {
  kungavag: 'Kungaväg', landsvag: 'Landsväg', halvag: 'Hålväg', rullstensas: 'Rullstensås',
  vintervag: 'Vinter-/isväg', farled: 'Vattenled / farled', bro: 'Bro', vadstalle: 'Vadställe', knutpunkt: 'Knutpunkt',
};

async function fetchPlaces(): Promise<PlaceLink[]> {
  const [{ data: c }, { data: h }] = await Promise.all([
    sb.from('cult_sites').select('place_slug, name').not('place_slug', 'is', null),
    sb.from('heritage_sites').select('place_slug, name').not('place_slug', 'is', null),
  ]);
  const rows: PlaceLink[] = [
    ...((c ?? []) as any[]).map((r) => ({ slug: r.place_slug, name: r.name, kind: 'Kult- & offerplats' })),
    ...((h ?? []) as any[]).map((r) => ({ slug: r.place_slug, name: r.name, kind: 'Fornlämning' })),
  ];
  return rows.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
}

const PlaceIndex: React.FC = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: places = [], isLoading } = useQuery({ queryKey: ['place-index'], staleTime: 5 * 60 * 1000, queryFn: fetchPlaces });
  const { data: roads = [] } = useQuery({ queryKey: ['road-index'], staleTime: 5 * 60 * 1000, queryFn: fetchRoads });
  const { data: regions = [] } = useQuery({ queryKey: ['region-index'], staleTime: 5 * 60 * 1000, queryFn: fetchRegions });

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Platser"
        titleEn="Places"
        description="Kurerade, källgranskade platssidor — offermossar, båtgravfält, kastaler och kultplatser."
        descriptionEn="Curated, source-critical place pages — sacrificial bogs, boat-grave fields, kastals and cult sites."
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <MapPin className="h-8 w-8 text-gold" />{sv ? 'Platser' : 'Places'}
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-6">
          {sv ? 'Kurerade, källgranskade platssidor i alfabetisk ordning.' : 'Curated, source-critical place pages, alphabetically.'}
        </p>
        {regions.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <MapPin className="h-5 w-5 text-gold" />{sv ? 'Regioner & städer' : 'Regions & cities'}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-4xl">
              {regions.map((r) => (
                <li key={r.url}>
                  <a href={r.url}
                    className="flex items-center gap-2 rounded-lg border border-slate-700/50 px-3 py-2.5 hover:bg-slate-800/60 hover:border-gold/40">
                    <MapPin className="h-4 w-4 text-gold shrink-0" />
                    <span className="block text-sm text-foreground font-medium truncate">{r.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        {roads.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <RouteIcon className="h-5 w-5 text-gold" />{sv ? 'Färdvägar & leder' : 'Routes & roads'}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-4xl">
              {roads.map((r) => (
                <li key={r.slug}>
                  <a href={`${sv ? '/sv/led/' : '/en/road/'}${r.slug}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-700/50 px-3 py-2.5 hover:bg-slate-800/60 hover:border-gold/40">
                    <RouteIcon className="h-4 w-4 text-gold shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm text-foreground font-medium truncate">{r.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{ROAD_TYPE_SV[r.road_type ?? ''] ?? r.road_type}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
          <MapPin className="h-5 w-5 text-gold" />{sv ? 'Platser' : 'Places'}
        </h2>
        {isLoading ? (
          <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-4xl">
            {places.map((p) => (
              <li key={p.slug}>
                <a href={`${sv ? '/sv/plats/' : '/en/place/'}${p.slug}`}
                  className="flex items-center gap-2 rounded-lg border border-slate-700/50 px-3 py-2.5 hover:bg-slate-800/60 hover:border-gold/40">
                  <MapPin className="h-4 w-4 text-gold shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm text-foreground font-medium truncate">{p.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{p.kind}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PlaceIndex;
