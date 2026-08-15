import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, FlaskConical, Info, Compass, Anchor, ScrollText, Coins as CoinsIcon, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { MapLegend } from '@/components/map/MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { useAdminBoundary } from '@/hooks/useAdminBoundary';
import { drawAdminBoundary } from '@/utils/map/adminBoundary';
import { KalmarsundCrossing } from '@/components/kalmar/KalmarsundCrossing';
import { CharterKgSection } from '@/components/medeltidsbrev/CharterKgSection';
import { createPlaceMedallion, featureIcon } from '@/utils/map/placeMarker';

// Kalmar som KG-nod (entity_registry entity_type='town'). Fas 1 charter-länkning hänger på detta UUID.
const KALMAR_TOWN_ID = '2fc2c410-08e5-4736-9845-fe0450151928';

// /sv/kalmar — forskningshubb för det tidiga/medeltida Kalmar i Möre. Binder ihop:
//  - Ortnamnsforskningen kring Hossmo (husaby-nukleusen, SOL 2003, kalmar_place_names)
//  - Den medeltida staden (stadsmuren → /sv/kalmar-stadsmur, hamnen Kättilen, äldsta breven)
//  - Fynden (coins: Äspelund-medaljongen, Varvsholmen-denarerna m.fl.)
// Hederlighetsprincip (Daniel: "man får inte hitta på"): per ortnamn flaggas om SOL behandlar
// exakt orten (locality), bara elementet (element) eller inte alls (none). Koord bara där de kan
// beläggas (Hossmo = kyrkan/Fornsök, Grimskär = rutt-verifierad); resten geokodas som eget steg.

interface PlaceName {
  id: string; name: string; category: string; sol_headword: string | null;
  sol_match: string; sol_note: string | null; element_reading: string | null;
  interpretation: string | null; lat: number | null; lng: number | null; source: string | null;
  gazetteer_match: boolean; coord_precision: string | null;
  head_element: string | null; semantic_domain: string | null; period_stratum: string | null;
}
interface PlaceForm { place_name: string; attested_form: string; attested_year: number | null; form_kind: string | null; source: string; verified: boolean; dialect_note: string | null; }
interface Harbor { name: string; harbor_type: string | null; lat: number | null; lng: number | null; description: string | null; }
interface Coin { name: string; metal: string | null; find_place: string | null; coordinates: { x: number; y: number } | string | null; significance: string | null; }

// coins.coordinates är Postgres 'point' → postgREST ger strängen "(x,y)" i browsern (pg ger {x,y}).
// Tål båda formerna. Point = (x=lng, y=lat).
const parsePoint = (v: Coin['coordinates']): { x: number; y: number } | null => {
  if (!v) return null;
  if (typeof v === 'object') {
    const x = Number((v as { x: unknown }).x), y = Number((v as { y: unknown }).y);
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  }
  const m = String(v).match(/\(?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)?/);
  return m ? { x: +m[1], y: +m[2] } : null;
};
interface Ev { event_name: string; year_start: number | null; description: string | null; location_status: string | null; }
// D. Larssons källkritiska fältkorpus (medeltidshamnen, Dragvik, Högås, grund, vägar,
// avrättningsplatser). Samma tabell som /sv/kalmar/medeltid ritar — här som togglebart lager.
interface FieldFeat { name: string; feature_type: string; time_layer: string | null; lat: number | null; lng: number | null; route_group: string | null; seq: number | null; note: string | null; }

const CAT_LABEL: Record<string, string> = {
  husaby: 'Husaby', by_administrativt: 'Administrativ by', by: 'By', torp: 'Torp',
  'ö': 'Ö', skär_grund: 'Skär/grund', terräng: 'Terräng', vattendrag: 'Vattendrag',
  'lösa': 'Lösa-namn', socken: 'Socken/kyrkby',
};
// Semantiska fält (sidoordnat per område) + periodskikt (namnledskronologin = "kontoplanen")
const DOMAIN_LABEL: Record<string, string> = {
  krig: 'Krig', 'rätt': 'Rätt/ting', hantverk: 'Hantverk', makt_administration: 'Makt/adm.',
  jordbruk: 'Jordbruk', natur_växt: 'Natur/växt', 'träslag': 'Träslag', terräng_sten: 'Terräng/sten',
  bebyggelse: 'Bebyggelse', personnamn: 'Personnamn', vatten_kust: 'Vatten/kust', kult: 'Kult', 'okänd': 'Okänd',
};
const STRATUM_META: Record<string, { color: string; label: string }> = {
  'järnålder': { color: '#f472b6', label: 'Järnålder / vendeltid' },
  vikingatid: { color: '#f59e0b', label: 'Vikingatid' },
  tidig_medeltid: { color: '#fbbf24', label: 'Tidig medeltid' },
  medeltid: { color: '#a3e635', label: 'Medeltid' },
  efterreformatorisk: { color: '#38bdf8', label: 'Efterreformatorisk (nyare tid)' },
  'okänd': { color: '#94a3b8', label: 'Okänt skikt' },
};
// Kronologisk ordning för den periodgrupperade vyn (vendel → nutid).
const STRATUM_ORDER = ['järnålder', 'vikingatid', 'tidig_medeltid', 'medeltid', 'efterreformatorisk', 'okänd'];
const MATCH_META: Record<string, { color: string; label: string }> = {
  locality: { color: '#22c55e', label: 'SOL: orten belagd' },
  element: { color: '#eab308', label: 'SOL: bara elementet (annan ort)' },
  none: { color: '#94a3b8', label: 'Ej i SOL — endast ledanalys' },
};
const METAL_COLOR: Record<string, string> = { guld: '#f4c430', silver: '#c0c0c0', brons: '#cd7f32', koppar: '#b87333' };

