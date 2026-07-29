import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { MeterBadge } from '@/components/inscription/MeterBadge';
import { MapPin, Calendar, Compass, ArrowLeft, ExternalLink, Scroll, User, BookOpen, Crown, Navigation, Sparkles, Landmark } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EXCURSIONS } from '@/data/excursions';
import { supabase } from '@/integrations/supabase/client';
import { nearestWithin } from '@/utils/geoDistance';
import { RELIGIOUS_PLACES } from '@/utils/religiousLocations/religiousPlacesData';
import { ARCHAEOLOGICAL_FINDS } from '@/utils/archaeologicalFinds';
import { PLACE_TYPE_LABEL, FIND_TYPE_LABEL } from '@/components/excursions/nearbyLabels';
import { ExcursionProse, excerptText } from '@/components/excursions/ExcursionProse';

const ATTR_LABEL: Record<string, { sv: string; en: string }> = {
  signed: { sv: 'signerad', en: 'signed' },
  attributed: { sv: 'tillskriven', en: 'attributed' },
  similar: { sv: 'liknande hand', en: 'similar hand' },
  'signed on pair stone': { sv: 'signerad på parsten', en: 'signed on pair stone' },
};

// Lägeshypoteser: monument (känt) i guld, kandidatplatser i blått efter konfidens,
// referens/övrigt i grått. lost/utan koordinat visas bara i listan ("läge ej fastställt").
const HYP_STYLE = (kind: string, conf: string | null): { r: number; fill: string; stroke: string } => {
  if (kind === 'monument') return { r: 9, fill: '#eab308', stroke: '#78350f' };
  if (kind === 'candidate') return conf === 'medium'
    ? { r: 8, fill: '#0ea5e9', stroke: '#0c4a6e' }
    : { r: 6, fill: '#60a5fa', stroke: '#1e3a8a' };
  return { r: 5, fill: '#94a3b8', stroke: '#334155' };
};
const HYP_ORDER: Record<string, number> = { monument: 0, candidate: 1, lost: 2, reference: 3 };
const CONF_ORDER: Record<string, number> = { confirmed: 0, high: 1, medium: 2, low: 3, speculative: 4, unknown: 5 };
const HYP_KIND_LABEL: Record<string, { sv: string; en: string }> = {
  monument: { sv: 'Monument (känt läge)', en: 'Monument (known)' },
  candidate: { sv: 'Kandidatplats', en: 'Candidate site' },
  lost: { sv: 'Ursprunglig plats', en: 'Original site' },
  reference: { sv: 'Referensfynd', en: 'Reference find' },
};

const ExcursionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const sv = language === 'sv';
  const excursion = EXCURSIONS.find((e) => e.id === id);

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const radiusLayerRef = useRef<L.FeatureGroup | null>(null);
  const [shoreYear, setShoreYear] = useState<number | null>(null);
  const [radius, setRadius] = useState(500);
  useShorelineOverlay(mapRef, shoreYear);

  // Sevärdheter inom reglerbar radie (features_near-RPC: heritage_sites + kyrkor, avstånd i meter).
  const { data: nearbyDb } = useQuery({
    queryKey: ['excursion-features-near', excursion?.coords.lat, excursion?.coords.lng, radius],
    enabled: !!excursion,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('features_near', { p_lat: excursion!.coords.lat, p_lng: excursion!.coords.lng, radius_m: radius });
      if (error) throw error;
      return (data ?? []) as { kind: string; name: string; raa_type: string | null; lat: number; lng: number; dist_m: number }[];
    },
  });

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

  // Lägeshypoteser (monument vs ursprunglig plats vs kandidatpunkter) — location_hypotheses.
  // Bara för utflykter med hypothesesSlug (Mora stenar först). Källbelagt, koord bara där verifierad.
  const { data: hypotheses } = useQuery({
    queryKey: ['excursion-hypotheses', excursion?.hypothesesSlug],
    enabled: !!excursion?.hypothesesSlug,
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { from: (t: string) => any })
        .from('location_hypotheses')
        .select('kind, label, lat, lng, confidence, rationale, source')
        .eq('feature_slug', excursion!.hypothesesSlug);
      if (error) throw error;
      return data as {
        kind: string; label: string; lat: number | null; lng: number | null;
        confidence: string | null; rationale: string | null; source: string | null;
      }[];
    },
  });

  // Runstenar inom 40 km via nearby_features-RPC (runic_inscriptions har point-koord som ej
  // gick att bbox:a klient-sidigt — därav RPC:n).
  const { data: nearbyRunestones } = useQuery({
    queryKey: ['excursion-nearby-runestones', excursion?.coords.lat, excursion?.coords.lng],
    enabled: !!excursion,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('nearby_features', {
        p_lat: excursion!.coords.lat, p_lng: excursion!.coords.lng, p_radius_km: 40, p_limit: 200,
      });
      if (error) throw error;
      return (data as { feature_type: string; feature_id: string; label: string; distance_km: number }[])
        .filter((f) => f.feature_type === 'runestone').slice(0, 6);
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
  // RAÄ/Wikimedia-foton ur inscription_media (CC0/PD/CC-BY) för utflykter med signum —
  // t.ex. Karlevistenen (Öl 1) har 9 foton i DB som annars aldrig visades på sidan.
  const { data: inscriptionMedia } = useQuery({
    queryKey: ['excursion-media', excursion?.signum],
    enabled: !!excursion?.signum,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscription_media')
        .select('media_url, copyright_info, photographer, source_institution, inscription:inscription_id!inner(signum)')
        .eq('inscription.signum', excursion!.signum!)
        .eq('media_type', 'image');
      if (error) throw error;
      return (data as unknown as { media_url: string; copyright_info: string | null; photographer: string | null; source_institution: string | null }[])
        .filter((m) => m.media_url);
    },
  });

  const manifestPhotos = excursion?.photoDir && photoManifest?.[excursion.photoDir]
    ? photoManifest[excursion.photoDir].map((f) => ({ src: `/excursion-photos/${excursion.photoDir}/${f}`, credit: undefined as string | undefined }))
    : [];
  const mediaCredit = (m: { photographer: string | null; source_institution: string | null; copyright_info: string | null }): string | undefined => {
    const parts = [m.photographer, m.source_institution].filter(Boolean);
    const lic = m.copyright_info?.includes('publicdomain') ? 'PD' : m.copyright_info?.includes('by') ? 'CC BY' : undefined;
    const label = [parts.join(', '), lic].filter(Boolean).join(' · ');
    return label || undefined;
  };
  // Slå ihop + deduplicera på filnamn (lokala manifest-fotot finns ofta även i DB).
  const seen = new Set(manifestPhotos.map((p) => p.src.split('/').pop()));
  const photos = [
    ...manifestPhotos,
    ...(inscriptionMedia ?? [])
      .filter((m) => !seen.has(m.media_url.split('/').pop()?.split('?')[0]))
      .map((m) => ({ src: m.media_url, credit: mediaCredit(m) })),
  ];

  const nearby = excursion
    ? nearestWithin(excursion.coords, EXCURSIONS.filter((e) => e.id !== excursion.id), (e) => e.coords, 45, 5)
    : [];

  // Kultplatser & fynd inom 40 km (flyttat hit från listkorten 2026-07-20).
  const nearbyPlaces = excursion
    ? nearestWithin(excursion.coords, RELIGIOUS_PLACES, (p) => p.coordinates, 40, 5)
    : [];
  const nearbyFinds = excursion
    ? nearestWithin(excursion.coords, ARCHAEOLOGICAL_FINDS, (f) => ({ lat: f.lat, lng: f.lng }), 40, 5)
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

    // Extra intressepunkter (t.ex. skålgropsstenen + gravfältet i samma utflykt)
    const extraPts = excursion.points ?? [];
    extraPts.forEach((pt) => {
      L.marker([pt.lat, pt.lng]).addTo(map)
        .bindPopup(`<strong>${pt.name}</strong>${pt.note ? `<br/>${pt.note}` : ''}`);
    });
    if (extraPts.length) {
      const pts: [number, number][] = [[lat, lng], ...extraPts.map((p) => [p.lat, p.lng] as [number, number])];
      try { map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15 }); } catch { /* enda punkt */ }
    }
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

  // Lägeshypotes-lagret: kandidatpunkter + referensfynd (monumentet är redan huvudpinnen).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hypotheses?.length) return;
    const group = L.featureGroup();
    const pts: [number, number][] = [[excursion!.coords.lat, excursion!.coords.lng]];
    hypotheses.forEach((h) => {
      if (h.lat == null || h.lng == null || h.kind === 'monument') return; // monumentet = basmarkören
      const s = HYP_STYLE(h.kind, h.confidence);
      pts.push([h.lat, h.lng]);
      L.circleMarker([h.lat, h.lng], { radius: s.r, color: s.stroke, weight: 2, fillColor: s.fill, fillOpacity: 0.9, dashArray: '3,3' })
        .bindPopup(`<strong>${h.label}</strong>${h.confidence ? `<br/><em>${sv ? 'konfidens' : 'confidence'}: ${h.confidence}</em>` : ''}${h.rationale ? `<br/>${h.rationale}` : ''}${h.source ? `<br/><small>${h.source}</small>` : ''}`)
        .addTo(group);
    });
    group.addTo(map);
    if (pts.length > 1) { try { map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 15 }); } catch { /* noop */ } }
    return () => { try { map.removeLayer(group); } catch { /* noop */ } };
  }, [hypotheses, excursion, sv]);

  // Räckviddscirkel + närbelägna lämningar/kyrkor ur DB (reglerbar radie).
  useEffect(() => {
    const map = mapRef.current; if (!map || !excursion) return;
    if (radiusLayerRef.current) { try { map.removeLayer(radiusLayerRef.current); } catch { /* noop */ } radiusLayerRef.current = null; }
    const g = L.featureGroup();
    L.circle([excursion.coords.lat, excursion.coords.lng], { radius, color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.06 }).addTo(g);
    (nearbyDb ?? []).forEach((f) => {
      const church = f.kind === 'church', isRune = f.kind === 'runestone';
      const fill = church ? '#38bdf8' : isRune ? '#eab308' : '#22d3ee';
      const link = isRune ? `/inscription/${encodeURIComponent(f.raa_type || '')}` : `/explore?center=${f.lat},${f.lng}&zoom=15`;
      const linkLabel = isRune ? (sv ? 'Öppna runinskriften' : 'Open inscription') : (sv ? 'Öppna på kartan' : 'Open on map');
      L.circleMarker([f.lat, f.lng], { radius: church || isRune ? 6 : 4, color: isRune ? '#78350f' : '#0c4a6e', weight: 1, fillColor: fill, fillOpacity: 0.85 })
        .bindPopup(`<strong>${church ? '⛪ ' : isRune ? 'ᚱ ' : ''}${f.name}</strong><br/><span style="font-size:11px;color:#666">${isRune ? '' : (f.raa_type || '') + ' · '}${f.dist_m < 1000 ? f.dist_m + ' m' : (f.dist_m / 1000).toFixed(1) + ' km'}</span><br/><a href="${link}" style="font-size:11px">${linkLabel} →</a>`)
        .addTo(g);
    });
    g.addTo(map); radiusLayerRef.current = g;
    return () => { try { map.removeLayer(g); } catch { /* noop */ } };
  }, [nearbyDb, radius, excursion, sv]);

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
        description={excerptText(excursion.sv)} descriptionEn={excerptText(excursion.en)} />
      <Header /><Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <Link to="/excursions" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Alla utflykter' : 'All excursions'}
        </Link>

        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-1 flex items-center gap-3"><MapPin className="h-8 w-8 text-gold" />{excursion.name}</h1>
          {excursion.tagline && <p className="text-gold/90 text-base font-medium mb-3 max-w-3xl">{sv ? excursion.tagline.sv : excursion.tagline.en}</p>}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">{excursion.region}</Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />{excursion.period}</Badge>
            {stone?.meter && <MeterBadge meter={stone.meter} sv={sv} />}
          </div>
          {excursion.sections?.length ? (
            <div className="max-w-3xl space-y-4">
              {excursion.sections.map((s) => (
                <section key={s.key}>
                  <h2 className="text-lg font-semibold text-gold mb-1">{sv ? s.titleSv : s.titleEn}</h2>
                  <p className="text-muted-foreground leading-relaxed">{sv ? s.sv : s.en}</p>
                </section>
              ))}
            </div>
          ) : (
            <ExcursionProse text={sv ? excursion.sv : excursion.en} className="max-w-3xl text-lg" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="mb-2 flex flex-col gap-2">
              <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} />
              <div className="flex items-center gap-2 text-xs">
                <span className="text-sky-300 whitespace-nowrap">{sv ? 'Radie' : 'Radius'}: {radius < 1000 ? `${radius} m` : `${(radius / 1000).toFixed(1)} km`}</span>
                <input type="range" min={200} max={5000} step={100} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="flex-1 accent-sky-500" />
                <span className="text-muted-foreground whitespace-nowrap">{nearbyDb?.length ?? 0} {sv ? 'fynd' : 'finds'}</span>
              </div>
            </div>
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
                {/* Jordbro-specifik förklaring — övriga utflykter får generisk legendtext */}
                <p className="text-xs text-muted-foreground mb-3">{excursion.id === 'jordbro-gravfalt'
                  ? (sv ? 'Gravtyper enligt informationsskylten. Kartan visar gravfältets registrerade yta (RAÄ, CC0); de ~1000 enskilda gravarna finns inte som öppen geodata.' : 'Grave types per the information sign. The map shows the registered extent (RAÄ, CC0); the ~1000 individual graves are not open geodata.')
                  : (sv ? 'Färgerna motsvarar kartans markörer.' : 'Colours correspond to the map markers.')}</p>
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
          {hypotheses && hypotheses.length > 0 && (
            <aside className="lg:col-span-1">
              <div className="viking-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">{sv ? 'Var låg platsen?' : 'Where was the site?'}</h2>
                <p className="text-xs text-muted-foreground mb-3">{sv
                  ? 'Monumentet (skyddshuset, guld) har känt läge. Den ursprungliga kungavalsplatsen är omtvistad — nedan de dokumenterade hypoteserna. Blått = kandidatplats (mörkare = starkare stöd), grått = referensfynd. Koordinat anges bara där den är verifierad.'
                  : 'The monument (shelter, gold) has a known location. The original election site is disputed — the documented hypotheses are listed below. Blue = candidate (darker = stronger support), grey = reference find. Coordinates are given only where verified.'}</p>
                <ul className="space-y-2.5">
                  {[...hypotheses]
                    .sort((a, b) => (HYP_ORDER[a.kind] ?? 9) - (HYP_ORDER[b.kind] ?? 9)
                      || (CONF_ORDER[a.confidence ?? 'unknown'] ?? 9) - (CONF_ORDER[b.confidence ?? 'unknown'] ?? 9))
                    .map((h, i) => {
                      const s = HYP_STYLE(h.kind, h.confidence);
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border" style={{ backgroundColor: h.kind === 'lost' ? 'transparent' : s.fill, borderColor: s.stroke }} aria-hidden="true" />
                          <div>
                            <div className="text-foreground leading-snug">{h.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {(HYP_KIND_LABEL[h.kind]?.[sv ? 'sv' : 'en']) ?? h.kind}
                              {h.confidence ? ` · ${h.confidence}` : ''}
                              {' · '}
                              {h.lat != null ? (sv ? 'geokodad' : 'geocoded') : (sv ? 'läge ej fastställt' : 'location unresolved')}
                            </div>
                            {h.source && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{h.source}</div>}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {photos.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">{sv ? 'Bilder från platsen' : 'Photos from the site'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((p, i) => (
                <a key={p.src} href={p.src} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border bg-card">
                  <img src={p.src} alt={`${excursion.name} — ${sv ? 'foto' : 'photo'} ${i + 1}`} loading="lazy" className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
                  {p.credit && <div className="px-1.5 py-1 text-[10px] leading-tight text-muted-foreground/80 truncate" title={p.credit}>{p.credit}</div>}
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sevärdheter inom räckvidd (features_near, reglerbar radie) */}
          {nearbyDb && nearbyDb.length > 0 && (
            <Section icon={<Navigation className="h-5 w-5 text-sky-400" />} title={`${sv ? 'Sevärdheter inom räckvidd' : 'Sights within reach'} (${nearbyDb.length})`}>
              <div className="max-h-64 overflow-y-auto pr-1">
                {nearbyDb.map((f, i) => {
                  const isRune = f.kind === 'runestone';
                  const to = isRune ? `/inscription/${encodeURIComponent(f.raa_type || '')}` : `/explore?center=${f.lat},${f.lng}&zoom=15`;
                  const icon = f.kind === 'church' ? '⛪' : isRune ? 'ᚱ' : '▪';
                  return (
                    <a key={i} href={to} title={isRune ? (sv ? 'Öppna runinskriften' : 'Open inscription') : (sv ? 'Öppna på kartan' : 'Open on map')}
                      className="flex items-baseline gap-2 text-sm py-0.5 border-b border-border/40 hover:bg-muted/30 rounded">
                      <span className="text-sky-300 font-mono shrink-0 w-14 text-right text-xs">{f.dist_m < 1000 ? `${f.dist_m} m` : `${(f.dist_m / 1000).toFixed(1)} km`}</span>
                      <span className="hover:underline"><span className={isRune ? 'text-amber-500' : ''}>{icon}</span> {f.name} {!isRune && <span className="text-muted-foreground/60 text-xs">{f.raa_type || ''}</span>}</span>
                    </a>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground/70 mt-2">{sv ? 'Ur RAÄ Fornsök + kyrkor (fågelvägen). Justera radien ovanför kartan. Klicka för att öppna på huvudkartan.' : 'From the heritage register + churches. Adjust the radius above the map.'}</p>
            </Section>
          )}
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

          {/* Runstenar i närheten (via nearby_features-RPC) */}
          {nearbyRunestones && nearbyRunestones.length > 0 && (
            <Section icon={<Scroll className="h-5 w-5 text-gold" />} title={sv ? 'Runstenar i närheten' : 'Runestones nearby'}>
              <ul className="space-y-1">
                {nearbyRunestones.map((r) => (
                  <li key={r.feature_id} className="text-sm flex justify-between gap-2">
                    <Link to={`/inscription/${encodeURIComponent(r.label)}`} className="truncate text-gold hover:underline">{r.label}</Link>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{r.distance_km.toFixed(0)} km</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Kultplatser & kyrkor i närheten */}
          {nearbyPlaces.length > 0 && (
            <Section icon={<Sparkles className="h-5 w-5 text-blue-400" />} title={sv ? 'Kultplatser & kyrkor i närheten' : 'Cult sites & churches nearby'}>
              <ul className="space-y-1">
                {nearbyPlaces.map(({ item, km }) => (
                  <li key={item.id} className="text-sm text-muted-foreground flex justify-between gap-2">
                    <span className="truncate">
                      {item.name}
                      <span className="text-muted-foreground/60">
                        {' · '}
                        {(PLACE_TYPE_LABEL[item.type]?.[sv ? 'sv' : 'en']) ?? item.type}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">{km.toFixed(0)} km</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Arkeologiska fynd i närheten */}
          {nearbyFinds.length > 0 && (
            <Section icon={<Landmark className="h-5 w-5 text-amber-500" />} title={sv ? 'Arkeologiska fynd i närheten' : 'Archaeological finds nearby'}>
              <ul className="space-y-1">
                {nearbyFinds.map(({ item, km }) => (
                  <li key={item.id} className="text-sm text-muted-foreground flex justify-between gap-2">
                    <span className="truncate">
                      {sv ? item.name : item.nameEn}
                      <span className="text-muted-foreground/60">
                        {' · '}
                        {(FIND_TYPE_LABEL[item.findType]?.[sv ? 'sv' : 'en']) ?? item.findType}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">{km.toFixed(0)} km</span>
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
