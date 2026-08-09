import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, ShieldCheck, MapPin, ScrollText, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { useSearchThumbs } from '@/hooks/useSearchThumbs';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { parseGedcom, parishOf, yearOf, type GPerson } from '@/utils/gedcom';

interface Parish { name: string; lat: number; lng: number; persons: { name: string; year: number | null }[]; }

interface NearbyFeature { kind: string; name: string; raa_type: string | null; lat: number; lng: number; dist_m: number; existence: string | null; entity_id?: string | null; }
// Gravtyper (stensättning/röse/gravfält…) grupperas i listan — annars svämmar de över den
// (Daniel: "väldigt mycket kring stensättning och rösen"). Kyrkor/runstenar hålls separata.
const GRAVE_RE = /gravfält|stens(ä|a)ttning|\brös(e|en)\b|gravhög|\bhög\b|domarring|skeppss|treudd|kummel|bautasten|rest sten|stenkrets|stensträng|kokgrop|flatmarksgrav/i;
const isGraveFeature = (f: NearbyFeature) => !['church', 'monastery', 'hospital', 'thing', 'landmark', 'runestone'].includes(f.kind) && GRAVE_RE.test(`${f.raa_type || ''} ${f.name || ''}`);
// Kyrka = ren kyrka; kloster/hospital/tingsplats/vägmärke/grotta har egen kind/etikett → egna ikoner.
const isChurchFeature = (f: NearbyFeature) => f.kind === 'church' || /kyrka|kapell/i.test(f.raa_type || '');
const isMonastery = (f: NearbyFeature) => f.kind === 'monastery';
const isHospital = (f: NearbyFeature) => f.kind === 'hospital';
const isThing = (f: NearbyFeature) => f.kind === 'thing';
const isLandmark = (f: NearbyFeature) => f.kind === 'landmark';
const isCave = (f: NearbyFeature) => /grott|överhäng/i.test(f.raa_type || '');
const isMilestone = (f: NearbyFeature) => /vägmärke|milstolpe|milsten/i.test(f.raa_type || '');

// EN ikon-källa för både karta, dossierlista och korridor — så samma sak ser likadan ut överallt.
const featEmoji = (f: NearbyFeature): string => {
  if (isChurchFeature(f)) return '⛪';
  if (isMonastery(f)) return '✝️';
  if (isHospital(f)) return '✚';
  if (isThing(f)) return '⚖️';
  if (isLandmark(f)) return /bro|bridge/i.test(f.raa_type || '') ? '🌉' : /vad|ford/i.test(f.raa_type || '') ? '💧' : '🔀';
  if (isCave(f)) return '🕳️';
  if (isMilestone(f)) return '🪧';
  if (f.kind === 'runestone') return 'ᚱ';
  if (/hällrist/i.test(f.raa_type || '')) return '🪨';
  if (isGraveFeature(f)) return '⚰️';
  return '▪';
};

// Bäring + avstånd hem→mål (fågelvägen) — driver "gå åt NÖ, 2,3 km" utan routing-motor.
type LL = { lat: number; lng: number };
const bearingDeg = (from: LL, to: LL) => {
  const y1 = from.lat * Math.PI / 180, y2 = to.lat * Math.PI / 180, dx = (to.lng - from.lng) * Math.PI / 180;
  const y = Math.sin(dx) * Math.cos(y2);
  const x = Math.cos(y1) * Math.sin(y2) - Math.sin(y1) * Math.cos(y2) * Math.cos(dx);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};
