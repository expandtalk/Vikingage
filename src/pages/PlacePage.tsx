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
// beskrivningen + den återanvändbara PlaceMap:en (place_features_near runt platsen).

interface Place {
  slug: string; kind: 'cult_site' | 'heritage'; name: string;
  description: string | null; lat: number; lng: number;
  typeLabel: string | null; meta: string | null;
}

const sb = supabase as unknown as { from: (t: string) => any };

async function fetchPlace(slug: string): Promise<Place | null> {
  // 1) cult_sites
  const { data: c } = await sb.from('cult_sites')
    .select('name, description, lat, lng, type, region, sources, place_slug')
    .eq('place_slug', slug).maybeSingle();
  if (c) {
    const src = Array.isArray(c.sources) ? c.sources.join(' · ') : (c.sources ?? '');
    return { slug, kind: 'cult_site', name: c.name, description: c.description,
      lat: Number(c.lat), lng: Number(c.lng), typeLabel: c.type ?? 'kultplats',
      meta: [c.region, src].filter(Boolean).join(' · ') || null };
  }
  // 2) heritage_sites
  const { data: h } = await sb.from('heritage_sites')
    .select('name, description, lat, lng, raa_type, register_id, parish, landscape, period, place_slug')
    .eq('place_slug', slug).maybeSingle();
  if (h) {
    return { slug, kind: 'heritage', name: h.name, description: h.description,
      lat: Number(h.lat), lng: Number(h.lng), typeLabel: h.raa_type ?? 'lämning',
      meta: [h.period, h.parish ? `${h.parish} sn` : null, h.landscape, h.register_id].filter(Boolean).join(' · ') || null };
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

  // Rita platsens egen guldmarkör ovanpå PlaceMap:ens omgivningslager.
  const onMapReady = React.useCallback((map: L.Map) => {
    if (!place) return;
    try {
      L.circleMarker([place.lat, place.lng], { radius: 9, color: '#78350f', weight: 2, fillColor: '#fbbf24', fillOpacity: 1 })
        .bindPopup(`<b>${place.name}</b>`).addTo(map).openPopup();
    } catch { /* noop */ }
  }, [place]);

  const paragraphs = (place?.description ?? '').split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title={place?.name ?? (sv ? 'Plats' : 'Place')}
        description={paragraphs[0]?.slice(0, 200) ?? ''}
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
          <>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-gold" />{place.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {place.typeLabel && <Badge variant="secondary" className="text-xs capitalize">{place.typeLabel}</Badge>}
              {place.meta && <span className="text-sm text-muted-foreground">{place.meta}</span>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                <a href={`/explore?lat=${place.lat}&lng=${place.lng}`}
                  className="inline-flex items-center gap-1 text-gold hover:underline pt-1">
                  <MapPin className="h-4 w-4" />{sv ? 'Öppna i utforskaren (Explore)' : 'Open in Explore'}
                </a>
              </div>
              <div>
                <PlaceMap center={{ lat: place.lat, lng: place.lng }} zoom={12} radiusM={20000} heightClass="h-[520px]" onMapReady={onMapReady} />
                <p className="text-[11px] text-muted-foreground/70 mt-2">
                  {sv ? 'Guldmarkören = platsen; övriga punkter = fornlämningar/fynd i omgivningen (kronologiskt lager i legenden).' : 'Gold marker = the place; other points = nearby remains/finds (chronological layers in the legend).'}
                </p>
              </div>
            </div>

            {models3d.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">{sv ? 'Föremål från platsen i 3D' : 'Objects from the place in 3D'}</h2>
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PlacePage;