// Precisions-tier = hederlighetsaxeln (inte en gate). Forskaren avgör och kan flytta allt.
const PRECISION_META: Record<string, { color: string; label: string; solid: boolean }> = {
  fornsök: { color: '#22c55e', label: 'RAÄ Fornsök', solid: true },
  register: { color: '#22c55e', label: 'Ortregister (place_names)', solid: true },
  rutt: { color: '#22c55e', label: 'Rutt-verifierad', solid: true },
  'approx-osm': { color: '#eab308', label: 'OSM (approx)', solid: false },
  placeholder: { color: '#94a3b8', label: 'Placeholder — positioneras', solid: false },
};
const precMeta = (p: string | null) => PRECISION_META[p ?? ''] ?? { color: '#94a3b8', label: p ?? '—', solid: false };

// Egen karta över Kalmar-noden. Visar bara objekt med belagd koordinat (Hossmo kyrka, Grimskär,
// hamnen Kättilen, myntfynden). Ortnamn utan koord listas nedan, ej på kartan (geokodning pending).
const KalmarMap: React.FC<{ places: PlaceName[]; harbor: Harbor | null; coins: Coin[]; canEdit: boolean; onMove: (id: string, lat: number, lng: number) => void }> = ({ places, harbor, coins, canEdit, onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const placesG = useRef<L.LayerGroup>(L.layerGroup());
  const harborG = useRef<L.LayerGroup>(L.layerGroup());
  const coinsG = useRef<L.LayerGroup>(L.layerGroup());
  const wallRef = useRef<L.LayerGroup | null>(null);
  const [wallReady, setWallReady] = useState(false);
  const heritageG = useRef<L.LayerGroup>(L.layerGroup());
  const [heritageReady, setHeritageReady] = useState(false);
  const fieldG = useRef<L.LayerGroup>(L.layerGroup());
  const [fieldReady, setFieldReady] = useState(false);
  const agesG = useRef<L.LayerGroup>(L.layerGroup());
  const [agesReady, setAgesReady] = useState(false);
  const adminRef = useRef<L.LayerGroup>(L.layerGroup());
  const fittedRef = useRef(false);
  const [shoreYear, setShoreYear] = useState<number | null>(950);
  // Kalmar använder den finupplösta DEM-modellen (Copernicus GLO-30 + paleo_rsl),
  // inte SGU:s grova/statiska raster. Bbox regionavgränsar så Mälaren-lagret inte dras hit.
  const { status: shoreStatus } = useShorelineOverlay(mapRef, shoreYear, 'get_paleo_shorelines_dem', [16.18, 56.55, 16.46, 56.72]);
  // Alla Sveriges kommungränser (Lantmäteri, © Lantmäteriet), förenklade ~200 m. Se Öland-sidan.
  const { data: adminBoundary = [] } = useAdminBoundary('kommun', null, 0.002);

  // Återanvändbar legend: tematiska lager + baskarta. Cap/seed sköts av useMapLegendState.
  const LEGEND: LegendLayerDef[] = [
    { key: 'ortnamn', label: 'Ortnamn', color: '#a78bfa', defaultOn: true },
    { key: 'hamn', label: 'Hamn (Kättilen)', color: '#38bdf8', defaultOn: true },
    { key: 'mynt', label: 'Myntfynd', color: '#f4c430', defaultOn: true },
    { key: 'stadsmur', label: 'Stadsmur (~1400)', color: '#22c55e', defaultOn: true },
    { key: 'kulturarv', label: 'Sevärt & kulturarv', color: '#f472b6', defaultOn: true },
    { key: 'faltdata', label: 'Fältdata (medeltid)', color: '#d4a63c', defaultOn: true },
    { key: 'ages', label: 'AGES-grävningar (gamla stan, CC BY)', color: '#e11d48', defaultOn: false },
    { key: 'admin', label: 'Kommungränser', color: '#0ea5e9', defaultOn: true },
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap', defaultOn: true },
  ];
  const { enabled, toggle } = useMapLegendState(LEGEND);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [56.66, 16.34], zoom: 11, scrollWheelZoom: true });
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 });
    tileRef.current.addTo(map); // baskartan på direkt (default på) — undvik tomrender innan toggle-effekten
    adminRef.current.addTo(map);
    mapRef.current = map;
    setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, 120);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Baskarta (OSM) på/av via legenden.
  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  // Kommungränser (Lantmäteri, © Lantmäteriet) — konturlager, default på.
  useEffect(() => {
    const g = adminRef.current; if (!g) return;
    g.clearLayers();
    if (!enabled.admin) return;
    drawAdminBoundary(g, adminBoundary, { color: '#0ea5e9', weight: 2 });
  }, [enabled.admin, adminBoundary]);

  // Bygg lager-innehållet i EGNA grupper (togglas separat av legenden) + fit en gång.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts: [number, number][] = [];

    placesG.current.clearLayers();
    places.filter((p) => p.lat != null && p.lng != null && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))).forEach((p) => {
      const husaby = p.category === 'husaby';
      const pm = precMeta(p.coord_precision);
      const color = husaby ? '#f59e0b' : pm.solid ? '#a78bfa' : pm.color;
      pts.push([p.lat!, p.lng!]);
      const popupHtml = `<b>${p.name}</b> <span style="font-size:10px;color:#888">${CAT_LABEL[p.category] ?? p.category}</span><br/><span style="font-size:11px">${p.element_reading ?? ''}</span>${p.interpretation && p.interpretation !== '—' ? `<br/><span style="font-size:11px;color:#666">${p.interpretation}</span>` : ''}<br/><span style="font-size:10px;color:${pm.color}">◉ ${pm.label}</span>${canEdit ? '<br/><span style="font-size:10px;color:#38bdf8">✎ dra för att flytta → sparas som "forskare"</span>' : ''}`;
      if (canEdit) {
        // Redigeringsläge: dragbar markör som sparar exakt läge (precision 'forskare').
        const sz = husaby ? 18 : 14;
        const icon = L.divIcon({ className: '', iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
          html: `<span style="display:block;width:${sz}px;height:${sz}px;border-radius:9999px;background:${color};border:2px solid #0b1220;box-shadow:0 0 5px ${color};cursor:grab"></span>` });
        L.marker([p.lat!, p.lng!], { draggable: true, icon, autoPan: true })
          .bindTooltip(p.name, { direction: 'top', offset: [0, -sz / 2], className: 'ang-clabel' })
          .bindPopup(popupHtml)
          .on('dragend', (ev: L.LeafletEvent) => {
            const ll = (ev.target as L.Marker).getLatLng();
            onMove(p.id, +ll.lat.toFixed(6), +ll.lng.toFixed(6));
          })
          .addTo(placesG.current);
      } else {
        L.circleMarker([p.lat!, p.lng!], {
          radius: husaby ? 9 : 6, color, weight: 2, fillColor: color,
          fillOpacity: husaby ? 0.35 : pm.solid ? 0.65 : 0.2,
          dashArray: pm.solid ? undefined : '3 4', // approx/placeholder = streckad ring
        })
          .bindTooltip(p.name, { permanent: husaby, direction: 'top', offset: [0, -8], className: 'ang-clabel' })
          .bindPopup(popupHtml)
          .addTo(placesG.current);
      }
    });

    harborG.current.clearLayers();
    if (harbor && harbor.lat != null && harbor.lng != null && Number.isFinite(Number(harbor.lat)) && Number.isFinite(Number(harbor.lng))) {
      pts.push([harbor.lat, harbor.lng]);
      L.circleMarker([harbor.lat, harbor.lng], { radius: 7, color: '#38bdf8', weight: 2, fillColor: '#38bdf8', fillOpacity: 0.5 })
        .bindTooltip(harbor.name, { direction: 'top', offset: [0, -8] })
        .bindPopup(`<b>${harbor.name}</b><br/><span style="font-size:11px">${harbor.harbor_type ?? ''}</span>${harbor.description ? `<br/><span style="font-size:11px;color:#666">${harbor.description}</span>` : ''}`)
        .addTo(harborG.current);
    }

    coinsG.current.clearLayers();
    coins.map((c) => ({ c, pt: parsePoint(c.coordinates) })).filter((x) => x.pt).forEach(({ c, pt }) => {
      const color = METAL_COLOR[(c.metal ?? '').toLowerCase()] ?? '#e5e7eb';
      const cy = pt!.y, cx = pt!.x;
      pts.push([cy, cx]);
      L.circleMarker([cy, cx], { radius: 6, color, weight: 2, fillColor: color, fillOpacity: 0.7 })
        .bindPopup(`<b>${c.name}</b><br/><span style="font-size:11px;color:#666">${c.find_place ?? ''}</span>${c.significance ? `<br/><span style="font-size:11px">${c.significance}</span>` : ''}`)
        .addTo(coinsG.current);
    });

    // Fit bara första gången — annars hoppar kartan vid varje sparad flytt.
    if (pts.length && !fittedRef.current) { map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 12 }); fittedRef.current = true; }
  }, [places, harbor, coins, canEdit, onMove]);

  // Toggla lager-grupperna enligt legenden (ortnamn/hamn/mynt/stadsmur).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pairs: [boolean, L.LayerGroup | null][] = [
      [enabled.ortnamn, placesG.current],
      [enabled.hamn, harborG.current],
      [enabled.mynt, coinsG.current],
      [enabled.stadsmur, wallRef.current],
      [enabled.kulturarv, heritageG.current],
      [enabled.faltdata, fieldG.current],
      [enabled.ages, agesG.current],
    ];
    for (const [on, g] of pairs) {
      if (!g) continue;
      if (on) { if (!map.hasLayer(g)) map.addLayer(g); }
      else if (map.hasLayer(g)) map.removeLayer(g);
    }
  }, [enabled.ortnamn, enabled.hamn, enabled.mynt, enabled.stadsmur, enabled.kulturarv, enabled.faltdata, enabled.ages, places, harbor, coins, wallReady, heritageReady, fieldReady, agesReady]);

  // AGES-grävningar (Swedigarch/Uppsala univ., CC BY 4.0) — nedladdade GPKG:er (Kalmar gamla stad)
  // omprojicerade SWEREF99TM→WGS84 → public/data/kalmar-ages.geojson. Byggs en gång, togglas via legenden.
  useEffect(() => {
    let alive = true;
    fetch('/data/kalmar-ages.geojson').then((r) => (r.ok ? r.json() : null)).then((gj) => {
      if (!alive || !gj) return;
      agesG.current.clearLayers();
      L.geoJSON(gj, {
        style: { color: '#e11d48', weight: 1, fillColor: '#e11d48', fillOpacity: 0.2 },
        pointToLayer: (_f, latlng) => L.circleMarker(latlng, { radius: 3, color: '#e11d48', weight: 1, fillOpacity: 0.6 }),
        onEachFeature: (f, layer) => layer.bindPopup(`<b>Arkeologisk grävning (AGES)</b><br/>Uppdrag: ${f.properties?.uppdrag ?? '—'}<br/><span style="font-size:11px">Swedigarch / Uppsala universitet · CC BY 4.0</span>`),
      }).addTo(agesG.current);
      setAgesReady((v) => !v);
    }).catch(() => { /* noop */ });
    return () => { alive = false; };
  }, []);

  // Medeltida stadsmuren (fort_at-RPC, evidensklass-färgad) — samma data som /sv/kalmar-stadsmur,
  // ritad vid ~1400 (peak medeltid). Eget togglebart lager (wallRef deklareras i ref-blocket ovan).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase.rpc as unknown as (fn: string, a: Record<string, unknown>) => Promise<{ data: { features: any[] } | null; error: unknown }>)(
        'fort_at', { p_year: 1400, p_site: 'Kalmar gamla stad', p_min_certainty: 0.01 });
      if (cancelled || error || !data?.features?.length || !mapRef.current) return;
      if (wallRef.current) { try { map.removeLayer(wallRef.current); } catch { /* noop */ } }
      const grp = L.layerGroup();
      const EV: Record<string, { color: string; dash?: string }> = {
        uppmatt: { color: '#22c55e' }, gravd_punkt: { color: '#14b8a6' }, bevarat_ovan_mark: { color: '#16a34a' },
        interpolerad: { color: '#eab308', dash: '8 6' }, hypotetisk: { color: '#94a3b8', dash: '2 8' },
      };
      for (const f of data.features) {
        const p = f.properties || {};
        const ev = EV[p.evidence_class ?? ''] ?? EV.hypotetisk;
        const opacity = 0.25 + 0.75 * (p.certainty ?? 1);
        L.geoJSON(f.geometry, {
          style: { color: ev.color, weight: 3, opacity, dashArray: ev.dash },
          pointToLayer: (_ft, ll) => L.circleMarker(ll, { radius: 5, color: '#1c1917', weight: 1, fillColor: ev.color, fillOpacity: opacity }),
        }).bindPopup(`<b>${p.name ?? 'Stadsmur'}</b> <span style="font-size:10px;color:#888">medeltida stadsmur (~1400)</span>${p.span ? `<br/><span style="font-size:11px;color:#666">${p.span}</span>` : ''}`).addTo(grp);
      }
      wallRef.current = grp;
      setWallReady((v) => !v); // trigga toggle-effekten så muren läggs på enligt legenden
    })();
    return () => { cancelled = true; };
  }, []);

  // Sevärt & kulturarv — kurerade heritage_sites i Kalmar (Gamla stan + Kvarnholmen + sundet):
  // judiska begravningsplatsen, synagogorna, S:t Nicolai/Bykyrkan, gamla Stortorget, rådhuset,
  // Grimskärs skans, Skansgrundet, slottet, domkyrkan. Bbox + raa_type-filter (ej hela FMIS-floden).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase.from('heritage_sites') as unknown as { select: (c: string) => any })
        .select('name,raa_type,lat,lng,description')
        .gte('lat', 56.62).lte('lat', 56.70).gte('lng', 16.33).lte('lng', 16.42)
        // OBS: 'kyrka' UTESLUTS avsiktligt — heritage_sites 'kyrka' i Kalmar-bbox:en är moderna byggnader
        // (Vasakyrkan, Västerportkyrkan, Heliga Korsets, Sankta Birgitta, domkyrkan 1600-tal) och hör inte
        // hemma på en medeltida/historisk karta. Medeltida S:t Nicolai/Bykyrkan behålls via 'kyrkogård'.
        // Vill man visa domkyrkan som (post)medeltida landmärke får den kureras in separat.
        .in('raa_type', ['Begravningsplats', 'Synagoga', 'Fästning/skans', 'Rådhus', 'Torg', 'kyrkogård', 'Borg/slottslämning', 'Grund/sjömärke']);
      if (cancelled || !data || !mapRef.current) return;
      heritageG.current.clearLayers();
      (data as { name: string; raa_type: string; lat: number | null; lng: number | null; description: string | null }[])
        .filter((h) => h.lat != null && h.lng != null)
        .forEach((h) => {
          const d = (h.description ?? '').slice(0, 240);
          // Medaljong: färgen bär lagret (kulturarv = rosa, matchar legenden), FORMEN (featureIcon)
          // bär typen (begravningsplats/fästning/torg…) → typerna skiljs på form, ej bara färg (WCAG 1.4.1).
          L.marker([h.lat!, h.lng!], { icon: createPlaceMedallion({ color: '#f472b6', icon: featureIcon(h.raa_type), label: h.name, prominent: false, hairline: true, size: 22 }) })
            .bindPopup(`<b>${h.name}</b> <span style="font-size:10px;color:#888">${h.raa_type}</span>${d ? `<br/><span style="font-size:11px;color:#666">${d}${(h.description ?? '').length > 240 ? '…' : ''}</span>` : ''}`)
            .addTo(heritageG.current);
        });
      setHeritageReady((v) => !v); // trigga toggle-effekten så lagret läggs på enligt legenden
    })();
    return () => { cancelled = true; };
  }, []);

  // Fältdata (medeltid) — D. Larssons källkritiska fältkorpus (kalmar_field_features): samma
  // objekt som /sv/kalmar/medeltid ritar (medeltidshamnen, Dragvik, Högås, grund i sundet,
  // vägar/drag, avrättningsplatser). Punkter = medaljong (formen bär feature_type), linjära
  // features (route_group satt) = polyline ordnad på seq så vägarna/dragen syns. Eget lager.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase.from('kalmar_field_features') as unknown as { select: (c: string) => any })
        .select('name,feature_type,time_layer,lat,lng,route_group,seq,note');
      if (cancelled || !data || !mapRef.current) return;
      fieldG.current.clearLayers();
      const feats = (data as FieldFeat[]).filter((f) => f.lat != null && f.lng != null);

      // Linjära features (route_group) → EN stilad polyline per grupp, ordnad på seq. Stilen bär
      // typen (gata/väg/befästning/drag) så det inte blir en enda grov guldklump. Runda hörn/ändar
      // (lineCap/Join 'round') tar bort det "blaffiga" kantiga utseendet.
      const LINE_STYLE: Record<string, { color: string; weight: number; dash?: string }> = {
        street: { color: '#d4a63c', weight: 3 },               // medeltida gator (stadskärnan)
        road: { color: '#b5651d', weight: 4 },                 // väg (åsväg/Kungsgatan/Södra vägen, Ölandsleden)
        fortification: { color: '#8b5cf6', weight: 4 },        // 1600-talsbefästningen (Kvarnholmen)
        portage: { color: '#38bdf8', weight: 3, dash: '6 6' }, // båtdrag (vattenpassage)
      };
      const GROUP_LABEL: Record<string, string> = {
        esker_road: 'Åsvägen – Kungsgatan/Södra vägen (vägen söderut)',
        olandsleden: 'Ölandsleden (modern)',
        kvarnholmen_befast: 'Kvarnholmens befästning (1600-tal)',
        medeltidshamn_area: 'Medeltida hamnområdet',
        osterlanggatan: 'Österlånggatan (medeltida)',
        vasterlanggatan: 'Västerlånggatan (medeltida)',
        spikgatan: 'Spikgatan (1600-tal)',
        stenso_drag: 'Båtdraget över Stensö-halvön',
      };
      const byGroup = new Map<string, FieldFeat[]>();
      feats.forEach((f) => {
        if (!f.route_group) return;
        const arr = byGroup.get(f.route_group) ?? [];
        arr.push(f); byGroup.set(f.route_group, arr);
      });
      byGroup.forEach((arr, group) => {
        const sorted = [...arr].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
        if (sorted.length < 2) return;
        const st = LINE_STYLE[sorted[0].feature_type] ?? { color: '#d4a63c', weight: 3 };
        const label = GROUP_LABEL[group] ?? sorted[0].name;
        const latlngs = sorted.map((f) => [f.lat!, f.lng!] as [number, number]);
        // Båtdraget (Dragvik/Stensö) var en tunn dashad linje som "inte syntes" (Daniel). Ge draget en
        // vit casing + kraftigare linje + PERMANENT etikett så det hittas trots att det är ~1 km kort.
        const isPortage = sorted[0].feature_type === 'portage';
        if (isPortage) {
          L.polyline(latlngs, { color: '#ffffff', weight: (st.weight ?? 3) + 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(fieldG.current);
        }
        L.polyline(latlngs, {
          color: st.color, weight: isPortage ? (st.weight ?? 3) + 2 : st.weight, opacity: 0.95, dashArray: st.dash, lineCap: 'round', lineJoin: 'round',
        })
          .bindTooltip(isPortage ? `⛵ ${label}` : label, { sticky: !isPortage, permanent: isPortage, direction: 'top', className: 'ang-clabel' })
          .bindPopup(`<b>${label}</b>`)
          .addTo(fieldG.current);
      });

      // Endast FRISTÅENDE punkter (utan route_group) → LÄTT cirkelmarkör (inte tung mörk medaljong,
      // som blir "svarta plumpar" i tät fältdata). Färgen bär feature_type; tunn vit kant för läsbarhet.
      // Linjevertexerna ritas som linjen ovan, inte som varsin markör.
      const POINT_COLOR: Record<string, string> = {
        harbor: '#3f8194', quay: '#3f8194', channel: '#38bdf8', shoal: '#5aa0b4', portage: '#38bdf8',
        island: '#6b8f71', headland: '#8a9078',
        castle: '#a9762f', fortification: '#8b5cf6', estate: '#9a7b3c',
        cemetery: '#7c8577', chapel: '#7b3f00', square: '#a07d34', locality: '#8a7f6a',
      };
      feats.filter((f) => !f.route_group).forEach((f) => {
        const col = POINT_COLOR[f.feature_type] ?? '#9a7b3c';
        const d = (f.note ?? '').slice(0, 240);
        L.circleMarker([f.lat!, f.lng!], { radius: 5, color: '#ffffff', weight: 1.5, fillColor: col, fillOpacity: 0.9 })
          .bindTooltip(f.name, { direction: 'top', offset: [0, -4], className: 'ang-clabel' })
          .bindPopup(`<b>${f.name}</b> <span style="font-size:10px;color:#888">${f.feature_type}${f.time_layer ? ` · ${f.time_layer}` : ''}</span>${d ? `<br/><span style="font-size:11px;color:#666">${d}${(f.note ?? '').length > 240 ? '…' : ''}</span>` : ''}`)
          .addTo(fieldG.current);
      });
      setFieldReady((v) => !v); // trigga toggle-effekten så lagret läggs på enligt legenden
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="hidden sm:block">
        <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} noData={shoreStatus === 'no-data'} />
      </div>
      <div className="relative">
        {/* Mobil: flytande strandlinje-kontroll (frigör kartytan) — inline på desktop ovan. */}
        <div className="sm:hidden absolute left-2 top-16 z-[1105]">
          <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" noData={shoreStatus === 'no-data'} />
        </div>
        <div ref={containerRef} className="w-full h-[460px] rounded-lg overflow-hidden border border-border" style={{ minHeight: 460 }} />
        <MapLegend defs={LEGEND} enabled={enabled} onToggle={toggle} mapRef={mapRef} />
      </div>
    </div>
  );
};