const COMPASS = { sv: ['N', 'NÖ', 'Ö', 'SÖ', 'S', 'SV', 'V', 'NV'], en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] };
const haversineKm = (a: LL, b: LL) => {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

// SGU:s öppna jordarts-WMS (CC-BY) — samma verifierade lager som fornborgs-detaljsidan.
const SGU_JORD = 'https://resource.sgu.se/service/wms/130/jordarter-25-100-tusen';

const GenMap: React.FC<{ parishes: Parish[]; onSelect: (p: Parish) => void; shoreYear: number | null; selected: Parish | null; footRadius: number; annualRadius: number; nearby: NearbyFeature[] | null; routeTarget: NearbyFeature | null; showSoil: boolean }> = ({ parishes, onSelect, shoreYear, selected, footRadius, annualRadius, nearby, routeTarget, showSoil }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const outerRef = useRef<L.Circle | null>(null);
  const featRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.LayerGroup | null>(null);
  const soilRef = useRef<L.TileLayer | null>(null);
  useShorelineOverlay(mapRef, shoreYear);

  // Jordarts-overlay (SGU) på/av — "vilken mark låg gården på?".
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (showSoil && !soilRef.current) {
      soilRef.current = (L.tileLayer as any).wms(SGU_JORD, {
        layers: 'JORD_25K_Grundlager', format: 'image/png', transparent: true, opacity: 0.5, attribution: 'Jordarter © SGU (CC-BY)',
      });
      soilRef.current!.addTo(map);
    } else if (!showSoil && soilRef.current) {
      soilRef.current.remove(); soilRef.current = null;
    }
  }, [showSoil]);

  // Två koncentriska band runt vald socken: inre = daglig fot-radie,
  // yttre (streckad) = årlig dagsled-räckvidd (häst/vagn/båt).
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    [circleRef, outerRef].forEach((ref) => { if (ref.current) { ref.current.remove(); ref.current = null; } });
    if (selected) {
      outerRef.current = L.circle([selected.lat, selected.lng], { radius: annualRadius, color: '#f59e0b', weight: 1, dashArray: '5 5', fillColor: '#f59e0b', fillOpacity: 0.04 }).addTo(map);
      circleRef.current = L.circle([selected.lat, selected.lng], { radius: footRadius, color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.10 }).addTo(map);
      // Liten padding → räckviddscirkeln fyller ~90 % av kartan (orten i fokus).
      map.fitBounds(outerRef.current.getBounds(), { padding: [16, 16] });
    }
  }, [selected, footRadius, annualRadius]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59, 15], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    featRef.current = L.layerGroup().addTo(map);
    routeRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; featRef.current = null; routeRef.current = null; };
  }, []);

  // Linje hem→mål (kyrka/ort) + målmarkör; zooma så hela promenaden syns.
  useEffect(() => {
    const map = mapRef.current, layer = routeRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!selected || !routeTarget) return;
    const line = L.polyline([[selected.lat, selected.lng], [routeTarget.lat, routeTarget.lng]], { color: '#38bdf8', weight: 3, opacity: 0.85, dashArray: '8 5' }).addTo(layer);
    L.marker([routeTarget.lat, routeTarget.lng], { icon: L.divIcon({ html: '<div style="font-size:18px;line-height:1">🎯</div>', className: 'gen-target', iconSize: [20, 20], iconAnchor: [10, 10] }) })
      .bindPopup(`<b>${routeTarget.name}</b>`).addTo(layer);
    try { map.fitBounds(line.getBounds(), { padding: [45, 45], maxZoom: 13 }); } catch { /* noop */ }
  }, [selected, routeTarget]);

  // Plotta bygd-dossierns lämningar på kartan när en socken är vald: kyrkor & runstenar
  // framträdande, gravar/rösen som små dämpade prickar (grupperas i listan).
  useEffect(() => {
    const map = mapRef.current, layer = featRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!selected || !nearby) return;
    const emojiMarker = (f: NearbyFeature, glyph: string, size = 15) =>
      L.marker([f.lat, f.lng], { icon: L.divIcon({ html: `<div style="font-size:${size}px;line-height:1">${glyph}</div>`, className: 'gen-feat', iconSize: [16, 16], iconAnchor: [8, 8] }) })
        .bindPopup(`<b>${f.name}</b><br>${f.raa_type || ''}`).addTo(layer);
    nearby.forEach((f) => {
      if (isChurchFeature(f)) {
        emojiMarker(f, '⛪');
      } else if (isMonastery(f)) {
        // Kloster: egen magenta-bricka med kors (skiljd från sockenkyrkans ⛪).
        L.marker([f.lat, f.lng], { icon: L.divIcon({ html: '<div style="width:15px;height:15px;border-radius:50%;background:#c026d3;border:1.5px solid #fff;box-shadow:0 0 2px rgba(0,0,0,.5);color:#fff;font-size:10px;font-weight:700;line-height:15px;text-align:center">✝</div>', className: 'gen-feat', iconSize: [15, 15], iconAnchor: [7, 7] }) })
          .bindPopup(`<b>${f.name}</b><br>${f.raa_type || 'Kloster'}`).addTo(layer);
      } else if (isHospital(f)) {
        emojiMarker(f, '✚', 13);
      } else if (isThing(f)) {
        emojiMarker(f, '⚖️', 13);
      } else if (isLandmark(f)) {
        emojiMarker(f, featEmoji(f), 13);
      } else if (isCave(f)) {
        emojiMarker(f, '🕳️', 14);
      } else if (isMilestone(f)) {
        emojiMarker(f, '🪧', 12);
      } else if (f.kind === 'runestone') {
        L.circleMarker([f.lat, f.lng], { radius: 4, color: '#b45309', weight: 1, fillColor: '#f59e0b', fillOpacity: 0.9 })
          .bindPopup(`<b>${f.name}</b><br>Runsten`).addTo(layer);
      } else if (isGraveFeature(f)) {
        L.circleMarker([f.lat, f.lng], { radius: 2.5, color: '#475569', weight: 0.5, fillColor: '#94a3b8', fillOpacity: 0.55 })
          .bindPopup(`<b>${f.name}</b><br>${f.raa_type || ''}`).addTo(layer);
      } else {
        L.circleMarker([f.lat, f.lng], { radius: 3, color: '#334155', weight: 1, fillColor: '#cbd5e1', fillOpacity: 0.7 })
          .bindPopup(`<b>${f.name}</b><br>${f.raa_type || ''}`).addTo(layer);
      }
    });
  }, [selected, nearby]);

  useEffect(() => {
    const layer = layerRef.current, map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const pts: [number, number][] = [];
    parishes.forEach((p) => {
      pts.push([p.lat, p.lng]);
      const r = Math.min(14, 5 + p.persons.length);
      const names = p.persons.slice(0, 12).map((x) => `${x.name}${x.year ? ` (${x.year})` : ''}`).join('<br>');
      L.circleMarker([p.lat, p.lng], { radius: r, color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.35 })
        .bindTooltip(`${p.name} · ${p.persons.length}`, { direction: 'top' })
        .bindPopup(`<b>${p.name}</b> — ${p.persons.length} anfäder<br><span style="font-size:11px;color:#666">${names}</span><br><a href="#" style="font-size:11px" data-parish="${p.name}">Visa bygd-dossier →</a>`)
        .on('popupopen', () => setTimeout(() => { const a = document.querySelector(`a[data-parish="${p.name}"]`); if (a) a.addEventListener('click', (e) => { e.preventDefault(); onSelect(p); }); }, 30))
        .addTo(layer);
    });
    // Ramar in ALLA socknar (GEDCOM). Men när en ort är vald (t.ex. via sökrutan) styr
    // cirkel-effekten inramningen — annars slog denna single-punkt-fit (maxZoom 9) ut fokus
    // och cirkeln blev pytteliten. Därför: hoppa auto-fit när en socken redan är vald.
    if (pts.length && !selected) map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 9 });
  }, [parishes, onSelect, selected]);

  return <div ref={containerRef} className="w-full h-[520px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 520 }} />;
};

