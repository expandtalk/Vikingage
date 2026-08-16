import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { useReliefOverlay } from '@/hooks/useReliefOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Badge } from '@/components/ui/badge';
import { MeterBadge } from '@/components/inscription/MeterBadge';
import { MapPin, Calendar, Compass, ArrowLeft, ExternalLink, Scroll, Crown, Navigation, Sparkles, Landmark } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EXCURSIONS } from '@/data/excursions';
import { supabase } from '@/integrations/supabase/client';
import { nearestWithin } from '@/utils/geoDistance';
import { RELIGIOUS_PLACES } from '@/utils/religiousLocations/religiousPlacesData';
import { ARCHAEOLOGICAL_FINDS } from '@/utils/archaeologicalFinds';
import { PLACE_TYPE_LABEL, FIND_TYPE_LABEL } from '@/components/excursions/nearbyLabels';
import { ExcursionProse, excerptText } from '@/components/excursions/ExcursionProse';
import { NEAR_CATS, classifyNear, type NearCat } from '@/utils/nearFeatureCategories';
import { ReferenceList } from '@/components/references/ReferenceList';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { createPlaceMedallion, featureIcon } from '@/utils/map/placeMarker';

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
  // Tematiska on-map-lager i egna grupper (togglas av MapLegend). Löser "kan inte klicka på lagren".
  const tileRef = useRef<L.TileLayer | null>(null);
  const routeGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const fortressGroupRef = useRef<L.FeatureGroup>(L.featureGroup());
  const hypGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  // Vilka lager har innehåll (fornborgar/hypoteser laddas async) → visa bara relevanta i legenden.
  const [presentLayers, setPresentLayers] = useState<Set<string>>(() => new Set(['route']));
  const [shoreYear, setShoreYear] = useState<number | null>(excursion?.defaultShoreYear ?? null);
  const [radius, setRadius] = useState(2000);  // 500 m var för tätt på landsbygden → tom panel; 2 km ger sevärdheter
  const [relief, setRelief] = useState(false);
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());
  const toggleCat = (id: string) => setHiddenCats((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const { status: shoreStatus } = useShorelineOverlay(mapRef, shoreYear);
  // Byt utflykt (id-param) → återställ strandlinjen till utflyktens default.
  useEffect(() => { setShoreYear(excursion?.defaultShoreYear ?? null); }, [excursion?.id]);
  useReliefOverlay(mapRef, relief);

  // Klickbar on-map-legend: togglebara tematiska lager + baskarta. Nyckar är fasta (seedas en gång
  // av useMapLegendState); vilka som VISAS styrs av presentLayers (dolda tills de har innehåll).
  const EXC_LEGEND: LegendLayerDef[] = useMemo(() => [
    { key: 'route', label: sv ? 'Led & lämningar' : 'Route & remains', color: '#eab308', defaultOn: true },
    { key: 'fortresses', label: sv ? 'Fornborgar' : 'Hillforts', color: '#ef4444', defaultOn: true },
    { key: 'hypotheses', label: sv ? 'Lägeshypoteser' : 'Location hypotheses', color: '#0ea5e9', defaultOn: true },
    { key: 'osm', label: sv ? 'Baskarta (OSM)' : 'Base map (OSM)', color: '#64748b', group: 'basemap' as const, defaultOn: true },
  ], [sv]);
  const { enabled: layerOn, toggle: toggleLayer } = useMapLegendState(EXC_LEGEND);
  const visibleLegend = useMemo(
    () => EXC_LEGEND.filter((d) => d.group === 'basemap' || presentLayers.has(d.key)),
    [EXC_LEGEND, presentLayers],
  );

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

  // Typade sevärdheter: features_near (klassade) + kultplatser ur RELIGIOUS_PLACES inom radien
  // (Torslunda/Skedemosse m.fl. plottas nu på kartan, inte bara i listan). Sorterade på avstånd.
  interface TypedFeat { cat: NearCat; name: string; type: string; lat: number; lng: number; dist_m: number; link: string; isRune: boolean; }
  const typedFeatures = useMemo<TypedFeat[]>(() => {
    const out: TypedFeat[] = [];
    (nearbyDb ?? []).forEach((f) => {
      const isRune = f.kind === 'runestone';
      out.push({
        cat: classifyNear(f.kind, f.raa_type), name: f.name, type: isRune ? 'runsten' : (f.raa_type || ''),
        lat: f.lat, lng: f.lng, dist_m: f.dist_m, isRune,
        link: isRune ? `/inscription/${encodeURIComponent(f.raa_type || '')}` : `/explore?center=${f.lat},${f.lng}&zoom=15`,
      });
    });
    const cult = NEAR_CATS.find((c) => c.id === 'cult')!;
    if (excursion) {
      nearestWithin(excursion.coords, RELIGIOUS_PLACES, (p) => p.coordinates, radius / 1000, 60).forEach(({ item, km }) => {
        out.push({ cat: cult, name: item.name, type: (PLACE_TYPE_LABEL[item.type]?.[sv ? 'sv' : 'en']) ?? item.type,
          lat: item.coordinates.lat, lng: item.coordinates.lng, dist_m: Math.round(km * 1000), isRune: false,
          link: `/explore?center=${item.coordinates.lat},${item.coordinates.lng}&zoom=15` });
      });
    }
    return out.sort((a, b) => a.dist_m - b.dist_m);
  }, [nearbyDb, excursion, radius, sv]);

  // Färdväg-LINJER nära (Borgvägen mot Ismantorp m.fl.) — RITAS SOM LINJER, inte punkter (Daniel).
  const { data: roadsNear } = useQuery({
    queryKey: ['excursion-roads-near', excursion?.coords.lat, excursion?.coords.lng, radius],
    enabled: !!excursion,
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)('roads_near', { p_lat: excursion!.coords.lat, p_lng: excursion!.coords.lng, p_radius_m: radius });
      return (data ?? []) as { name: string; raa_type: string | null; register_id: string | null; len_m: number; geojson: string }[];
    },
  });

  const presentCats = useMemo(() => {
    const counts = new Map<string, number>();
    typedFeatures.forEach((f) => counts.set(f.cat.id, (counts.get(f.cat.id) ?? 0) + 1));
    // Väglinjer (roads_near) räknas in i 'road' även om inga väg-PUNKTER finns i radien.
    if (roadsNear?.length) counts.set('road', (counts.get('road') ?? 0) + roadsNear.length);
    return NEAR_CATS.filter((c) => counts.has(c.id)).map((c) => ({ ...c, n: counts.get(c.id)! }));
  }, [typedFeatures, roadsNear]);

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

  // Historisk kontext hämtas separat — get_excursion_detail returnerar den inte, och den
  // (480 tecken för Öl 1) visades aldrig på sidan. Frontend-only, ingen DB-ändring.
  const { data: stoneExtra } = useQuery({
    queryKey: ['excursion-stone-extra', excursion?.signum],
    enabled: !!excursion?.signum,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('runic_inscriptions')
        .select('historical_context')
        .eq('signum', excursion!.signum!)
        .maybeSingle();
      if (error) throw error;
      return data as { historical_context: string | null } | null;
    },
  });

  const { data: sources } = useQuery({
    queryKey: ['excursion-sources', excursion?.relatedSources],
    enabled: !!excursion?.relatedSources?.length,
    queryFn: async () => {
      const { data, error } = await supabase.from('historical_sources')
        .select('id, title, title_en, author, written_year, description, reliability, url')
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
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    // Tematiska lager i egna grupper (rensa ev. innehåll från förra utflykten, lägg på nya kartan).
    routeGroupRef.current.clearLayers(); fortressGroupRef.current.clearLayers(); hypGroupRef.current.clearLayers();
    routeGroupRef.current.addTo(map); fortressGroupRef.current.addTo(map); hypGroupRef.current.addTo(map);
    setPresentLayers(new Set(['route']));
    // Huvudpinnen = medaljong (prominent → permanent namn, som en informationstavla).
    L.marker([lat, lng], { icon: createPlaceMedallion({ color: '#eab308', icon: excursion.signum ? 'rune' : 'sevardhet', label: excursion.mapLabel || excursion.name, prominent: true, hairline: true }) })
      .bindPopup(`<strong>${excursion.name}</strong>`).addTo(routeGroupRef.current);

    // Extra intressepunkter (t.ex. skålgropsstenen + gravfältet i samma utflykt) → medaljong (hover-namn).
    const extraPts = excursion.points ?? [];
    extraPts.forEach((pt) => {
      L.marker([pt.lat, pt.lng], { icon: createPlaceMedallion({ color: '#38bdf8', icon: 'dot', label: pt.name, prominent: false, hairline: true }) })
        .bindPopup(`<strong>${pt.name}</strong>${pt.note ? `<br/>${pt.note}` : ''}`)
        .addTo(routeGroupRef.current);
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
          style: (feature) => (feature?.properties?.type ?? feature?.properties?.typ) === 'Farled'
            ? { color: '#0ea5e9', weight: 4, opacity: 0.9 }          // vattenled = tjock blå linje (syns över strandlinjen)
            : { color: '#eab308', weight: 2, fillColor: '#eab308', fillOpacity: 0.12 },
          pointToLayer: (feature, latlng) => {
            const p = feature?.properties ?? {};
            const typ = p.type ?? p.typ;
            const labeled = !!p.label;
            // Regionala noder ("Historia längs leden") ritas tystare (hover-namn) än de lokala lämningarna.
            const regional = p.tier === 'regional';
            // Medaljong: FORMEN (featureIcon) bär typen; namngivna lokala lämningar blir prominenta
            // (permanent namn, som Lantmäteriets vandringstavla), regionala/onamnade får hover-namn.
            return L.marker(latlng, { icon: createPlaceMedallion({
              color: colorByType.get(norm(typ)) ?? '#94a3b8',
              icon: featureIcon(typ), label: p.label ?? '',
              prominent: labeled && !regional, size: regional ? 26 : 30, hairline: true,
            }) });
          },
          onEachFeature: (feature, lyr) => {
            const p = feature?.properties ?? {};
            lyr.bindPopup(`<strong>${p.label ?? p.type ?? p.typ ?? 'Lämning'}</strong>${p.raa ? `<br/>${p.raa}` : ''}`);
          },
        }).addTo(routeGroupRef.current);
        // Fokusera kartan på de namngivna lämningarna (den lokala vandringsytan) + huvudpinnen så
        // etiketterna blir läsbara — farled-linjen sträcker sig vidare som riktningskontext.
        // Faller tillbaka till hela lagrets bounds om inga namngivna punkter finns.
        try {
          const named: [number, number][] = (geo.features ?? [])
            .filter((f: any) => f?.geometry?.type === 'Point' && f?.properties?.label && f?.properties?.tier !== 'regional')
            .map((f: any) => [f.geometry.coordinates[1], f.geometry.coordinates[0]]);
          const focus = named.length ? L.latLngBounds([[lat, lng], ...named]) : layer.getBounds();
          if (focus.isValid()) mapRef.current.fitBounds(focus, { padding: [55, 55], maxZoom: named.length ? 15 : 17 });
        } catch { /* punktlös */ }
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
        .select('id, name, fortress_type, status, excavated, description, coordinates')
        .ilike('region', `%${excursion.fortressRegion}%`)
        .then(({ data }) => {
          if (cancelled || !mapRef.current || !data?.length) return;
          fortressGroupRef.current.clearLayers();
          let n = 0;
          for (const f of data) {
            const ll = parsePoint(f.coordinates);
            if (!ll) continue;
            // Klickbar → borgens egen sida (Daniel: "läsa mer om de specifika fornborgarna").
            // /fortresses/:id resolvar viking_fortresses via FortressDetails fallback.
            const readMore = `<br/><a href="/fortresses/${f.id}" style="font-size:11px;color:#0ea5e9">${sv ? 'Läs mer om borgen' : 'Read more'} →</a>`;
            // Medaljong: fort-glyf bär typen, färgen bär status (grön/gul/röd).
            L.marker(ll, { icon: createPlaceMedallion({ color: statusColor(f), icon: 'fort', label: f.name, prominent: false, hairline: true }) })
              .bindPopup(`<strong>${f.name}</strong><br/>${f.status === 'reconstructed' ? (sv ? 'Rekonstruerad' : 'Reconstructed') : f.excavated ? (sv ? 'Utgrävd' : 'Excavated') : (sv ? 'Ej utgrävd' : 'Not excavated')}${f.description ? `<br/><em>${f.description}</em>` : ''}${readMore}`)
              .addTo(fortressGroupRef.current);
            n++;
          }
          if (n) setPresentLayers((prev) => (prev.has('fortresses') ? prev : new Set(prev).add('fortresses')));
          try { const b = fortressGroupRef.current.getBounds(); if (b.isValid()) mapRef.current.fitBounds(b, { padding: [30, 30] }); } catch { /* tomt */ }
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

  // Räckviddscirkel + TYPADE närbelägna sevärdheter (färg/storlek per kategori, legend-togglebart).
  useEffect(() => {
    const map = mapRef.current; if (!map || !excursion) return;
    if (radiusLayerRef.current) { try { map.removeLayer(radiusLayerRef.current); } catch { /* noop */ } radiusLayerRef.current = null; }
    const g = L.featureGroup();
    L.circle([excursion.coords.lat, excursion.coords.lng], { radius, color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.06 }).addTo(g);
    typedFeatures.forEach((f) => {
      if (hiddenCats.has(f.cat.id)) return;
      const linkLabel = f.isRune ? (sv ? 'Öppna runinskriften' : 'Open inscription') : (sv ? 'Öppna på kartan' : 'Open on map');
      const dist = f.dist_m < 1000 ? `${f.dist_m} m` : `${(f.dist_m / 1000).toFixed(1)} km`;
      L.circleMarker([f.lat, f.lng], { radius: f.cat.r, color: '#0f172a', weight: 1, fillColor: f.cat.color, fillOpacity: 0.9 })
        .bindPopup(`<strong>${f.cat.glyph} ${f.name}</strong><br/><span style="font-size:11px;color:#666">${f.type ? f.type + ' · ' : ''}${dist}</span><br/><a href="${f.link}" style="font-size:11px">${linkLabel} →</a>`)
        .addTo(g);
    });
    // Vägnät som LINJER (Borgvägen m.fl.) — samma kategori/färg som väg-punkterna, togglas med 'road'.
    if (!hiddenCats.has('road')) {
      (roadsNear ?? []).forEach((r) => {
        let geom; try { geom = JSON.parse(r.geojson); } catch { return; }
        L.geoJSON(geom, { style: () => ({ color: '#b45309', weight: 4, opacity: 0.9 }) })
          .bindPopup(`<strong>🛤️ ${r.name || (sv ? 'Färdväg' : 'Road')}</strong><br/><span style="font-size:11px;color:#666">${r.raa_type || 'färdväg'}${r.len_m ? ` · ${r.len_m < 1000 ? r.len_m + ' m' : (r.len_m / 1000).toFixed(1) + ' km'}` : ''}</span>`)
          .addTo(g);
      });
    }
    g.addTo(map); radiusLayerRef.current = g;
    return () => { try { map.removeLayer(g); } catch { /* noop */ } };
  }, [typedFeatures, roadsNear, hiddenCats, radius, excursion, sv]);

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

  // Underrubrik + brödtext i runstensblocket — riktig typografisk hierarki (h3 i guld),
  // ersätter de gamla pyttesmå uppercase-etiketterna.
  const StoneField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
      <h3 className="text-base font-semibold text-gold mb-2">{label}</h3>
      {children}
    </div>
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
          {excursion.tagline && <p className="text-gold text-base font-medium mb-3 max-w-3xl">{sv ? excursion.tagline.sv : excursion.tagline.en}</p>}
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
                  <p className="text-slate-200 leading-relaxed">{sv ? s.sv : s.en}</p>
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
              <div className="hidden sm:block"><ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} noData={shoreStatus === 'no-data'} /></div>
              <div className="sm:hidden"><ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" noData={shoreStatus === 'no-data'} /></div>
              <label className="inline-flex items-center gap-1.5 text-xs text-emerald-300 cursor-pointer"><input type="checkbox" checked={relief} onChange={(e) => setRelief(e.target.checked)} /> {sv ? 'Höjdrelief (terräng — strandvallar)' : 'Elevation hillshade (terrain)'}</label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-sky-300 whitespace-nowrap">{sv ? 'Radie' : 'Radius'}: {radius < 1000 ? `${radius} m` : `${(radius / 1000).toFixed(1)} km`}</span>
                <input type="range" min={200} max={30000} step={500} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="flex-1 accent-sky-500" />
                <span className="text-muted-foreground whitespace-nowrap">{nearbyDb?.length ?? 0} {sv ? 'fynd' : 'finds'}</span>
              </div>
            </div>
            <div ref={containerRef} className="w-full rounded-lg border border-border" style={{ height: '55vh', minHeight: 380 }} />
            <div className="mt-2 flex flex-wrap gap-3">
              <a href={`/explore?center=${excursion.coords.lat},${excursion.coords.lng}&zoom=13`} className="inline-flex items-center gap-1 text-xs text-gold hover:underline"><Compass className="h-3 w-3" />{sv ? 'Utforska i kartan' : 'Explore on map'}</a>
              <a href={`/3D-drive?lat=${excursion.coords.lat}&lng=${excursion.coords.lng}`} className="inline-flex items-center gap-1 text-xs text-gold hover:underline"><Navigation className="h-3 w-3" />{sv ? '3D-vy' : '3D view'}{excursion.id === 'gaseborg' ? (sv ? ' (med terräng)' : ' (with terrain)') : ''}</a>
              <a href={`https://www.openstreetmap.org/?mlat=${excursion.coords.lat}&mlon=${excursion.coords.lng}#map=15/${excursion.coords.lat}/${excursion.coords.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gold hover:underline"><ExternalLink className="h-3 w-3" />OpenStreetMap</a>
            </div>
          </div>
          {(typedFeatures.length > 0 || (roadsNear?.length ?? 0) > 0) && (
            <aside className="lg:col-span-1 space-y-4">
              {/* Teckenförklaring — togglebar per kategori (Fas 1: löser "allt ser likadant ut"). */}
              <div className="viking-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">{sv ? 'Teckenförklaring' : 'Legend'}</h2>
                <p className="text-xs text-muted-foreground mb-3">{sv ? 'Klicka för att visa/dölja lager. Färg & storlek visar typ.' : 'Click to show/hide layers. Colour & size show type.'}</p>
                <ul className="space-y-1">
                  {presentCats.map((c) => {
                    const off = hiddenCats.has(c.id);
                    return (
                      <li key={c.id}>
                        <button onClick={() => toggleCat(c.id)} className={`flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm hover:bg-muted/30 ${off ? 'opacity-40' : ''}`}>
                          <span className="h-3 w-3 shrink-0 rounded-full border" style={{ backgroundColor: off ? 'transparent' : c.color, borderColor: c.color }} aria-hidden="true" />
                          <span className="w-4 text-center text-xs" aria-hidden="true">{c.glyph}</span>
                          <span className="flex-1 text-muted-foreground">{sv ? c.sv : c.en}</span>
                          <span className="shrink-0 tabular-nums text-xs text-muted-foreground/60">{c.n}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {/* Sevärdheter inom räckvidd — flyttad hit, bredvid kartan (Daniel). */}
              <div className="viking-card rounded-lg border border-border p-4">
                <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2"><Navigation className="h-4 w-4 text-sky-400" />{sv ? 'Sevärdheter inom räckvidd' : 'Sights within reach'} ({typedFeatures.length})</h2>
                <div className="max-h-[46vh] overflow-y-auto pr-1">
                  {typedFeatures.map((f, i) => (
                    <a key={i} href={f.link} title={f.isRune ? (sv ? 'Öppna runinskriften' : 'Open inscription') : (sv ? 'Öppna på kartan' : 'Open on map')}
                      className={`flex items-baseline gap-2 py-0.5 border-b border-border/40 hover:bg-muted/30 rounded ${hiddenCats.has(f.cat.id) ? 'opacity-40' : ''}`}>
                      <span className="text-sky-300 font-mono shrink-0 w-14 text-right text-xs">{f.dist_m < 1000 ? `${f.dist_m} m` : `${(f.dist_m / 1000).toFixed(1)} km`}</span>
                      <span className="min-w-0 text-sm"><span className="mr-1" aria-hidden="true">{f.cat.glyph}</span><span className="hover:underline">{f.name}</span>{f.type && <span className="text-muted-foreground/60 text-xs"> · {f.type}</span>}</span>
                    </a>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground/70 mt-2">{sv ? 'Ur RAÄ Fornsök + kyrkor + kultplatser (fågelvägen). Justera radien ovanför kartan; klicka i teckenförklaringen för att filtrera.' : 'From the heritage register, churches & cult sites. Adjust the radius above the map; toggle layers in the legend.'}</p>
              </div>
            </aside>
          )}
          {excursion.monumentTypes && excursion.monumentTypes.length > 0 && (
            <aside className="lg:col-span-1">
              <div className="viking-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-1">{sv ? 'Monument på platsen' : 'Monuments on site'}</h2>
                {/* Jordbro-specifik förklaring — övriga utflykter får generisk legendtext */}
                <p className="text-xs text-muted-foreground mb-3">{excursion.id === 'jordbro-gravfalt'
                  ? (sv ? 'Gravtyper enligt informationsskylten. Kartan visar gravfältets registrerade yta (RAÄ, CC0); de ~1000 enskilda gravarna finns inte som öppen geodata.' : 'Grave types per the information sign. The map shows the registered extent (RAÄ, CC0); the ~1000 individual graves are not open geodata.')
                  : excursion.id === 'langhundraleden'
                  ? (sv ? 'Två skikt som på informationstavlorna: de namngivna lämningarna kring Broborg (vandringsytan) och de grå "Historia längs leden"-noderna — en bilburen översikt vars sevärdheter spänner flera epoker (järnålder till Linnés 1700-tal), inte bara vikingatid. Zooma ut för att se hela leden. Den äkta leden upptäcks till fots eller med kanot — mät sträckan med linjalens Sträck-läge (km + dagsresor).' : 'Two layers, as on the information boards: the named remains around Broborg (the walking area) and the grey "history along the route" nodes — a drive-by overview whose sights span many periods (Iron Age to Linnaeus\'s 18th century), not only the Viking Age. Zoom out for the whole route. The real route is discovered on foot or by canoe — measure it with the ruler\'s Path mode (km + days of travel).')
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

        {/* RUNSTENEN — framträdande, fullbrett block direkt efter bilderna, med riktiga
            underrubriker. Lyft ur den gamla trånga bottengridden (Daniel: "typografiskt fel"). */}
        {stone && (
          <section className="viking-card rounded-lg border border-border p-6 mb-6 max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
              <Scroll className="h-6 w-6 text-gold" />{sv ? 'Runstenen' : 'The runestone'} {stone.signum}
            </h2>
            {[stone.dating, stone.meter && (sv ? `versmått: ${stone.meter}` : `metre: ${stone.meter}`)].filter(Boolean).length > 0 && (
              <p className="text-sm text-muted-foreground mb-6">
                {[stone.dating, stone.meter && (sv ? `versmått: ${stone.meter}` : `metre: ${stone.meter}`)].filter(Boolean).join(' · ')}
              </p>
            )}

            <div className="space-y-6">
              {stone.transliteration && (
                <StoneField label={sv ? 'Translitteration' : 'Transliteration'}>
                  <div className="p-3 bg-black/20 rounded font-mono text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{stone.transliteration}</div>
                </StoneField>
              )}
              {(stone.translation_sv || stone.translation_en) && (
                <StoneField label={sv ? 'Översättning' : 'Translation'}>
                  <blockquote className="border-l-2 border-gold/50 pl-4 text-lg italic text-slate-200 leading-relaxed">
                    {(sv ? stone.translation_sv : stone.translation_en) || stone.translation_sv || stone.translation_en}
                  </blockquote>
                </StoneField>
              )}
              {stone.carvers.length > 0 && (
                <StoneField label={sv ? 'Ristare' : 'Carver(s)'}>
                  <ul className="space-y-1">
                    {stone.carvers.map((c, i) => (
                      <li key={i} className="text-sm text-foreground flex items-center gap-2">
                        {c.name}
                        <Badge variant="outline" className="text-[10px]">{(ATTR_LABEL[c.attribution]?.[sv ? 'sv' : 'en']) ?? c.attribution}{!c.certainty ? (sv ? ', osäker' : ', uncertain') : ''}</Badge>
                      </li>
                    ))}
                  </ul>
                </StoneField>
              )}
              {stone.edda.length > 0 && (
                <StoneField label={sv ? 'Litterära kopplingar' : 'Literary links'}>
                  <ul className="space-y-0.5">
                    {stone.edda.map((e, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{e.title} <span className="text-muted-foreground/60">({e.relation})</span></li>
                    ))}
                  </ul>
                </StoneField>
              )}
              {stone.scholarly_notes && (
                <StoneField label={sv ? 'Forskningsnoter' : 'Scholarly notes'}>
                  <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap">{stone.scholarly_notes}</p>
                </StoneField>
              )}
              {stoneExtra?.historical_context && (
                <StoneField label={sv ? 'Historisk kontext' : 'Historical context'}>
                  <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap">{stoneExtra.historical_context}</p>
                </StoneField>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border/60">
              <Link to={`/inscription/${encodeURIComponent(stone.signum)}`} className="inline-flex items-center gap-1 text-sm text-gold hover:underline">
                <ExternalLink className="h-3.5 w-3.5" />{sv ? 'Läs hela inskriften i runregistret' : 'Read the full inscription record'}
              </Link>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* "Sevärdheter inom räckvidd" flyttad till högerkolumnen bredvid kartan (Fas 1).
              Källor flyttade till en delad ReferenceList SIST på sidan (Wikipedia-modell, se nedan). */}
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

        {/* Källor & referenser SIST på sidan (delad ReferenceList, Wikipedia-modell). */}
        <ReferenceList
          sv={sv}
          sources={(sources ?? []).map((s: any) => ({ id: s.id, title: sv ? s.title : (s.title_en || s.title), author: s.author, year: s.written_year, url: s.url }))}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ExcursionDetail;