const NameRow: React.FC<{ n: PlaceName; forms?: PlaceForm[] }> = ({ n, forms = [] }) => {
  const m = MATCH_META[n.sol_match] ?? MATCH_META.none;
  const pm = precMeta(n.coord_precision);
  const strat = n.period_stratum ? STRATUM_META[n.period_stratum] ?? STRATUM_META['okänd'] : null;
  return (
    <div className="py-2 border-b border-slate-800/60 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground font-medium text-sm">{n.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-300">{CAT_LABEL[n.category] ?? n.category}</span>
        {n.semantic_domain && n.semantic_domain !== 'okänd' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-200">{DOMAIN_LABEL[n.semantic_domain] ?? n.semantic_domain}</span>
        )}
        {strat && <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: strat.color + '22', color: strat.color }}>{strat.label}</Badge>}
        <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: m.color + '22', color: m.color }}>{m.label}</Badge>
        <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: pm.color + '22', color: pm.color }}>◉ {pm.label}</Badge>
      </div>
      {n.head_element && <p className="text-xs text-foreground/70 mt-1">Led: <strong>{n.head_element}</strong> — {n.element_reading}</p>}
      {n.sol_note && <p className="text-xs text-muted-foreground mt-0.5"><strong>SOL:</strong> {n.sol_note}</p>}
      {n.interpretation && n.interpretation !== '—' && <p className="text-xs text-muted-foreground mt-0.5 italic">{n.interpretation}</p>}
      {forms.length > 0 && (
        <p className="text-xs text-sky-300/90 mt-0.5">
          Belagda former: {forms.map((f) => `${f.attested_form}${f.attested_year ? ` (${f.attested_year})` : ''}${f.verified ? '' : ' *'}`).join(' · ')}
          <span className="text-muted-foreground"> {forms.some((f) => !f.verified) && '(* overifierad/lokalkännedom)'}</span>
        </p>
      )}
    </div>
  );
};

