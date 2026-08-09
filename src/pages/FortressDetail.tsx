import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { ArrowLeft, MapPin, Layers, Info, Mountain, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { NEAR_CATS, classifyNear, type NearCat } from '@/utils/nearFeatureCategories';
import { nearestWithin } from '@/utils/geoDistance';
import { RELIGIOUS_PLACES } from '@/utils/religiousLocations/religiousPlacesData';
import { PLACE_TYPE_LABEL } from '@/components/excursions/nearbyLabels';
import { WindRose } from '@/components/explorer/WindRose';
import { ReferenceList, type RefSource } from '@/components/references/ReferenceList';

// Generisk fornborgs-detaljvy (mall för samtliga borgar), testad på Mossberga.
// Kartan staplar AUKTORITATIVA, öppna lager: OSM-bas + SGU jordarter (geomorfologiskt material)
// + SGU berggrund — verifierade öppna WMS (CC-BY, ingen Geotorget-gate). Kommer: LiDAR-
// terrängskuggning (vallprofiler), RAÄ lämningsavgränsning (polygon via raa_number), ortofoto, bilder.

interface Fort {
  id: string; name: string; coordinates: { x: number; y: number } | string | null;
  raa_number: string | null; landscape: string; parish: string | null; municipality: string | null;
  fortress_type: string | null; description: string | null; period: string | null;
  cultural_significance: string | null; source_reference: string | null;
  dating_basis: string | null; dating_confidence: string | null; nearby_runestones: number | null;
}

interface RcDate { cal_from: number | null; cal_to: number | null; cal_sigma: string | null; material: string | null; context: string | null; source: string | null; note: string | null; }
interface Geochem { element: string; higher_in: string | null; significant: boolean | null; interpretation: string | null; }
interface MetalAn { find_ref?: string | null; system: string; value: number | null; unit: string | null; note: string | null; }
interface MaterialAn { find_ref: string | null; material: string | null; method: string | null; result: string | null; provenance_interpretation: string | null; }
interface Inv { title: string; year_from: number | null; investigation_type: string | null; source_institution: string | null; }

const yr = (n: number | null | undefined) => n == null ? '' : n < 0 ? `${-n} f.Kr.` : `${n} e.Kr.`;

// Claim-status → etikett + färg (källkritik: omtvistat/förkastat fryses aldrig till fakta).
const CLAIM_STATUS: Record<string, { sv: string; en: string; cls: string }> = {
  verified: { sv: 'belagt', en: 'verified', cls: 'text-emerald-300 border-emerald-500/40' },
  established: { sv: 'belagt', en: 'established', cls: 'text-emerald-300 border-emerald-500/40' },
  accepted: { sv: 'belagt', en: 'accepted', cls: 'text-emerald-300 border-emerald-500/40' },
  corroborated: { sv: 'styrkt', en: 'corroborated', cls: 'text-emerald-300 border-emerald-500/40' },
  disputed: { sv: 'omtvistat', en: 'disputed', cls: 'text-amber-300 border-amber-500/40' },
  contested: { sv: 'omtvistat', en: 'contested', cls: 'text-amber-300 border-amber-500/40' },
  needs_verification: { sv: 'behöver verifieras', en: 'needs verification', cls: 'text-slate-300 border-slate-500/40' },
  unverified: { sv: 'overifierat', en: 'unverified', cls: 'text-slate-300 border-slate-500/40' },
  rejected: { sv: 'förkastat', en: 'rejected', cls: 'text-rose-300 border-rose-500/40' },
  refuted: { sv: 'motbevisat', en: 'refuted', cls: 'text-rose-300 border-rose-500/40' },
};

const parseLatLng = (co: Fort['coordinates']): [number, number] | null => {
  if (!co) return null;
  if (typeof co === 'string') { const m = co.match(/\(([^,]+),([^)]+)\)/); return m ? [parseFloat(m[2]), parseFloat(m[1])] : null; }
  if (typeof co === 'object' && 'y' in co && 'x' in co) return [co.y, co.x];
  return null;
};

const SGU_JORD = 'https://resource.sgu.se/service/wms/130/jordarter-25-100-tusen';
const SGU_BERG = 'https://resource.sgu.se/service/wms/130/berggrund-50-250-tusen';

