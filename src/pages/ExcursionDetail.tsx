import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { MeterBadge } from '@/components/inscription/MeterBadge';
import { MapPin, Calendar, Compass, ArrowLeft, ExternalLink, Scroll, User, BookOpen, Crown, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EXCURSIONS } from '@/data/excursions';
import { supabase } from '@/integrations/supabase/client';
import { nearestWithin } from '@/utils/geoDistance';

const ATTR_LABEL: Record<string, { sv: string; en: string }> = {
  signed: { sv: 'signerad', en: 'signed' },
  attributed: { sv: 'tillskriven', en: 'attributed' },
  similar: { sv: 'liknande hand', en: 'similar hand' },
  'signed on pair stone': { sv: 'signerad på parsten', en: 'signed on pair stone' },
};

const ExcursionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const excursion = EXCURSIONS.find((e) => e.id === id);

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Runsten (inskrift + ristare + edda-länkar) via RPC
  const { data: stone } = useQuery({
    queryKey: ['excursion-detail', excursion?.signum],
    enabled: !!excursion?.signum,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_excursion_detail', { p_signum: excursion!.signum });
      if (error) throw error;
      return data as null | {
        signum: string; meter: string | null; transliteration: string | null;
        translation_sv: string | null; translation_en: string | null; dating: string | null;
        scholarly_notes: string | null;
        carvers: { name: string; attribution: string; certainty: boolean }[];
        edda: { title: string; relation: string; notes: string | null }[];
      };
    },
  });

  const { data: sources } = useQuery({
    queryKey: ['excursion-sources', excursion?.relatedSources],
    enabled: !!excursion?.relatedSources?.length,
    queryFn: async () => {
      const { data, error } = await supabase.from('historical_sources')
        .select('title, title_en, author, written_year, description, reliability')
        .in('title', excursion!.relatedSources!);
      if (error) throw error;
      return data;
    },
  });

  const { data: kings } = useQuery({
    queryKey: ['excursion-kings', excursion?.relatedKings],
    enabled: !!excursion?.relatedKings?.length,
    queryFn: async () => {
      const { data, error } = await supabase.from('historical_kings')
        .select('name, reign_start, reign_end, description')
        .in('name', excursion!.relatedKings!);
      if (error) throw error;
      return data;
    },
  });

  const { data: photoManifest } = useQuery({
    queryKey: ['excursion-photos-manifest'],
    enabled: !!excursion?.photoDir,
    queryFn: async () => {
      const r = await fetch('/excursion-photos/manifest.json');
      return r.ok ? (await r.json() as Record<string, string[]>) : {};
    },
  });
  const photos = excursion?.photoDir && photoManifest?.[excursion.photoDir]
    ? photoManifest[excursion.photoDir].map((f) => `/excursion-photos/${excursion.photoDir}/${f}`)
    : [];

  const nearby = excursion
    ? nearestWithin(excursion.coords, EXCURSIONS.filter((e) => e.id !== excursion.id), (e) => e.coords, 45, 5)
    : [];

  useEffect(() => {
    if (!excursion || !containerRef.current || mapRef.current) return;
    const { lat, lng } = excursion.coords;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [lat, lng], zoom: 14, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    L.circleMarker([lat, lng], { radius: 9, color: '#78350f', fillColor: '#eab308', fillOpacity: 0.9, weight: 2 })
      .addTo(map).bindPopup(`<strong>${excursion.name}</strong>`);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    const norm = (s: unknown) => String(s ?? '').toLowerCase().trim();
    const colorByType = new Map((excursion.monumentTypes ?? []).map((m) => [norm(m.sv), m.color]));
    let cancelled = false;
    fetch(`/excursion-data/${excursion.id}.geojson`)
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => {
        if (cancelled || !geo || !mapRef.current) return;
        const layer = L.geoJSON(geo, {
          style: () => ({ color: '#eab308', weight: 2, fillColor: '#eab308', fillOpacity: 0.12 }),
          pointToLayer: (feature, latlng) => {
            const typ = feature?.properties?.type ?? feature?.properties?.typ;
            return L.circleMarker(latlng, { radius: 5, color: '#1c1917', weight: 1, fillColor: colorByType.get(norm(typ)) ?? '#94a3b8', fillOpacity: 0.85 });
          },
          onEachFeature: (feature, lyr) => {
            const p = feature?.properties ?? {};
            lyr.bindPopup(`<strong>${p.type ?? p.typ ?? 'Lämning'}</strong>${p.raa ? `<br/>${p.raa}` : ''}`);
          },
        }).addTo(mapRef.current);
        try { const b = layer.getBounds(); if (b.isValid()) mapRef.current.fitBounds(b, { padding: [30, 30], maxZoom: 17 }); } catch { /* punktlös */ }
      })
      .catch(() => { /* ingen geodata */ });

    // Regionens ALLA fornborgar live ur DB:n (single source of truth — ingen statisk kopia).
    // Färg efter status: rekonstruerad/utgrävd/ej utgrävd (matchar monumentTypes-legenden).
    if (excursion.fortressRegion) {
      const statusColor = (f: { status?: string | null; excavated?: boolean | null }) =>
        f.status === 'reconstructed' ? '#22c55e' : f.excavated ? '#eab308' : '#ef4444';
      const parsePoint = (c: unknown): [number, number] | null => {
        // Postgres point(lng,lat): PostgREST ger "(lng,lat)"-sträng eller {x,y}-objekt
        if (typeof c === 'string') {
          const m = c.match(/\(([-\d.]+),([-\d.]+)\)/);
          return m ? [parseFloat(m[2]), parseFloat(m[1])] : null; // [lat, lng]
        }
        if (c && typeof c === 'object' && 'x' in (c as object)) {
          const p = c as { x: number; y: number };
          return [p.y, p.x];
        }
        return null;
      };
      supabase.from('viking_fortresses')
        .select('name, fortress_type, status, excavated, description, coordinates')
        .ilike('region', `%${excursion.fortressRegion}%`)
        .then(({ data }) => {
          if (cancelled || !mapRef.current || !data?.length) return;
          const group = L.featureGroup();
          for (const f of data) {
            const ll = parsePoint(f.coordinates);
            if (!ll) continue;
            L.circleMarker(ll, { radius: 7, color: '#1c1917', weight: 1, fillColor: statusColor(f), fillOpacity: 0.9 })
              .bindPopup(`<strong>${f.name}</strong><br/>${f.status === 'reconstructed' ? (sv ? 'Rekonstruerad' : 'Reconstructed') : f.excavated ? (sv ? 'Utgrävd' : 'Excavated') : (sv ? 'Ej utgrävd' : 'Not excavated')}${f.description ? `<br/><em>${f.description}</em>` : ''}`)
              .addTo(group);
          }
          group.addTo(mapRef.current);
          try { const b = group.getBounds(); if (b.isValid()) mapRef.current.fitBounds(b, { padding: [30, 30] }); } catch { /* tomt */ }
        });
    }

    return () => { cancelled = true; map.remove(); mapRef.current = null; };
  }, [excursion]);

  if (!excursion) {
    return (
      <div className="min-h-screen viking-bg">
        <Header /><Breadcrumbs />
        <main className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">{sv ? 'Utflyktsmålet hittades inte.' : 'Excursion not found.'}</p>
          <Link to="/excursions" className="text-gold hover:underline mt-4 inline-block">{sv ? '← Tillbaka till utflykter' : '← Back to excursions'}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <section className="viking-card rounded-lg border border-border p-5">
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">{icon}{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title={`${excursion.name} — Utflykt`} titleEn={`${excursion.name} — Excursion`}
        description={excursion.sv} descriptionEn={excursion.en} />
      <Header /><Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <Link to="/excursions" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Alla utflykter' : 'All excursions'}
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3"><MapPin className="h-8 w-8 text-gold" />{excursion.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">{excursion.region}</Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />{excursion.period}</Badge>
            {stone?.meter && <MeterBadge meter={stone.meter} sv={sv} />}
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl">{sv ? excursion.sv : excursion.en}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div ref={containerRef} className="w-full rounded-lg border border-border" style={{ height: '55vh', minHeight: 380 }} />
            <div className="mt-2 flex flex-wrap gap-3">
              <a href={`/explore?lat=${excursion.coords.lat}&lng=${excursion.coords.lng}`} className="inline-flex items-center gap-1 text-xs text-gold hover:underline"><Compass className="h-3 w-3" />{sv ? 'Utforska i kartan' : 'Explore on map'}</a>
              <a href={`https://www.openstreetmap.org/?mlat=${excursion.coords.lat}&mlon=${excursion.coords.lng}#map=15/${excursion.coords.lat}/${excursion.coords.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gold hover:underline"><ExternalLink className="h-3 w-3" />OpenStreetMap</a>
            </div>
          </div>
          {excursion.monumentTypes && excursion.monumentTypes.length > 0 && (
            <aside className="lg:col-span-1">
              <div className="viking-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">{sv ? 'Monument på platsen' : 'Monuments on site'}</h2>
                <p className="text-xs text-muted-foreground mb-3">{sv ? 'Gravtyper enligt informationsskylten. Kartan visar gravfältets registrerade yta (RAÄ, CC0); de ~1000 enskilda gravarna finns inte som öppen geodata.' : 'Grave types per the information sign. The map shows the registered extent (RAÄ, CC0); the ~1000 individual graves are not open geodata.'}</p>
                <ul className="space-y-2">
                  {excursion.monumentTypes.map((m) => (
                    <li key={m.sv} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border border-black/20" style={{ backgroundColor: m.color }} aria-hidden="true" />
                      <span>{sv ? m.sv : m.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {photos.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">{sv ? 'Bilder från platsen' : 'Photos from the site'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((src, i) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border bg-card">
                  <img src={src} alt={`${excursion.name} — ${sv ? 'foto' : 'photo'} ${i + 1}`} loading="lazy" className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Runsten */}
          {stone && (
            <Section icon={<Scroll className="h-5 w-5 text-gold" />} title={`${sv ? 'Om runstenen' : 'About the runestone'} ${stone.signum}`}>
              {stone.transliteration && (
                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Translitteration' : 'Transliteration'}</div>
                  <div className="p-3 bg-black/20 rounded font-mono text-sm text-slate-200 whitespace-pre-wrap">{stone.transliteration}</div>
                </div>
              )}
              {(stone.translation_sv || stone.translation_en) && (
                <p className="text-sm text-muted-foreground italic mb-3">"{(sv ? stone.translation_sv : stone.translation_en) || stone.translation_sv || stone.translation_en}"</p>
              )}
              {stone.carvers.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1"><User className="h-3 w-3" />{sv ? 'Ristare' : 'Carver(s)'}</div>
                  <ul className="space-y-1">
                    {stone.carvers.map((c, i) => (
                      <li key={i} className="text-sm text-foreground flex items-center gap-2">
                        {c.name}
                        <Badge variant="outline" className="text-[10px]">{(ATTR_LABEL[c.attribution]?.[sv ? 'sv' : 'en']) ?? c.attribution}{!c.certainty ? (sv ? ', osäker' : ', uncertain') : ''}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {stone.edda.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Litterära kopplingar' : 'Literary links'}</div>
                  <ul className="space-y-0.5">
                    {stone.edda.map((e, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{e.title} <span className="text-muted-foreground/60">({e.relation})</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {stone.scholarly_notes && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sv ? 'Forskningsnoter' : 'Scholarly notes'}</div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{stone.scholarly_notes}</p>
                </div>
              )}
            </Section>
          )}

          {/* Källor */}
          {sources && sources.length > 0 && (
            <Section icon={<BookOpen className="h-5 w-5 text-gold" />} title={sv ? 'Källor' : 'Sources'}>
              <ul className="space-y-3">
                {sources.map((s) => (
                  <li key={s.title} className="text-sm">
                    <div className="font-semibold text-foreground">{sv ? s.title : (s.title_en || s.title)}</div>
                    <div className="text-xs text-muted-foreground">{s.author}{s.written_year ? ` (${s.written_year})` : ''}</div>
                    {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Personer */}
          {kings && kings.length > 0 && (
            <Section icon={<Crown className="h-5 w-5 text-gold" />} title={sv ? 'Personer' : 'People'}>
              <ul className="space-y-3">
                {kings.map((k) => (
                  <li key={k.name} className="text-sm">
                    <div className="font-semibold text-foreground">{k.name}{(k.reign_start || k.reign_end) ? <span className="text-muted-foreground font-normal"> ({k.reign_start}–{k.reign_end})</span> : null}</div>
                    {k.description && <p className="text-sm text-muted-foreground mt-1">{k.description}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* I närheten */}
          {nearby.length > 0 && (
            <Section icon={<Navigation className="h-5 w-5 text-gold" />} title={sv ? 'I närheten' : 'Nearby'}>
              <ul className="space-y-1">
                {nearby.map(({ item, km }) => (
                  <li key={item.id} className="text-sm flex justify-between gap-2">
                    <Link to={`/excursions/${item.id}`} className="text-gold hover:underline truncate">{item.name}</Link>
                    <span className="text-muted-foreground shrink-0 tabular-nums">{km.toFixed(0)} km</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExcursionDetail;