const Genealogy = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const [persons, setPersons] = useState<GPerson[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [shoreYear, setShoreYear] = useState<number | null>(null);
  const [selected, setSelected] = useState<Parish | null>(null);
  const [footRadius, setFootRadius] = useState(4000);   // daglig värld till fots
  const [year, setYear] = useState(1800);               // anfaderns år → periodmedvetna färdsätt + farsoter
  const [hasHorse, setHasHorse] = useState(false);      // hade de häst/vagn?
  const annualRadius = hasHorse ? 50000 : 30000;        // dagsled: ~30 km till fots, ~50 med häst (tumregel)
  const [epidemics, setEpidemics] = useState<{ year_start: number; year_end: number | null; event_name: string; event_name_en: string | null; significance_level: string | null }[]>([]);

  // Farsoter (nationella vågor) laddas en gång — filtreras klientsidigt mot valt år.
  useEffect(() => {
    (supabase.from('historical_events') as any)
      .select('year_start,year_end,event_name,event_name_en,significance_level')
      .eq('event_type', 'epidemic').order('year_start')
      .then(({ data }: { data: typeof epidemics | null }) => setEpidemics(data ?? []));
  }, []);
  const [nearby, setNearby] = useState<NearbyFeature[] | null>(null);
  const [showGraves, setShowGraves] = useState(false);
  const [showSoil, setShowSoil] = useState(false);
  const [routeTarget, setRouteTarget] = useState<NearbyFeature | null>(null);
  const [corridor, setCorridor] = useState<NearbyFeature[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [placeQ, setPlaceQ] = useState('');
  const [lookupErr, setLookupErr] = useState<string | null>(null);

  // Ingen GEDCOM: skriv in en socken/ort → samma bygd-dossier via samma RPC:er.
  // Släktdata behövs inte; vi geokodar bara det publika namnet.
  const lookupPlace = async () => {
    const q = placeQ.trim();
    if (!q) return;
    setLookupErr(null);
    setLoading(true);
    const { data } = await (supabase.rpc as any)('geocode_places', { names: [q] });
    setLoading(false);
    const hit = (data ?? [])[0] as { name: string; lat: number; lng: number } | undefined;
    if (!hit) {
      setLookupErr(sv
        ? `Hittade ingen ort som matchar "${q}". Prova sockennamnet (t.ex. "Hossmo", "Resmo").`
        : `No place matched "${q}". Try the parish name.`);
      return;
    }
    const p: Parish = { name: hit.name || q, lat: hit.lat, lng: hit.lng, persons: [] };
    setParishes([p]);
    setSelected(p);
  };

  const readFile = (f: File) => {
    setFileName(f.name);
    const r = new FileReader();
    r.onload = (e) => setPersons(parseGedcom(String(e.target?.result || '')));
    r.readAsText(f, 'UTF-8');
  };

  // Bygg socken-lista + geokoda mot publika place_names (RPC). Släktdata stannar i browsern.
  useEffect(() => {
    if (!persons.length) { setParishes([]); return; }
    const map = new Map<string, { name: string; persons: { name: string; year: number | null }[] }>();
    persons.forEach((p) => {
      [[p.birt.plac, yearOf(p.birt.date)], [p.deat.plac, yearOf(p.deat.date)]].forEach(([plac, yr]) => {
        const par = parishOf(plac as string); if (!par) return;
        const k = par.toLowerCase();
        if (!map.has(k)) map.set(k, { name: par, persons: [] });
        if (!map.get(k)!.persons.some((x) => x.name === (p.name || '?'))) map.get(k)!.persons.push({ name: p.name || '?', year: yr as number | null });
      });
    });
    const names = [...map.values()].map((v) => v.name);
    if (!names.length) { setParishes([]); return; }
    setLoading(true);
    (supabase.rpc as any)('geocode_places', { names }).then(({ data }: { data: { name: string; lat: number; lng: number }[] | null }) => {
      const coords = new Map((data ?? []).map((d) => [d.name.toLowerCase(), d]));
      const out: Parish[] = [];
      map.forEach((v, k) => { const c = coords.get(k); if (c) out.push({ name: v.name, lat: c.lat, lng: c.lng, persons: v.persons }); });
      setParishes(out);
      setLoading(false);
    });
  }, [persons]);

  // Räckvidd: vad kunde anfadern nå till fots (~5000 steg) från socknen?
  useEffect(() => {
    if (!selected) { setNearby(null); return; }
    (supabase.rpc as any)('features_near', { p_lat: selected.lat, p_lng: selected.lng, radius_m: footRadius })
      .then(({ data }: { data: NearbyFeature[] | null }) => setNearby(data ?? []));
  }, [selected, footRadius]);

  // Nollställ målet när man byter socken.
  useEffect(() => { setRouteTarget(null); }, [selected]);

  // Korridor hem→mål: vad man passerar längs vägen (features_along_route, ordnat efter progress).
  useEffect(() => {
    if (!selected || !routeTarget) { setCorridor(null); return; }
    (supabase.rpc as any)('features_along_route', {
      p_from_lat: selected.lat, p_from_lng: selected.lng, p_to_lat: routeTarget.lat, p_to_lng: routeTarget.lng, corridor_m: 1500,
    }).then(({ data }: { data: NearbyFeature[] | null }) => setCorridor(data ?? []));
  }, [selected, routeTarget]);

  const geocoded = parishes.length;
  const mappedPersons = useMemo(() => new Set(parishes.flatMap((p) => p.persons.map((x) => x.name))).size, [parishes]);

  // Tumnaglar för runstenar i bygden (search_thumbs) → en bildremsa "Bilder i bygden".
  const runeIds = useMemo(
    () => (nearby ?? []).filter((f) => f.kind === 'runestone' && f.entity_id).map((f) => f.entity_id as string),
    [nearby],
  );
  const { data: thumbs = {} } = useSearchThumbs(runeIds);
  const imaged = useMemo(
    () => (nearby ?? []).filter((f) => f.kind === 'runestone' && f.entity_id && thumbs[f.entity_id as string]),
    [nearby, thumbs],
  );

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Släktforskning i landskapet"
        titleEn="Genealogy in the landscape"
        description="Släpp din GEDCOM och se anfäderna i sitt landskap: socknarna på kartan med forntida strandlinje och en bygd-dossier (runstenar, fornborgar, avrättningsplatser, kyrkor) ur vår databas. Klientsidigt — din släktdata lämnar aldrig webbläsaren."
        descriptionEn="Drop your GEDCOM and see your ancestors in their landscape: parishes on the map with ancient shorelines and a district dossier from our database. Client-side — your data never leaves the browser."
        keywords="släktforskning, genealogi, GEDCOM, anfäder, socken, landskap, runstenar, arkeologi"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3"><ScrollText className="h-8 w-8 text-gold" />{sv ? 'Släktforskning i landskapet' : 'Genealogy in the landscape'}</h1>
          <p className="text-gold/90 text-sm font-medium mb-3">{sv ? 'Se anfäderna i sin bygd och djuptid — inte bara som namn och datum' : 'See your ancestors in their district and deep time'}</p>
          <p className="text-muted-foreground text-lg">{sv
            ? <>Släpp din <b>GEDCOM</b>-fil så placerar vi varje anfaders <b>socken</b> på kartan, med bygdens <b>forntida strandlinje</b> (landhöjningen) och en <b>bygd-dossier</b> ur vår databas: runstenar, fornborgar, avrättningsplatser, tingsplatser, kyrkor. Det traditionell släktforskning inte ger — anfadern i sitt landskap.</>
            : <>Drop your <b>GEDCOM</b> and we place each ancestor's <b>parish</b> on the map with the district's ancient shoreline and a heritage dossier from our database.</>}</p>
        </div>

        <Card className="viking-card mb-4 border-emerald-700/40">
          <CardContent className="py-3 text-sm text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{sv
              ? <><b>Integritet:</b> din släktfil läses <b>enbart i din webbläsare</b> och laddas aldrig upp. Vi slår bara upp publika sockennamn för att rita kartan. Ingen inloggning, inget sparas hos oss.</>
              : <><b>Privacy:</b> your file is read only in your browser and never uploaded. No login, nothing stored.</>}</span>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardContent className="py-5">
            <label className="block border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-gold transition-colors"
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); }}>
              <Upload className="h-7 w-7 text-gold mx-auto mb-2" />
              <div className="text-foreground font-medium">{sv ? 'Släpp en .ged-fil här, eller klicka för att välja' : 'Drop a .ged file, or click to choose'}</div>
              <div className="text-xs text-muted-foreground mt-1">{fileName ? `📄 ${fileName} · ${persons.length} personer` : (sv ? 'Exportera GEDCOM från ArkivDigital, MyHeritage, Disgen…' : 'Export GEDCOM from any genealogy program')}</div>
              <input type="file" accept=".ged,.gedcom" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
            </label>
            {persons.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">{loading ? (sv ? 'Geokodar socknar…' : 'Geocoding…') : (sv ? `${mappedPersons} av ${persons.length} anfäder placerade i ${geocoded} socknar. Klicka en socken för bygd-dossier.` : `${mappedPersons} of ${persons.length} ancestors placed in ${geocoded} parishes.`)}</p>
            )}

            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="text-xs text-muted-foreground mb-1.5">{sv ? 'Ingen GEDCOM? Skriv in en socken eller ort för en bygd-dossier — släktfil behövs inte:' : 'No GEDCOM? Type a parish or place for a district dossier — no family file needed:'}</div>
              <div className="flex gap-2">
                <input
                  value={placeQ}
                  onChange={(e) => setPlaceQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') lookupPlace(); }}
                  placeholder={sv ? 't.ex. Hossmo, Resmo, Kalmar…' : 'e.g. a Swedish parish…'}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60"
                />
                <button onClick={lookupPlace} className="bg-gold/90 hover:bg-gold text-slate-900 font-medium rounded px-3 py-1.5 text-sm shrink-0">{sv ? 'Slå upp' : 'Look up'}</button>
              </div>
              {lookupErr && <p className="text-xs text-red-300 mt-1.5">{lookupErr}</p>}
            </div>
          </CardContent>
        </Card>

        {parishes.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> {sv ? 'Anfäderna på kartan' : 'Ancestors on the map'}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="hidden sm:block"><ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} /></div>
                <div className="sm:hidden"><ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" /></div>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer text-muted-foreground hover:text-foreground" title={sv ? 'Visa SGU:s jordarter (morän, lera, sand…) — vilken mark gården låg på.' : 'Show SGU Quaternary deposits — the ground the farm sat on.'}>
                  <input type="checkbox" checked={showSoil} onChange={(e) => setShowSoil(e.target.checked)} className="accent-amber-600" />
                  🌾 {sv ? 'Jordarter (SGU)' : 'Soil (SGU)'}
                </label>
              </div>
              <GenMap parishes={parishes} onSelect={setSelected} shoreYear={shoreYear} selected={selected} footRadius={footRadius} annualRadius={annualRadius} nearby={nearby} routeTarget={routeTarget} showSoil={showSoil} />
              <p className="text-xs text-muted-foreground mt-2 opacity-75">{sv ? 'Guldring = socken där du har anfäder (större ring = fler). Strandlinjen visar bygdens forntida kustläge (SGU, 50–950 e.Kr.) — den djuptid gården ligger i. Jordarter © SGU (CC-BY).' : 'Gold = a parish with ancestors. Shoreline shows the district in deep time. Soil © SGU (CC-BY).'}</p>
            </CardContent>
          </Card>
        )}

        {selected && (
          <Card className="viking-card mb-4 border-gold/40">
            <CardHeader className="pb-2"><CardTitle className="text-base text-gold">{sv ? 'Inom gångavstånd från' : 'Within walking distance of'} {selected.name}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              {selected.persons.length > 0 && (
                <div>
                  <div className="text-foreground font-medium mb-1">{sv ? 'Anfäder här' : 'Ancestors here'} ({selected.persons.length})</div>
                  <div className="flex flex-wrap gap-1.5">{selected.persons.map((p, i) => <span key={i} className="inline-block bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs">{p.name}{p.year ? ` (${p.year})` : ''}</span>)}</div>
                </div>
              )}

              {/* Bilder i bygden — foton av runstenarna inom räckvidd (vi har inga generiska ort-foton,
                  men däremot fotograferade monument; ärligare än en påhittad "ort-bild"). */}
              {imaged.length > 0 && (
                <div>
                  <div className="text-foreground font-medium mb-1">{sv ? 'Bilder i bygden' : 'Images in the district'}</div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {imaged.slice(0, 12).map((f, i) => (
                      <Link key={i} to={`/inscription/${encodeURIComponent(f.raa_type || '')}`} title={f.name}
                        className="shrink-0 w-24 group">
                        <img src={thumbs[f.entity_id as string]} alt={f.name} loading="lazy"
                          className="h-20 w-24 rounded object-cover border border-slate-700 group-hover:border-gold transition-colors"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{f.name}</div>
                      </Link>
                    ))}
                  </div>
                  <p className="text-[11px] opacity-60 mt-0.5">{sv ? 'Foton av runstenarna i bygden (Wikimedia/RAÄ). Ort-foton generellt saknas i databasen.' : 'Photos of the district’s runestones (Wikimedia/RAÄ).'}</p>
                </div>
              )}

              <div className="space-y-2">
                {/* År + periodmedvetna färdsätt */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <label className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{sv ? 'År' : 'Year'}</span>
                    <input type="number" value={year} min={800} max={2000} step={10}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-foreground" />
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer" title={sv ? 'Hade de häst/vagn? Då når dagsleden längre — men vägbunden.' : 'Had a horse & cart? The day-journey reaches further, but road-bound.'}>
                    <input type="checkbox" checked={hasHorse} onChange={(e) => setHasHorse(e.target.checked)} className="accent-amber-500" />
                    <span>🐴 {sv ? 'Häst/vagn' : 'Horse & cart'}</span>
                  </label>
                  {[{ icon: '🚲', sv: 'Cykel', en: 'Bicycle', from: 1890 }, { icon: '🚂', sv: 'Tåg', en: 'Railway', from: 1860 }].map((m) => {
                    const ok = year >= m.from;
                    return <span key={m.sv} title={ok ? '' : (sv ? `Fanns inte här förrän ~${m.from}-talet` : `Not here until ~${m.from}`)}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 border ${ok ? 'border-sky-700/60 text-sky-200' : 'border-slate-700 text-slate-500 line-through'}`}>
                      {m.icon} {sv ? m.sv : m.en}</span>;
                  })}
                </div>
                {/* Inre band: daglig fot-radie */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-sky-300">◉ {sv ? 'Daglig värld till fots' : 'Daily world on foot'}: {(footRadius / 1000).toFixed(1)} km</span>
                  </div>
                  <input type="range" min={1000} max={10000} step={500} value={footRadius} onChange={(e) => setFootRadius(Number(e.target.value))} className="w-full accent-sky-500" />
                </div>
                {/* Yttre band: årlig dagsled */}
                <div className="text-xs text-amber-200/90">
                  ◌ {sv ? 'Årlig räckvidd (dagsled)' : 'Annual reach (a day’s journey)'}: ~{annualRadius / 1000} km {hasHorse ? (sv ? 'med häst/vagn — vägbunden' : 'by horse & cart — road-bound') : (sv ? 'till fots' : 'on foot')}
                </div>
                <p className="text-[11px] opacity-70">{sv ? 'Inre (blå) ringen = vardagsvärlden man nådde och var hemma samma dag till fots. Yttre (streckad) ringen = så långt en dagsled tog en: kyrka, ting, marknad. Med häst/vagn längre men vägbunden; på vattenled ännu längre. Cykeln kom först på 1890-talet, järnvägen nådde bygden från ~1860-talet.' : 'Inner (blue) ring = the everyday world reachable on foot in a day. Outer (dashed) ring = a day’s journey: church, assembly, market. Farther by horse & cart (road-bound) or boat. Bicycle only from the 1890s; railways from the ~1860s.'}</p>
              </div>

              {(() => {
                const waves = epidemics.filter((e) => e.year_start <= year + 15 && (e.year_end ?? e.year_start) >= year - 15);
                return waves.length > 0 ? (
                  <div>
                    <div className="text-foreground font-medium mb-1">{sv ? `Farsoter i riket kring ${year}` : `Epidemics in the realm around ${year}`}</div>
                    <div className="space-y-0.5">
                      {waves.map((e, i) => (
                        <div key={i} className="text-xs flex items-baseline gap-2">
                          <span className="text-rose-300 font-mono shrink-0">{e.year_start}{e.year_end && e.year_end !== e.year_start ? `–${e.year_end}` : ''}</span>
                          <span>{sv ? e.event_name : (e.event_name_en || e.event_name)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] opacity-60">{sv ? 'Nationella/regionala vågor (inte sockennivå) — farsoten drog fram i riket dessa år. Källkritiskt kurerade; krönikeuppgifter utelämnade.' : 'National/regional waves (not parish-level). Source-critically curated; chronicle claims omitted.'}</p>
                  </div>
                ) : null;
              })()}

              {!nearby ? <p>{sv ? 'Hämtar…' : 'Loading…'}</p> : nearby.length === 0 ? (
                <p className="text-xs opacity-70">{sv ? 'Inga registrerade lämningar inom radien ännu.' : 'Nothing registered within range yet.'}</p>
              ) : (
                <>
                  {(() => { const church = nearby.find((f) => f.kind === 'church' || /kyrka/i.test(f.raa_type || '')); return church ? (
                    <div className="text-foreground flex items-center gap-2 flex-wrap">
                      ⛪ <b>{sv ? 'Kyrkan' : 'The church'}:</b> {church.name} — {church.dist_m < 1000 ? `${church.dist_m} m` : `${(church.dist_m / 1000).toFixed(1)} km`} {sv ? 'bort' : 'away'}
                      <button onClick={() => setRouteTarget(church)} className="text-[11px] rounded border border-sky-600 text-sky-300 px-1.5 py-0.5 hover:bg-sky-500/15">🧭 {sv ? 'Gå hit' : 'Walk here'}</button>
                    </div>
                  ) : null; })()}

                  {/* Hem → mål (kyrka/ort): bäring + avstånd + vad man passerar (features_along_route) */}
                  {routeTarget && selected && (() => {
                    const dist = haversineKm(selected, routeTarget);
                    const dir = (sv ? COMPASS.sv : COMPASS.en)[Math.round(bearingDeg(selected, routeTarget) / 45) % 8];
                    const cGraves = (corridor ?? []).filter(isGraveFeature);
                    const cRest = (corridor ?? []).filter((f) => !isGraveFeature(f));
                    return (
                      <div className="rounded-lg border border-sky-700/50 bg-sky-500/5 p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="text-sky-200 font-medium text-sm">🧭 {sv ? 'Gå till' : 'Walk to'} {routeTarget.name}</div>
                          <button onClick={() => setRouteTarget(null)} className="text-slate-400 hover:text-white text-xs" aria-label={sv ? 'Stäng' : 'Close'}>✕</button>
                        </div>
                        <div className="text-xs text-sky-300 mt-0.5">{dist.toFixed(1)} km · {dir} {sv ? 'härifrån' : 'from here'} <span className="opacity-60">({sv ? 'fågelvägen' : 'as the crow flies'})</span></div>
                        {corridor === null ? <p className="text-xs mt-1 opacity-70">{sv ? 'Hämtar…' : 'Loading…'}</p> : corridor.length === 0 ? (
                          <p className="text-xs mt-1 opacity-70">{sv ? 'Inga registrerade lämningar längs vägen.' : 'Nothing registered along the way.'}</p>
                        ) : (
                          <div className="mt-1.5">
                            <div className="text-foreground text-xs font-medium mb-1">{sv ? 'På vägen dit' : 'On the way'} ({corridor.length})</div>
                            <div className="max-h-48 overflow-y-auto pr-1 space-y-0.5">
                              {cRest.map((f, i) => (
                                <div key={i} className="text-xs flex items-baseline gap-2">
                                  <span className="shrink-0">{featEmoji(f)}</span>
                                  <span>{f.name} <span className="opacity-55">{f.raa_type || ''}</span></span>
                                </div>
                              ))}
                              {cGraves.length > 0 && <div className="text-xs text-slate-400">⚰️ {cGraves.length} {sv ? 'gravar & rösen längs vägen' : 'graves & cairns along the way'}</div>}
                            </div>
                          </div>
                        )}
                        <p className="text-[11px] opacity-60 mt-1.5">{sv ? 'Fågelvägen, inte vägrutt. På plats med mobil pekar fältlägets riktningskägla dit du ska gå.' : 'Straight line, not a road route. In field mode on your phone the direction cone points the way.'}</p>
                      </div>
                    );
                  })()}
                  {(() => {
                    const renderRow = (f: NearbyFeature, i: number) => {
                      const isRune = f.kind === 'runestone';
                      const to = isRune ? `/inscription/${encodeURIComponent(f.raa_type || '')}` : `/explore?center=${f.lat},${f.lng}&zoom=14`;
                      const icon = featEmoji(f);
                      return (
                        <Link key={`${f.name}-${i}`} to={to} title={isRune ? (sv ? 'Öppna runinskriften' : 'Open the inscription') : (sv ? 'Öppna på kartan' : 'Open on the map')}
                          className="flex items-baseline gap-2 text-xs py-0.5 border-b border-slate-800/50 hover:bg-slate-800/40 rounded">
                          <span className="text-sky-300 font-mono shrink-0 w-14 text-right">{f.dist_m < 1000 ? f.dist_m + ' m' : (f.dist_m / 1000).toFixed(1) + ' km'}</span>
                          <span className="hover:underline"><span className={isRune ? 'text-amber-400' : ''}>{icon}</span> {f.name} {!isRune && <span className="opacity-60">{f.raa_type || ''}</span>} <span className="text-sky-400">↗</span></span>
                          {f.existence === 'extant' && <span title={sv ? 'Står kvar enligt RAÄ' : 'Extant per RAÄ'} className="shrink-0">🟢</span>}
                          {f.existence === 'destroyed' && <span title={sv ? 'Borttagen enligt RAÄ' : 'Removed per RAÄ'} className="shrink-0 opacity-60">⚪</span>}
                        </Link>
                      );
                    };
                    const graves = nearby.filter(isGraveFeature);
                    const rest = nearby.filter((f) => !isGraveFeature(f));
                    return (
                      <div>
                        <div className="text-foreground font-medium mb-1">{sv ? 'Att se inom räckvidd' : 'Within reach'} ({nearby.length})</div>
                        <div className="max-h-64 overflow-y-auto pr-1">
                          {rest.map(renderRow)}
                          {graves.length > 0 && (
                            <div>
                              <button type="button" onClick={() => setShowGraves((s) => !s)}
                                className="w-full flex items-baseline gap-2 text-xs py-1 hover:bg-slate-800/40 rounded text-left border-b border-slate-800/50">
                                <span className="text-slate-400 font-mono shrink-0 w-14 text-right">{graves.length}</span>
                                <span className="text-slate-300">⚰️ {sv ? 'Gravar & rösen' : 'Graves & cairns'} <span className="opacity-55">{sv ? '(stensättningar, rösen, gravfält)' : '(graves, cairns, fields)'}</span> {showGraves ? '▾' : '▸'}</span>
                              </button>
                              {showGraves && graves.map(renderRow)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-[11px] opacity-70">{sv ? 'Ur vår publika databas (RAÄ Fornsök, kyrkor m.fl.). Fågelvägen från sockencentroiden. 🟢 = står kvar, ⚪ = borttagen (RAÄ); utan markör = antikvarisk status ännu ej hämtad — vi redovisar det öppet hellre än att gissa.' : 'From our public database, as-the-crow-flies from the parish centroid. 🟢 = extant, ⚪ = removed (RAÄ); no marker = status not yet fetched — shown openly rather than guessed.'}</p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 text-sky-300 shrink-0 mt-0.5" />
          {sv ? 'Geokodning sker på sockennamn mot Lantmäteriets ortnamn — namnkrockar (t.ex. flera "Torslunda") kan ge ungefärligt läge. Lägg till län i din GEDCOM för bättre träff.' : 'Geocoding matches parish names; name clashes may be approximate.'}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Genealogy;