// Foton som Daniel laddat upp ligger i /excursion-photos/<dir>/ (manifest.json). Koppla borg-UUID →
// fotomapp så samma unika bilder som utflyktssidan visar även på den kanoniska fortsidan.
const FORT_PHOTO_DIR: Record<string, string> = {
  '6660de5b-9d2e-4fa4-b58e-f327fd256ae3': 'ismantorp-borg-oland', // Ismantorps borg
};

const FortressDetail = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { id } = useParams<{ id: string }>();
  const [fort, setFort] = useState<Fort | null>(null);
  const [similar, setSimilar] = useState<number | null>(null);
  const [rc, setRc] = useState<RcDate[]>([]);
  const [geochem, setGeochem] = useState<Geochem[]>([]);
  const [metal, setMetal] = useState<MetalAn[]>([]);
  const [material, setMaterial] = useState<MaterialAn[]>([]);
  const [invs, setInvs] = useState<Inv[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  // Källkritisk claim-liggare + Wikipedia-stil källförteckning (place_claim → historical_sources).
  interface Claim { attribute: string | null; statement: string | null; value_text: string | null; verification_status: string | null; source_id: string | null; }
  const [claims, setClaims] = useState<Claim[]>([]);
  const [refs, setRefs] = useState<RefSource[]>([]);
  // source_id → fotnotsnummer (index i referenslistan + 1), så [n] länkar till #ref-n.
  const refNo = useMemo(() => { const m = new Map<string, number>(); refs.forEach((r, i) => m.set(r.id, i + 1)); return m; }, [refs]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  // Fas 1 (porterat från Ismantorp-utflykten): typade sevärdheter + vägnät + legend, centrerat på borgen.
  const nearbyLayerRef = useRef<L.FeatureGroup | null>(null);
  const terrLayerRef = useRef<L.FeatureGroup | null>(null);
  const [radius, setRadius] = useState(3000);
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());
  const toggleCat = (id: string) => setHiddenCats((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [nearbyDb, setNearbyDb] = useState<{ kind: string; name: string; raa_type: string | null; lat: number; lng: number; dist_m: number }[]>([]);
  const [roadsNear, setRoadsNear] = useState<{ name: string; raa_type: string | null; len_m: number; geojson: string }[]>([]);
  const isOland = !!fort && /öland/i.test(`${fort.landscape ?? ''} ${fort.parish ?? ''} ${fort.municipality ?? ''}`);

  // Sevärdheter + vägnät nära borgen (features_near + roads_near), reglerbar radie.
  useEffect(() => {
    const ll = fort ? parseLatLng(fort.coordinates) : null;
    if (!ll) return;
    let cancelled = false;
    (async () => {
      const sb = supabase as any;
      const [nf, rn] = await Promise.all([
        sb.rpc('features_near', { p_lat: ll[0], p_lng: ll[1], radius_m: radius }),
        sb.rpc('roads_near', { p_lat: ll[0], p_lng: ll[1], p_radius_m: radius }),
      ]);
      if (cancelled) return;
      setNearbyDb(nf.data ?? []);
      setRoadsNear(rn.data ?? []);
    })();
    return () => { cancelled = true; };
  }, [fort, radius]);

  interface TypedFeat { cat: NearCat; name: string; type: string; lat: number; lng: number; dist_m: number; link: string; isRune: boolean; }
  const typedFeatures = useMemo<TypedFeat[]>(() => {
    const ll = fort ? parseLatLng(fort.coordinates) : null;
    const out: TypedFeat[] = [];
    nearbyDb.forEach((f) => {
      const isRune = f.kind === 'runestone';
      out.push({ cat: classifyNear(f.kind, f.raa_type), name: f.name, type: isRune ? 'runsten' : (f.raa_type || ''),
        lat: f.lat, lng: f.lng, dist_m: f.dist_m, isRune,
        link: isRune ? `/inscription/${encodeURIComponent(f.raa_type || '')}` : `/explore?center=${f.lat},${f.lng}&zoom=15` });
    });
    const cult = NEAR_CATS.find((c) => c.id === 'cult')!;
    if (ll) nearestWithin({ lat: ll[0], lng: ll[1] }, RELIGIOUS_PLACES, (p) => p.coordinates, radius / 1000, 60).forEach(({ item, km }) => {
      out.push({ cat: cult, name: item.name, type: (PLACE_TYPE_LABEL[item.type]?.[sv ? 'sv' : 'en']) ?? item.type,
        lat: item.coordinates.lat, lng: item.coordinates.lng, dist_m: Math.round(km * 1000), isRune: false,
        link: `/explore?center=${item.coordinates.lat},${item.coordinates.lng}&zoom=15` });
    });
    return out.sort((a, b) => a.dist_m - b.dist_m);
  }, [nearbyDb, fort, radius, sv]);

  const presentCats = useMemo(() => {
    const counts = new Map<string, number>();
    typedFeatures.forEach((f) => counts.set(f.cat.id, (counts.get(f.cat.id) ?? 0) + 1));
    if (roadsNear.length) counts.set('road', (counts.get('road') ?? 0) + roadsNear.length);
    return NEAR_CATS.filter((c) => counts.has(c.id)).map((c) => ({ ...c, n: counts.get(c.id)! }));
  }, [typedFeatures, roadsNear]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const sb = supabase as any;
      const { data, error } = await sb.from('swedish_hillforts')
        .select('id,name,coordinates,raa_number,landscape,parish,municipality,fortress_type,description,period,cultural_significance,source_reference,dating_basis,dating_confidence,nearby_runestones')
        .eq('id', id).maybeSingle();
      if (error) { setErr(error.message); setLoading(false); return; }
      if (data) {
        setFort(data as Fort);
        const { count } = await sb.from('swedish_hillforts')
          .select('id', { count: 'exact', head: true }).eq('landscape', (data as Fort).landscape);
        setSimilar(count ?? null);
        setLoading(false);
        return;
      }
      // Fallback: kurerad viking_fortresses (borgar utan swedish_hillforts-motsvarighet) så deras
      // /fortresses/:id-länk fungerar (Daniel: fixa fortress-länkarna). Mappar region→landscape m.m.
      const { data: vf } = await sb.from('viking_fortresses')
        .select('id,name,coordinates,raa_number,region,fortress_type,description,construction_period,historical_significance')
        .eq('id', id).maybeSingle();
      if (!vf) { setErr(sv ? 'Borgen hittades inte' : 'Fortress not found'); setLoading(false); return; }
      setFort({
        id: vf.id, name: vf.name, coordinates: vf.coordinates, raa_number: vf.raa_number ?? null,
        landscape: vf.region ?? '', parish: null, municipality: null, fortress_type: vf.fortress_type ?? null,
        description: vf.description ?? null, period: vf.construction_period ?? null,
        cultural_significance: vf.historical_significance ?? null, source_reference: null,
        dating_basis: null, dating_confidence: null, nearby_runestones: null,
      } as Fort);
      setSimilar(null);
      setLoading(false);
    })();
  }, [id, sv]);

  // Forensik-lager (14C, geokemi, arkeometri, undersökningshistorik) — var för sig, tål tomt/fel.
  useEffect(() => {
    if (!id) return;
    (async () => {
      const sb = supabase as any;
      const [rcR, gcR, maR, matR, relR] = await Promise.all([
        sb.from('radiocarbon_dates').select('cal_from,cal_to,cal_sigma,material,context,source,note').eq('object_id', id).order('cal_from'),
        sb.from('site_geochemistry').select('element,higher_in,significant,interpretation').eq('hillfort_id', id).order('element'),
        sb.from('metal_analyses').select('system,value,unit,note').eq('object_id', id),
        sb.from('material_analyses').select('find_ref,material,method,result,provenance_interpretation').eq('object_id', id),
        sb.from('relationship').select('object_id').eq('subject_id', id).eq('predicate', 'investigated_by'),
      ]);
      setRc(rcR.data ?? []);
      setGeochem(gcR.data ?? []);
      setMetal(maR.data ?? []);
      setMaterial(matR.data ?? []);
      const invIds = (relR.data ?? []).map((r: { object_id: string }) => r.object_id);
      if (invIds.length) {
        const { data } = await sb.from('archaeological_investigations')
          .select('title,year_from,investigation_type,source_institution').in('id', invIds).order('year_from');
        setInvs(data ?? []);
      }
    })();
  }, [id]);

  // Källhänvisningar sist på sidan (i st.f. separata källsidor): distinkta källor som citeras i borgens
  // claim-liggare. Källor är referenser här, inte egna destinationssidor (Daniel: Wikipedia-modell).
  useEffect(() => {
    if (!id) return;
    (async () => {
      const sb = supabase as any;
      const { data: pc } = await sb.from('place_claim')
        .select('attribute, statement, value_text, verification_status, source_id')
        .eq('entity_id', id);
      const rows = (pc ?? []) as Claim[];
      setClaims(rows);
      const ids = [...new Set(rows.map((r) => r.source_id).filter(Boolean) as string[])];
      if (!ids.length) { setRefs([]); return; }
      const { data: srcs } = await sb.from('historical_sources').select('id,title,author,written_year,url').in('id', ids);
      setRefs(((srcs ?? []) as any[])
        .map((s) => ({ id: s.id, title: s.title, author: s.author, year: s.written_year, url: s.url } as RefSource))
        .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title)));
    })();
  }, [id]);

  // Karta + auktoritativt lager-stack (SGU öppna WMS som togglebara overlays).
  useEffect(() => {
    if (!fort || !containerRef.current || mapRef.current) return;
    const ll = parseLatLng(fort.coordinates);
    if (!ll) return;
    const map = L.map(containerRef.current, { center: ll, zoom: 15, scrollWheelZoom: true });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    const jord = L.tileLayer.wms(SGU_JORD, { layers: 'JORD_25K_Grundlager', format: 'image/png', transparent: true, opacity: 0.55, attribution: 'Jordarter © SGU (CC-BY)' } as any);
    const berg = L.tileLayer.wms(SGU_BERG, { layers: 'BERG_50K_geologisk_enhet_yta', format: 'image/png', transparent: true, opacity: 0.55, attribution: 'Berggrund © SGU (CC-BY)' } as any);
    L.control.layers({ 'OpenStreetMap': osm }, {
      [sv ? 'Jordarter (SGU) — material' : 'Quaternary deposits (SGU)']: jord,
      [sv ? 'Berggrund (SGU)' : 'Bedrock (SGU)']: berg,
    }, { collapsed: false }).addTo(map);
    L.marker(ll).addTo(map).bindPopup(`<b>${fort.name}</b>`).openPopup();
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 80);
    return () => { map.remove(); mapRef.current = null; nearbyLayerRef.current = null; terrLayerRef.current = null; };
  }, [fort, sv]);

  // Fas 1: typade sevärdheter + vägnät som LINJER + radiecirkel (togglas via legenden).
  useEffect(() => {
    const map = mapRef.current; const ll = fort ? parseLatLng(fort.coordinates) : null;
    if (!map || !ll) return;
    if (nearbyLayerRef.current) { try { map.removeLayer(nearbyLayerRef.current); } catch { /* noop */ } }
    const g = L.featureGroup();
    L.circle(ll, { radius, color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.05 }).addTo(g);
    typedFeatures.forEach((f) => {
      if (hiddenCats.has(f.cat.id)) return;
      const dist = f.dist_m < 1000 ? `${f.dist_m} m` : `${(f.dist_m / 1000).toFixed(1)} km`;
      const linkLabel = f.isRune ? (sv ? 'Öppna runinskriften' : 'Open inscription') : (sv ? 'Öppna på kartan' : 'Open on map');
      L.circleMarker([f.lat, f.lng], { radius: f.cat.r, color: '#0f172a', weight: 1, fillColor: f.cat.color, fillOpacity: 0.9 })
        .bindPopup(`<strong>${f.cat.glyph} ${f.name}</strong><br/><span style="font-size:11px;color:#666">${f.type ? f.type + ' · ' : ''}${dist}</span><br/><a href="${f.link}" style="font-size:11px">${linkLabel} →</a>`)
        .addTo(g);
    });
    if (!hiddenCats.has('road')) roadsNear.forEach((r) => {
      let geom; try { geom = JSON.parse(r.geojson); } catch { return; }
      L.geoJSON(geom, { style: () => ({ color: '#b45309', weight: 4, opacity: 0.9 }) })
        .bindPopup(`<strong>🛤️ ${r.name || (sv ? 'Färdväg' : 'Road')}</strong><br/><span style="font-size:11px;color:#666">${r.raa_type || 'färdväg'}${r.len_m ? ` · ${r.len_m < 1000 ? r.len_m + ' m' : (r.len_m / 1000).toFixed(1) + ' km'}` : ''}</span>`).addTo(g);
    });
    g.addTo(map); nearbyLayerRef.current = g;
    return () => { try { map.removeLayer(g); } catch { /* noop */ } };
  }, [typedFeatures, roadsNear, hiddenCats, radius, fort, sv]);

  // Fas 2 (Öland): teoretiska borgterritorier (Voronoi, schematiskt) ur oland_fort_territories.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isOland || hiddenCats.has('territory')) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any).rpc('oland_fort_territories');
      if (cancelled || !data || !mapRef.current) return;
      const g = L.featureGroup();
      (data as any[]).forEach((f) => {
        let geom; try { geom = JSON.parse(f.geojson); } catch { return; }
        const style = f.dated ? { color: '#b45309', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.06 }
          : { color: '#64748b', weight: 1, dashArray: '4 4', fillColor: '#94a3b8', fillOpacity: 0.03 };
        L.geoJSON(geom, { style: () => style as any })
          .bindPopup(`<b>${f.fort_name}</b><br/><span style="font-size:11px">Teoretiskt borgterritorium (Voronoi, schematiskt)${f.dated ? '' : '<br/><em>odaterad — vägs lägre</em>'}</span>`).addTo(g);
      });
      if (terrLayerRef.current) { try { mapRef.current.removeLayer(terrLayerRef.current); } catch { /* noop */ } }
      g.addTo(mapRef.current); terrLayerRef.current = g;
    })();
    return () => { cancelled = true; if (mapRef.current && terrLayerRef.current) { try { mapRef.current.removeLayer(terrLayerRef.current); } catch { /* noop */ } } };
  }, [isOland, hiddenCats, fort]);

  // Fotogalleri: läs manifestet och plocka mappen för denna borg (om någon finns).
  useEffect(() => {
    const dir = id ? FORT_PHOTO_DIR[id] : undefined;
    if (!dir) { setPhotos([]); return; }
    let cancelled = false;
    fetch('/excursion-photos/manifest.json')
      .then((r) => r.ok ? r.json() : {})
      .then((m: Record<string, string[]>) => { if (!cancelled) setPhotos((m?.[dir] ?? []).map((f) => `/excursion-photos/${dir}/${f}`)); })
      .catch(() => { if (!cancelled) setPhotos([]); });
    return () => { cancelled = true; };
  }, [id]);

  const row = (label: string, val: React.ReactNode) => val ? (
    <div className="flex gap-2 text-sm"><span className="text-muted-foreground min-w-[130px]">{label}</span><span className="text-foreground">{val}</span></div>
  ) : null;

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta title={fort ? `${fort.name} — fornborg` : 'Fornborg'} titleEn={fort ? `${fort.name} — hillfort` : 'Hillfort'}
        description={fort?.description ?? 'Fornborg i Viking Age-plattformen.'} descriptionEn={fort?.description ?? 'Hillfort.'} />
      <Header /><Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        <Link to="/fortresses" className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />{sv ? 'Till borgarna' : 'To fortresses'}
        </Link>

        {loading && <p className="text-muted-foreground">{sv ? 'Laddar…' : 'Loading…'}</p>}
        {err && <p className="text-red-400">{err}</p>}

        {fort && (
          <>
            <h1 className="text-4xl font-bold text-foreground mb-1">{fort.name}</h1>
            <p className="text-muted-foreground mb-6">
              {[fort.fortress_type === 'ring_fortress' ? (sv ? 'Ringborg' : 'Ring fort') : (sv ? 'Fornborg' : 'Hillfort'),
                fort.period, fort.parish && `${fort.parish} sn`, fort.landscape].filter(Boolean).join(' · ')}
            </p>

            {/* Foton (samma unika bilder som utflyktssidan) — fortsidan är kanonisk sida för platsen. */}
            {photos.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border">
                    <img src={src} alt={`${fort.name} — ${sv ? 'foto' : 'photo'} ${i + 1}`} loading="lazy" className="h-32 w-full object-cover transition-opacity hover:opacity-90" />
                  </a>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Karta med lager-stack */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 text-sm text-foreground mb-2"><Layers className="h-4 w-4 text-gold" />
                  {sv ? 'Karta — tänd SGU-lager för geomorfologi (material) och berggrund' : 'Map — toggle SGU layers for geomorphology and bedrock'}</div>
                <div className="mb-2 flex items-center gap-2 text-xs">
                  <span className="text-sky-300 whitespace-nowrap">{sv ? 'Radie' : 'Radius'}: {radius < 1000 ? `${radius} m` : `${(radius / 1000).toFixed(1)} km`}</span>
                  <input type="range" min={500} max={30000} step={500} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="flex-1 accent-sky-500" />
                  <span className="text-muted-foreground whitespace-nowrap">{typedFeatures.length} {sv ? 'sevärdheter' : 'sights'}</span>
                </div>
                <div ref={containerRef} className="w-full rounded-lg border border-border" style={{ height: '58vh', minHeight: 420 }} />
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Mountain className="h-3 w-3" />
                  {sv ? 'Kommande lager: LiDAR-terrängskuggning (vallprofiler entydigt), RAÄ lämningsavgränsning (polygon via raa_number), ortofoto, foton. Kustnära borgar: SGU maringeologi/djup.' : 'Coming: LiDAR hillshade, RAÄ site boundary, orthophoto, photos.'}</p>
              </div>

              {/* Faktapanel */}
              <div className="space-y-4">
                <div className="viking-card rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold"><Info className="h-4 w-4 text-gold" />{sv ? 'Fakta' : 'Facts'}</div>
                  {row(sv ? 'Typ' : 'Type', fort.fortress_type)}
                  {row(sv ? 'Ålder' : 'Age', fort.period)}
                  {row(sv ? 'Dateringsgrund' : 'Dating basis', fort.dating_basis && `${fort.dating_basis}${fort.dating_confidence ? ` (${fort.dating_confidence})` : ''}`)}
                  {row(sv ? 'Socken' : 'Parish', [fort.parish, fort.municipality, fort.landscape].filter(Boolean).join(' · '))}
                  {row('RAÄ', fort.raa_number)}
                  {row(sv ? 'Runstenar i närheten' : 'Nearby runestones', fort.nearby_runestones != null ? String(fort.nearby_runestones) : null)}
                  {row(sv ? 'Läge' : 'Location', (() => { const ll = parseLatLng(fort.coordinates); return ll ? `${ll[0].toFixed(5)}°N ${ll[1].toFixed(5)}°E` : null; })())}
                </div>

                {similar != null && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm text-foreground"><MapPin className="h-4 w-4 text-gold inline mr-1" />
                      {sv ? <>Det finns <strong>{similar}</strong> borgar i {fort.landscape}.</> : <><strong>{similar}</strong> forts in {fort.landscape}.</>}</div>
                    <Link to="/fortresses" className="text-xs text-gold hover:underline">{sv ? 'Se alla borgar' : 'See all forts'} →</Link>
                  </div>
                )}

                {fort.description && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-1">{sv ? 'Beskrivning' : 'Description'}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{fort.description}</p>
                  </div>
                )}
                {fort.cultural_significance && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-1">{sv ? 'Varför den är intressant' : 'Significance'}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{fort.cultural_significance}</p>
                  </div>
                )}
                {fort.source_reference && <p className="text-[11px] text-muted-foreground">{sv ? 'Källa' : 'Source'}: {fort.source_reference}</p>}

                {/* Fas 1: typad teckenförklaring (togglebar) + sevärdheter inom räckvidd (som Ismantorp). */}
                {(typedFeatures.length > 0 || roadsNear.length > 0) && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2"><Navigation className="h-4 w-4 text-sky-400" />{sv ? 'Sevärdheter inom räckvidd' : 'Sights within reach'} ({typedFeatures.length})</h2>
                    <p className="text-xs text-muted-foreground mb-2">{sv ? 'Klicka i teckenförklaringen för att visa/dölja lager. Färg & storlek = typ.' : 'Toggle layers in the legend. Colour & size show type.'}</p>
                    <ul className="space-y-1 mb-3">
                      {presentCats.map((c) => { const off = hiddenCats.has(c.id); return (
                        <li key={c.id}>
                          <button onClick={() => toggleCat(c.id)} className={`flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm hover:bg-muted/30 ${off ? 'opacity-40' : ''}`}>
                            <span className="h-3 w-3 shrink-0 rounded-full border" style={{ backgroundColor: off ? 'transparent' : c.color, borderColor: c.color }} aria-hidden="true" />
                            <span className="w-4 text-center text-xs" aria-hidden="true">{c.glyph}</span>
                            <span className="flex-1 text-muted-foreground">{sv ? c.sv : c.en}</span>
                            <span className="shrink-0 tabular-nums text-xs text-muted-foreground/60">{c.n}</span>
                          </button>
                        </li>
                      ); })}
                      {isOland && (
                        <li>
                          <button onClick={() => toggleCat('territory')} className={`flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm hover:bg-muted/30 ${hiddenCats.has('territory') ? 'opacity-40' : ''}`}>
                            <span className="h-3 w-3 shrink-0 rounded-full border" style={{ backgroundColor: 'transparent', borderColor: '#f59e0b' }} aria-hidden="true" />
                            <span className="w-4 text-center text-xs" aria-hidden="true">▨</span>
                            <span className="flex-1 text-muted-foreground">{sv ? 'Borgterritorium (Voronoi)' : 'Fort territory (Voronoi)'}</span>
                          </button>
                        </li>
                      )}
                    </ul>
                    <div className="max-h-[40vh] overflow-y-auto pr-1 border-t border-border/40 pt-2">
                      {typedFeatures.map((f, i) => (
                        <a key={i} href={f.link} title={f.isRune ? (sv ? 'Öppna runinskriften' : 'Open inscription') : (sv ? 'Öppna på kartan' : 'Open on map')}
                          className={`flex items-baseline gap-2 py-0.5 border-b border-border/40 hover:bg-muted/30 rounded ${hiddenCats.has(f.cat.id) ? 'opacity-40' : ''}`}>
                          <span className="text-sky-300 font-mono shrink-0 w-14 text-right text-xs">{f.dist_m < 1000 ? `${f.dist_m} m` : `${(f.dist_m / 1000).toFixed(1)} km`}</span>
                          <span className="min-w-0 text-sm"><span className="mr-1" aria-hidden="true">{f.cat.glyph}</span><span className="hover:underline">{f.name}</span>{f.type && <span className="text-muted-foreground/60 text-xs"> · {f.type}</span>}</span>
                        </a>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 mt-2">{sv ? 'Ur RAÄ Fornsök + kyrkor + kultplatser (fågelvägen). Justera radien ovanför kartan.' : 'From the heritage register, churches & cult sites. Adjust the radius above the map.'}</p>
                  </div>
                )}
                {/* Fas 2 (Öland): förhärskande vind (SMHI, Kalmarsund) — minimerbar. */}
                {isOland && <WindRose location="Kalmarsund" defaultOpen={false} />}
              </div>
            </div>

            {/* Forensik: 14C, geokemi, arkeometri, undersökningshistorik */}
            {(rc.length > 0 || geochem.length > 0 || metal.length > 0 || material.length > 0 || invs.length > 0) && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {rc.length > 0 && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? '¹⁴C-dateringar' : 'Radiocarbon dates'}</div>
                    <ul className="space-y-2">
                      {rc.map((d, i) => (
                        <li key={i} className="text-sm">
                          <span className="text-gold font-medium">{yr(d.cal_from)}–{yr(d.cal_to)}</span>
                          {d.cal_sigma && <span className="text-muted-foreground"> ({d.cal_sigma})</span>}
                          {d.material && <span className="text-muted-foreground"> · {d.material}</span>}
                          {d.context && <div className="text-xs text-muted-foreground">{d.context}</div>}
                          {d.note && <div className="text-xs text-muted-foreground italic">{d.note}</div>}
                        </li>
                      ))}
                    </ul>
                    {rc[0]?.source && <p className="text-[11px] text-muted-foreground mt-2">{sv ? 'Källa' : 'Source'}: {rc[0].source}</p>}
                  </div>
                )}

                {geochem.length > 0 && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? 'Geokemi (XRF) — funktionsindelning' : 'Geochemistry (XRF)'}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {geochem.filter((g) => g.significant).map((g, i) => (
                        <span key={i} title={g.interpretation ?? ''}
                          className="text-xs px-2 py-0.5 rounded border border-border text-foreground">
                          {g.element} <span className="text-muted-foreground">↑ {g.higher_in}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">{sv ? 'Signifikant förhöjda grundämnen per borgdel (hovra för tolkning). Östra ringen: föda + kopparlegeringshantverk; mellersta: järn.' : 'Elements significantly enriched per fort segment (hover for interpretation).'}</p>
                  </div>
                )}

                {(metal.length > 0 || material.length > 0) && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? 'Arkeometri' : 'Archaeometry'}</div>
                    {metal.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-muted-foreground mb-1">{sv ? 'Metallanalys (XRF)' : 'Metal analysis (XRF)'}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {metal.map((m, i) => (
                            <span key={i} title={m.note ?? ''} className="text-xs px-2 py-0.5 rounded border border-border text-foreground">
                              {m.system} {m.value != null ? `${m.value}${m.unit === 'mass%' ? '%' : ` ${m.unit ?? ''}`}` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {material.map((m, i) => (
                      <div key={i} className="text-xs text-muted-foreground mb-1">
                        <span className="text-foreground">{m.find_ref} · {m.material}</span> ({m.method}): {m.provenance_interpretation ?? m.result}
                      </div>
                    ))}
                  </div>
                )}

                {invs.length > 0 && (
                  <div className="viking-card rounded-lg border border-border p-4">
                    <div className="text-sm font-semibold text-foreground mb-2">{sv ? 'Undersökningshistorik' : 'Investigation history'}</div>
                    <ul className="space-y-1">
                      {invs.map((v, i) => (
                        <li key={i} className="text-sm text-foreground">
                          <span className="text-gold">{v.year_from}</span> · {v.title}
                          {v.source_institution && <div className="text-[11px] text-muted-foreground">{v.source_institution}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Källkritisk claim-liggare: varje uppgift med status + inline-fotnot [n] → referenslistan. */}
            {claims.length > 0 && (
              <section className="mt-8 max-w-3xl">
                <h2 className="mb-1 text-lg font-semibold text-foreground">{sv ? 'Uppgifter & källkritik' : 'Data & source criticism'}</h2>
                <p className="mb-3 text-xs text-muted-foreground">{sv ? 'Varje uppgift bär en status och en fotnot [n] till källan i listan nedan. Omtvistade läsningar fryses aldrig till fakta.' : 'Each statement carries a status and a footnote [n] to the source in the list below.'}</p>
                <ul className="space-y-2">
                  {claims.map((c, i) => {
                    const st = CLAIM_STATUS[(c.verification_status || '').toLowerCase()];
                    const n = c.source_id ? refNo.get(c.source_id) : undefined;
                    return (
                      <li key={i} className="text-sm leading-relaxed">
                        <span className="text-foreground">{c.statement || c.value_text || c.attribute}</span>
                        {st && <span className={`ml-2 whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] ${st.cls}`}>{sv ? st.sv : st.en}</span>}
                        {n && <a href={`#ref-${n}`} className="ml-1 align-super text-[11px] text-gold hover:underline">[{n}]</a>}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Källor & referenser SIST på sidan (Wikipedia-modell), med ankare #ref-n för fotnoterna. */}
            <ReferenceList sources={refs} sv={sv} note={sv ? 'Källor som citeras i borgens uppgifter ovan. Externa länkar öppnas i ny flik och är inte granskade av oss.' : 'Sources cited in this fort’s data above. External links open in a new tab and are not vetted by us.'} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FortressDetail;