const Kalmar = () => {
  const [places, setPlaces] = useState<PlaceName[]>([]);
  const [harbor, setHarbor] = useState<Harbor | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [forms, setForms] = useState<PlaceForm[]>([]);
  const { canEdit } = useUserRole();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleMove = useCallback(async (id: string, lat: number, lng: number) => {
    const { error } = await (supabase.from('kalmar_place_names') as any)
      .update({ lat, lng, coord_precision: 'forskare' }).eq('id', id);
    if (error) { setSaveMsg('Kunde inte spara — saknar behörighet (editor/admin krävs).'); return; }
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, lat, lng, coord_precision: 'forskare' } : p)));
    const moved = places.find((p) => p.id === id);
    setSaveMsg(`Läge sparat ✓ ${moved ? moved.name : ''} → ${lat.toFixed(4)}, ${lng.toFixed(4)} (precision: forskare)`);
  }, [places]);

  useEffect(() => {
    (supabase.from('kalmar_place_names') as any).select('*').order('name')
      .then(({ data }: { data: PlaceName[] | null }) => setPlaces(data ?? []));
    (supabase.from('place_name_forms') as any).select('place_name,attested_form,attested_year,form_kind,source,verified,dialect_note')
      .then(({ data }: { data: PlaceForm[] | null }) => setForms(data ?? []));
    (supabase.from('harbors') as any).select('name,harbor_type,lat,lng,description').ilike('name', '%kättil%').maybeSingle()
      .then(({ data }: { data: Harbor | null }) => setHarbor(data));
    (supabase.from('coins') as any).select('name,metal,find_place,coordinates,significance')
      .or('find_place.ilike.%kalmar%,find_place.ilike.%skäggenäs%,find_place.ilike.%varvsholm%,find_place.ilike.%äspelund%')
      .then(({ data }: { data: Coin[] | null }) => setCoins(data ?? []));
    (supabase.from('historical_events') as any).select('event_name,year_start,description,location_status')
      .ilike('event_name', '%kalmar%').order('year_start')
      .then(({ data }: { data: Ev[] | null }) => setEvents(data ?? []));
  }, []);

  const sv = (a: PlaceName, b: PlaceName) => a.name.localeCompare(b.name, 'sv');
  const inReg = places.filter((p) => p.gazetteer_match).sort(sv);
  const notReg = places.filter((p) => !p.gazetteer_match).sort(sv);
  const geocoded = places.filter((p) => p.lat != null).length;
  const solLocality = places.filter((p) => p.sol_match === 'locality').length;
  const formsFor = (name: string) => forms.filter((f) => f.place_name === name);
  const needGeotag = places
    .filter((p) => p.coord_precision === 'approx-osm' || p.coord_precision === 'placeholder')
    .sort((a, b) => (a.coord_precision === 'placeholder' ? 0 : 1) - (b.coord_precision === 'placeholder' ? 0 : 1) || a.name.localeCompare(b.name, 'sv'));

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Kalmar — från Hossmo husaby till gränsstaden"
        titleEn="Kalmar — from the Hossmo husaby to the border town"
        description="Forskningssida om det tidiga och medeltida Kalmar i Möre: ortnamnsklustret kring Hossmo husaby, stadsmuren, hamnen Kättilen, de äldsta breven och fynden. Källförd (SOL 2003, RAÄ Fornsök), med redovisade osäkerheter."
        descriptionEn="Research page on early and medieval Kalmar in Möre: the place-name cluster around the Hossmo husaby, the town wall, the Kättilen harbour, the oldest charters and the finds."
        keywords="Kalmar, Hossmo, husaby, Möre, Rinkaby, ortnamn, Svenskt ortnamnslexikon, stadsmur, Kättilen, medeltid, vikingatid"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Crown className="h-8 w-8 text-gold" />
            Kalmar — från Hossmo husaby till gränsstaden
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Maktens rötter i Möre, före staden vid slottet</p>
          <p className="text-muted-foreground text-lg">
            Innan Kalmar blev rikets gränsstad låg Möres maktcentrum längre in, vid{' '}
            <strong>Ljungbyåns mynning</strong>. Ortnamnen pekar ut det: <strong>Hossmo</strong> — enligt
            Svenskt ortnamnslexikon <em>*Husa</em> ('husaby') + <em>mo</em> — är i sig ett husaby-namn, ett
            kungligt/administrativt gods, med <strong>Rinkabys</strong> hirdmän intill. Kring den noden restes
            en av Sveriges äldsta stenkyrkor (Hossmo rundkyrka, ca 1120). Sidan binder ihop den
            ortnamnsforskningen med den senare medeltida staden: <strong>muren</strong>, <strong>hamnen</strong>,
            de äldsta <strong>breven</strong> och <strong>fynden</strong>.
          </p>
        </div>

        {/* KARTA */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><MapPin className="h-5 w-5" /> Kalmar-noden på kartan</CardTitle>
          </CardHeader>
          <CardContent>
            {canEdit && (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-sky-700/50 bg-sky-950/30 px-3 py-2 text-xs text-sky-200">
                <span className="font-semibold">✎ Redigeringsläge (forskare)</span>
                <span className="opacity-80">— dra en markör till rätt läge, det sparas direkt (precision blir "forskare").</span>
                {saveMsg && <span className="ml-auto text-emerald-300">{saveMsg}</span>}
              </div>
            )}
            <KalmarMap places={places} harbor={harbor} coins={coins} canEdit={canEdit} onMove={handleMove} />
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              <strong>Guld</strong> = Hossmo husaby. <strong>Lila (heldragen)</strong> = verifierad koord (register/Fornsök/rutt).
              <strong> Gul/grå (streckad ring)</strong> = approx (OSM) resp. placeholder — <em>positioneras av dig</em>.
              <strong> Blå</strong> = hamnen Kättilen. <strong>Metallfärg</strong> = myntfynd. Alla {geocoded} av {places.length} ortnamn
              är nu utsatta; klicka för precision-källa.
            </p>
          </CardContent>
        </Card>

        {/* ORTNAMN EFTER TIDSSKIKT — periodgrupperad vy (vendel → nutid) */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Ortnamnen efter tidsskikt</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p className="text-xs opacity-80">
              Namnleden är tidsmarkörer. Grupperade efter <strong>periodskikt</strong> (järnålder/vendeltid → nyare tid)
              framträder <em>vad varje epok satte spår i</em> — det semantiska fältet (i grått) visar handlingen:
              krig, rätt, hantverk, jordbruk, kust, kult…
            </p>
            {STRATUM_ORDER.map((key) => {
              const inStratum = places.filter((p) => (p.period_stratum ?? 'okänd') === key).sort(sv);
              if (inStratum.length === 0) return null;
              const meta = STRATUM_META[key];
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[11px]" style={{ backgroundColor: meta.color + '22', color: meta.color }}>{meta.label}</Badge>
                    <span className="text-xs text-muted-foreground">{inStratum.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {inStratum.map((n) => {
                      const dom = n.semantic_domain && n.semantic_domain !== 'okänd' ? (DOMAIN_LABEL[n.semantic_domain] ?? n.semantic_domain) : null;
                      return (
                        <span key={n.id} className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs" style={{ borderColor: meta.color + '55' }}>
                          <span className="text-foreground">{n.name}</span>
                          {dom && <span className="text-[10px] text-muted-foreground">{dom}</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ORTNAMN — husaby-nukleusen */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><ScrollText className="h-5 w-5" /> Ortnamnen kring Hossmo ({places.length})</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p className="text-xs opacity-80">
              Grupperade efter <strong>ortregistret</strong> (Lantmäteriets gazetteer <code>place_names</code>). Varje namn är
              kodat i det onomastiska ramverket: <strong>semantiskt fält</strong> (krig/rätt/hantverk…, som en områdes-kontoplan)
              och <strong>periodskikt</strong> ur namnledskronologin (järnålder → efterreformatorisk). Plus <strong>SOL-belägg</strong>
              (grönt = orten belagd, gult = bara elementet, grått = ej i SOL) och <strong>koord-precision</strong>. Där belagda
              äldre former finns visas de (huvudboken). Kodningen är standardläsning (kronologi + SOL 2003) — <strong>du kan ändra den</strong>.
            </p>
            <div>
              <div className="text-xs font-semibold text-emerald-300 mb-1">I ortregistret ({inReg.length})</div>
              {inReg.map((n) => <NameRow key={n.id} n={n} forms={formsFor(n.name)} />)}
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 mb-1">Saknas i ortregistret ({notReg.length}) — skär &amp; små torp, geokodade approx/placeholder</div>
              {notReg.map((n) => <NameRow key={n.id} n={n} forms={formsFor(n.name)} />)}
            </div>
          </CardContent>
        </Card>

        {/* GEOTAG-ARBETSLISTA — vilka namn som inte blivit färdig-geotaggade (forskaren positionerar) */}
        {needGeotag.length > 0 && (
          <Card className="viking-card mb-4 border-amber-600/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-300"><MapPin className="h-5 w-5" /> Ej färdig-geotaggat ({needGeotag.length})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs opacity-80">Dessa har bara <strong>approximerad</strong> (OSM) eller <strong>placeholder</strong>-koordinat — de väntar på din positionering. Verifierade (register/Fornsök/rutt) visas inte här.</p>
              <div className="flex flex-wrap gap-2">
                {needGeotag.map((p) => {
                  const pm = precMeta(p.coord_precision);
                  return (
                    <span key={p.id} className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2 py-1 text-xs" style={{ color: pm.color }}>
                      <span style={{ width: 8, height: 8, borderRadius: 9999, background: pm.color, display: 'inline-block' }} />
                      {p.name}
                      <span className="text-[10px] text-muted-foreground">{p.coord_precision === 'placeholder' ? 'placeholder' : 'approx'}</span>
                    </span>
                  );
                })}
              </div>
              <p className="text-[11px] opacity-70">{canEdit ? 'Du är inloggad som forskare: dra markörerna i kartan ovan för att sätta exakt läge — det sparas direkt (precision "forskare") och namnet försvinner härifrån.' : 'Logga in som forskare (editor/admin) för att dra markörerna och spara exakta lägen direkt i kartan.'}</p>
            </CardContent>
          </Card>
        )}

        {/* DEN MEDELTIDA STADEN */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Crown className="h-5 w-5" /> Den medeltida staden</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <Link to="/sv/kalmar-stadsmur" className="block border-l-2 border-emerald-500 pl-3 py-1 hover:bg-slate-800/30 rounded-r transition-colors">
              <div className="text-foreground font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-400" /> Stadsmuren →</div>
              <div className="text-xs mt-0.5">Medeltida mur med tidsslider och evidensklass per segment (uppmätt/interpolerad/hypotetisk). Egen sida.</div>
            </Link>
            <Link to="/sv/kalmar/medeltid" className="block border-l-2 border-gold pl-3 py-1 hover:bg-slate-800/30 rounded-r transition-colors">
              <div className="text-foreground font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Medeltidskarta →</div>
              <div className="text-xs mt-0.5">Tidsskiktad karta: Gamla stans gator & hamn vid slottet, båtdraget över Stensö (Dragvik), Öland-överfarten (Ölandskajen–Färjestaden) och nya staden på Kvarnholmen. Mot medeltida strandlinje.</div>
            </Link>
            {harbor && (
              <div className="border-l-2 border-sky-500 pl-3 py-1">
                <div className="text-foreground font-medium flex items-center gap-2"><Anchor className="h-4 w-4 text-sky-400" /> {harbor.name}</div>
                <div className="text-xs mt-0.5">{harbor.description ?? harbor.harbor_type}</div>
              </div>
            )}
            {events.length > 0 && (
              <div className="border-l-2 border-amber-500 pl-3 py-1">
                <div className="text-foreground font-medium flex items-center gap-2"><ScrollText className="h-4 w-4 text-amber-400" /> Äldsta breven</div>
                {events.map((e) => (
                  <div key={e.event_name} className="text-xs mt-1">
                    <strong>{e.year_start}</strong> — {e.event_name}. {e.description}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MEDELTIDSBREV (SDHK KG-länkning, Fas 1) — utfärdade i Kalmar */}
        <Card className="viking-card mb-4">
          <CardContent className="pt-6">
            <CharterKgSection entityId={KALMAR_TOWN_ID} name="Kalmar" />
          </CardContent>
        </Card>

        {/* FYND */}
        {coins.length > 0 && (
          <Card className="viking-card mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-gold"><CoinsIcon className="h-5 w-5" /> Fynd i Kalmar-området ({coins.length})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {coins.map((c) => (
                <div key={c.name} className="border-b border-slate-800/60 last:border-0 py-1.5">
                  <div className="text-foreground font-medium text-sm flex items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: 9999, background: METAL_COLOR[(c.metal ?? '').toLowerCase()] ?? '#e5e7eb', display: 'inline-block' }} />
                    {c.name}
                  </div>
                  <div className="text-xs mt-0.5">{c.find_place}</div>
                  {c.significance && <div className="text-xs text-muted-foreground/80">{c.significance}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ORTNAMNET KALMAR — etymologi (belagt + hypotes) */}
        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold">
              <ScrollText className="h-5 w-5" /> Ortnamnet Kalmar — <em>kalm</em> + <em>mar</em>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Belagt (SOL / Wikipedia):</strong> Kalmar (fsv.{' '}
              <em>Kalmarnar</em>) innehåller <em>kalm</em> — sydsvenskt dialektord för 'stenröse,
              stenanhopning' — och <em>mar</em> 'grund vik'. Alltså{' '}
              <em>"den grunda viken vid stenrösena / den steniga marken"</em>. Traditionellt syftar
              viken på <strong>Kalmarsund</strong>.
            </p>
            <p>
              <strong className="text-amber-300">Hypotes (Daniel Larsson, under utredning):</strong>{' '}
              den avsedda <em>maren</em> kan vara en mer lokal vik än hela sundet. Kandidater:{' '}
              <strong>Västa sjön</strong>, <strong>Långviken</strong> eller <strong>Stensö</strong>{' '}
              (fiskläge + kanal — namnet bär självt <em>sten</em>). <em>Ej belagt</em>; namnen är ännu
              inte i ortregistret — nästa steg är att pröva dem mot SOL/Isof och strandförskjutningen.
            </p>
            <p>
              <strong className="text-foreground">Parallell:</strong> samma bildning återkommer i{' '}
              <strong>Kalmar socken, Håbo härad (Uppland)</strong> — en vik vid Mälaren (näset{' '}
              <em>Kalmarnäs</em>) med ~17 steniga lämningar (rösen/stensättningar) intill. Två Kalmar,
              samma recept: grund vik + stenig mark.
            </p>
          </CardContent>
        </Card>

        {/* STATUS */}
        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Status: belagt och pending</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Belagt:</strong> {solLocality} ortnamn behandlas direkt i SOL 2003 (bl.a. <em>Hossmo = *Husa + mo</em>, husaby-tolkningen). {inReg.length} finns i Lantmäteriets ortregister med register-koordinat. Hossmo rundkyrka (ca 1120) och hamnen Kättilen är källförda med koordinat (RAÄ Fornsök).</p>
            <p><strong className="text-amber-300">Tolkning, ej dom:</strong> att Hossmo-Rinkaby-noden var Möres maktcentrum <em>före</em> Kalmar är en välgrundad hypotes utifrån husaby-/rink-namnen — forskaren avgör.</p>
            <p><strong className="text-foreground">Koordinater ({geocoded}/{places.length}):</strong> alla utsatta, med precisions-flagga. Verifierade (register/Fornsök/rutt/forskare), OSM-approximerade och placeholder. <strong className="text-sky-300">Inloggad forskare (editor/admin) drar markörerna direkt i kartan</strong> — sparas som precision "forskare". Kvar: blodbadet 1505 och Kalmar-/Öland-släkterna.</p>
          </CardContent>
        </Card>

        {/* SÅ TESTAR DU */}
        <Card className="viking-card mb-4 border-sky-700/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-sky-300"><FlaskConical className="h-5 w-5" /> Så testar du materialet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Pröva noden rumsligt: öppna kartan, mät räckvidd från Hossmo och se vad som ligger inom gångavstånd (byar, gravfält, hamnen).</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Öppna <Link to="/explore?center=56.66,16.34&zoom=11" className="text-gold hover:underline">kartan (Utforska)</Link> — centrerad på Kalmar/Hossmo.</li>
              <li><strong>Högerklicka</strong> på Hossmo → <em>"Mät räckvidd härifrån"</em>, välj radie (t.ex. daglig maskvidd 9 km).</li>
              <li>Läs antalet objekt i formen och <strong>exportera</strong> till GeoJSON/CSV.</li>
            </ol>
            <div className="pt-1">
              <Link to="/explore?center=56.66,16.34&zoom=11" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
                <Compass className="h-4 w-4" /> Öppna kartan
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* ÖVERFART KALMARSUND — interaktiv driftmodell (hypotes, källbelagda ankarpunkter) */}
        <div className="mb-6">
          <KalmarsundCrossing />
        </div>

        <p className="text-xs text-muted-foreground mt-6 opacity-75 flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Källor: Svenskt ortnamnslexikon 2003 (SOL, diva2:1175717); RAÄ Fornsök (koordinater, kyrka); <em>Kalmar stads historia</em> 1. Data: <code>kalmar_place_names</code>, <code>harbors</code>, <code>coins</code>, <code>historical_events</code>. Metoden delar ledkatalog med <Link to="/sv/ortnamn" className="text-gold hover:underline">ortnamnssidan</Link>.</span>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Kalmar;
