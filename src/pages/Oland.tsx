import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { PageMeta } from '../components/PageMeta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChristianizationChart } from '@/components/ChristianizationChart';
import { OlandChristianizationTimeline } from '@/components/OlandChristianizationTimeline';
import { OlandChristianizationEpochs } from '@/components/OlandChristianizationEpochs';
import { ChurchConsolidationCard } from '@/components/placenames/ChurchConsolidationCard';
import { MapPin, Route, AlertTriangle, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOlandModel, type OlandPoint } from '@/hooks/useOlandModel';
import { useSolidi } from '@/hooks/useSolidi';
import { parseCoinCoord } from '@/hooks/useCoins';
import { supabase } from '@/integrations/supabase/client';
import { useShorelineOverlay } from '@/hooks/useShorelineOverlay';
import { ShorelinePeriodControl } from '@/components/map/ShorelinePeriodControl';
import { WindRose } from '@/components/explorer/WindRose';
import { PlaceMap } from '@/components/map/PlaceMap';
import { type LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { createPlaceMedallion, featureIcon } from '@/utils/map/placeMarker';
import { useAdminBoundary } from '@/hooks/useAdminBoundary';
import { drawAdminBoundary } from '@/utils/map/adminBoundary';

// Öland-modellen — forskningssida. Testar hypotesen om vikingatidens vägnät och
// centralplatser via runstenar, fornborgar, guldfynd, Frö-namn och kyrkor. Imperativ
// Leaflet (samma mönster som ExcursionsMap → undviker react-leaflet-versionskrångel).

const KIND_STYLE: Record<string, { color: string; radius: number; label: string }> = {
  runestone: { color: '#ef4444', radius: 3, label: 'Runsten' },
  church: { color: '#64748b', radius: 3, label: 'Kyrka' },
  hillfort: { color: '#1e3a8a', radius: 5, label: 'Fornborg' },
  fro_name: { color: '#a855f7', radius: 5, label: 'Frö-namn' },
  find: { color: '#d4af37', radius: 6, label: 'Guld-/silverfynd' },
  cult: { color: '#14b8a6', radius: 5, label: 'Kult/offerplats' },
};

// Förbindelser (kurerat, schematiskt — Öland definieras av sina länkar till fastland + Gotland).
const CONN_NODES: { name: string; lat: number; lng: number; note: string }[] = [
  { name: 'Kalmar', lat: 56.663, lng: 16.366, note: 'fastland — stad & slott' },
  { name: 'Revsudden', lat: 56.7737, lng: 16.4749, note: 'fastland — smalaste Kalmarsund, överfart mot Stora Rör (OSM-koord, ±)' },
  { name: 'Hossmo', lat: 56.6372, lng: 16.2251, note: 'fastland vid Ljungbyån — Hossmo kyrka/husaby' },
  { name: 'Ottenby', lat: 56.198, lng: 16.398, note: 'Ölands sydspets — kungsgård' },
];
const CONN_LINES: { name: string; coords: [number, number][] }[] = [
  // Sund (Kalmar→Färjestaden) + landväg österut via Gråborg — schematisk ankarlinje genom
  // verifierade lägen (Färjestaden, Gråborg-borg, Långrälla, Bröttorp, N Möckleby). Exakt
  // vägsträckning (väg 136/H951/H957, Borgmossen/Nötmossen) ej ritad — saknar verifierad geometri.
  { name: 'Kalmar–Färjestaden–Gråborg–Norra Möckleby (sund + landväg)', coords: [[56.663, 16.366], [56.6517, 16.4722], [56.6664, 16.604], [56.6624, 16.6406], [56.6516, 16.6537], [56.6467, 16.6747]] },
  // Revsudden (fastland) → Stora Rör (Öland) → väg inåt mot Ismantorps borg. OSM-koord (±) — schematisk.
  { name: 'Revsudden–Stora Rör–Ismantorp (överfart + väg)', coords: [[56.7737, 16.4749], [56.7564, 16.5275], [56.7454, 16.6427]] },
  { name: 'Hossmo–Karlevi (över sundet)', coords: [[56.6372, 16.2251], [56.608, 16.440]] },
  { name: 'Ölands norra udde → Gotland', coords: [[57.355, 17.05], [57.45, 17.55]] },
];

// Östra landsvägen (Öland) — schematisk N–S-korridor genom östra radens VERIFIERADE kyrknoder
// (ecclesiastical_sites/RAÄ). Den historiska östra landsvägen band samman östsidans byar och
// kyrkor; exakt vägsträckning är inte uppmätt → detta är en ankarlinje, inte en belagd väg
// (samma metod som Förbindelse-linjerna). Jfr äldre karta (Algutsrums/Runstens härad) där leden
// syns som prickad linje. Runstens kyrka (tvåtornig, danskinspirerad) ligger på leden.
const OSTRA_LED: [number, number][] = [
  [57.2445, 17.0597], [57.1644, 17.0166], [57.1114, 16.9863], [57.0672, 16.9311], [57.0125, 16.8669],
  [56.9478, 16.7840], [56.9183, 16.8381], [56.8736, 16.8210], [56.8447, 16.7939], [56.7935, 16.7379],
  [56.7391, 16.7246], [56.6992, 16.6994], [56.6475, 16.6794], [56.6008, 16.6369], [56.5807, 16.6411],
  [56.5144, 16.6008], [56.4494, 16.5675], [56.3614, 16.5364], [56.3094, 16.5081],
];

const sb = supabase as unknown as { rpc: (fn: string, args?: any) => any; from: (t: string) => any };

const OL_KIND_KEYS = Object.keys(KIND_STYLE);
// Vindskyddad farled (hypotes) genom Kalmarsund — kopplad till vindrosen: förhärskande N/S-vind
// → man höll lä-sidan och stannade i skydd. ENDAST verifierade nodkoordinater (jfr CONN_NODES);
// de specifika hamnarna Olsan/Snäckstrand/Saxnäs/Skallöarna ritas inte förrän koord verifierats.
const WIND_LEE: [number, number][] = [
  [56.663, 16.366],   // Kalmar
  [56.6517, 16.4722], // Färjestaden
  [56.756, 16.527],   // Stora Rör
];

// Öland-legend (extraDefs till PlaceMap). OSM-baskartan lägger PlaceMap till själv → utelämnas här.
const OLAND_DEFS: LegendLayerDef[] = [
  ...OL_KIND_KEYS.map((k) => ({ key: k, label: KIND_STYLE[k].label, color: KIND_STYLE[k].color, defaultOn: true })),
  { key: 'connection', label: 'Förbindelser', color: '#f59e0b', defaultOn: true },
  { key: 'windLee', label: 'Vindskyddad farled (hypotes)', color: '#0ea5e9', defaultOn: false },
  { key: 'solidi', label: 'Solidi (guldmynt)', color: '#eab308', defaultOn: false },
  { key: 'territory', label: 'Borgterritorier', color: '#b45309', defaultOn: false },
  { key: 'crossing', label: 'Kalmarsund: grund & överfart (hypotes)', color: '#22d3ee', defaultOn: false },
  { key: 'beacon', label: 'Vårdkasar', color: '#f97316', defaultOn: false },
  { key: 'fornvag', label: 'Fornvägar (färdväg/vägmärke)', color: '#92400e', defaultOn: false },
  { key: 'kalla', label: 'Källor med tradition', color: '#0891b2', defaultOn: false },
  { key: 'ostraled', label: 'Östra landsvägen (schematisk)', color: '#b91c1c', defaultOn: false },
  { key: 'snack', label: 'Snäck-namn (ledung, hypotes)', color: '#7c3aed', defaultOn: false },
  { key: 'admin', label: 'Kommungränser', color: '#0ea5e9', defaultOn: true },
];

const OlandMap: React.FC<{
  points: OlandPoint[];
  solidi: { lat: number; lng: number; ruler: string | null; find_place: string | null; parish: string | null }[];
}> = ({ points, solidi }) => {
  // Kart-instansen sätts i handleMapReady (PlaceMap äger init). useShorelineOverlay väntar in den.
  const mapRef = useRef<L.Map | null>(null);
  const enabledRef = useRef<Record<string, boolean>>({});
  // Bespoke-lagergrupper (skapas här, addTo(map) i handleMapReady). Data-cache-refs som förut.
  const layerRef = useRef<L.LayerGroup>(L.layerGroup());
  const connRef = useRef<L.LayerGroup>(L.layerGroup());
  const windRef = useRef<L.LayerGroup>(L.layerGroup());
  const solidiRef = useRef<L.LayerGroup>(L.layerGroup());
  const terrRef = useRef<L.LayerGroup>(L.layerGroup());
  const terrGeoRef = useRef<any[] | null>(null);
  const crossingRef = useRef<L.LayerGroup>(L.layerGroup());
  const beaconRef = useRef<L.LayerGroup>(L.layerGroup());
  const crossingDataRef = useRef<any[] | null>(null);
  const beaconDataRef = useRef<any[] | null>(null);
  const fornvagRef = useRef<L.LayerGroup>(L.layerGroup());
  const kallaRef = useRef<L.LayerGroup>(L.layerGroup());
  const fornvagDataRef = useRef<any[] | null>(null);
  const kallaDataRef = useRef<any[] | null>(null);
  const ostraledRef = useRef<L.LayerGroup>(L.layerGroup());
  const snackRef = useRef<L.LayerGroup>(L.layerGroup());
  const snackDataRef = useRef<any[] | null>(null);
  const adminRef = useRef<L.LayerGroup>(L.layerGroup());
  // Alla Sveriges kommungränser (Lantmäteri "Kommun, län och rike", © Lantmäteriet), förenklade
  // ~200 m så nationell täckning väger ~1 MB. Öland syns default på, panorera för fastlandet.
  const { data: adminBoundary = [] } = useAdminBoundary('kommun', null, 0.002);
  const [shoreYear, setShoreYear] = useState<number | null>(950);
  // Öland: för CE-år (50–950) använd Lantmäteris MHM-härledda strandlinje (bar jord 1 m, RH2000 —
  // sannare än SGU:s grova raster; get_paleo_shorelines_dem föredrar mhm_lantmateri inom denna bbox).
  // För djuptid (negativa år: Littorina/Ancylus/Yoldia) finns MHM ej → falla tillbaka på SGU-modellen.
  const OLAND_BBOX: [number, number, number, number] = [16.30, 56.15, 17.15, 57.40];
  const MHM_CAPTION = 'Lantmäteriet Markhöjdmodell 1 m (bar jord, RH2000) — härledd kustlinje mot relativ havsnivå. © Lantmäteriet';
  const useDem = shoreYear != null && shoreYear >= 0;
  const { status: shoreStatus } = useShorelineOverlay(
    mapRef, shoreYear,
    useDem ? 'get_paleo_shorelines_dem' : 'get_paleo_shorelines_nearest',
    useDem ? OLAND_BBOX : undefined,
  );

  // drawAll: samlar de tidigare per-lager-effekterna. Ritar varje bespoke-lager gated på
  // enabled[key]. Definieras om varje render (closure över aktuella points/solidi/adminBoundary);
  // stabil referens exponeras via drawAllRef så PlaceMap-callbacken inte behöver bytas identitet.
  const drawAllRef = useRef<(enabled: Record<string, boolean>) => void>(() => {});
  const drawAll = (enabled: Record<string, boolean>) => {
    enabledRef.current = enabled;
    const map = mapRef.current;
    if (!map) return;

    // Punkter (useOlandModel) — filtrerade per lager i legenden (enabled[kind]).
    {
      const layer = layerRef.current;
      layer.clearLayers();
      points.filter((p) => enabled[p.kind]).forEach((p) => {
        const s = KIND_STYLE[p.kind] ?? { color: '#94a3b8', radius: 3, label: p.kind };
        const isFort = p.kind === 'hillfort';
        // Medaljong: färgen bär lagret (matchar legenden), FORMEN (featureIcon: runestone→rune,
        // church→church, hillfort→fort, fro_name→grain, find→coin, cult→idol) bär typen → skiljs på
        // form, ej bara färg (WCAG 1.4.1). Fornborgar = huvudnoder → permanent namn; övriga hover.
        L.marker([p.lat, p.lng], { icon: createPlaceMedallion({
          color: s.color, icon: featureIcon(p.kind), label: p.name,
          prominent: isFort, hairline: true, size: isFort ? 34 : (p.kind === 'find' ? 28 : 24),
        }) })
          .bindPopup(`<b>${p.name}</b><br/><span style="font-size:11px;color:#666">${s.label}${p.note ? ` · ${p.note}` : ''}</span>${isFort && p.id ? `<br/><a href="/fortresses/${p.id}" style="font-size:11px;color:#38bdf8;font-weight:600">Dateringar, fynd &amp; källor →</a>` : ''}`)
          .addTo(layer);
      });
    }

    // Förbindelser (default PÅ på Öland).
    {
      const g = connRef.current;
      g.clearLayers();
      if (enabled.connection) {
        CONN_LINES.forEach((l) => L.polyline(l.coords, { color: '#f59e0b', weight: 2, dashArray: '6 6', opacity: 0.75 })
          .bindPopup(`<b>${l.name}</b><br/><span style="font-size:11px">Schematisk förbindelse (ej uppmätt väg)</span>`).addTo(g));
        CONN_NODES.forEach((n) => L.circleMarker([n.lat, n.lng], { radius: 6, color: '#f59e0b', weight: 2, fillColor: '#ffffff', fillOpacity: 0.9 })
          .bindPopup(`<b>${n.name}</b><br/><span style="font-size:11px;color:#666">${n.note}</span>`).addTo(g));
      }
    }

    // Vindskyddad farled (hypotes) — kopplad till vindrosen.
    {
      const g = windRef.current;
      g.clearLayers();
      if (enabled.windLee) {
        L.polyline(WIND_LEE, { color: '#0ea5e9', weight: 3, dashArray: '2 6', opacity: 0.9 })
          .bindPopup('<b>Vindskyddad farled (hypotes)</b><br/><span style="font-size:11px">Kopplad till vindrosen: förhärskande N/S-vind i Kalmarsund → man höll lä-sidan och stannade i skydd. Schematisk genom verifierade noder (Kalmar–Färjestaden–Stora Rör). Specifika hamnar (Olsan, Snäckstrand, Saxnäs, Skallöarna) ritas när koordinaterna verifierats.</span>')
          .addTo(g);
      }
    }

    // Solidi-lager (547 Öland-guldmynt) — små guldpunkter, oberoende av modell-punkterna.
    {
      const layer = solidiRef.current;
      layer.clearLayers();
      if (enabled.solidi) {
        solidi.forEach((s) => {
          L.circleMarker([s.lat, s.lng], { radius: 2.5, color: '#78350f', weight: 0.5, fillColor: '#eab308', fillOpacity: 0.85 })
            .bindPopup(`<b>${s.ruler || 'Solidus'}</b><br/><span style="font-size:11px;color:#666">${s.find_place || ''}${s.parish ? ` · ${s.parish} sn` : ''}</span>`)
            .addTo(layer);
        });
      }
    }

    // Borgterritorier (Voronoi) — hämtas en gång, cacheas i ref.
    {
      const layer = terrRef.current;
      const draw = (rows: any[]) => {
        layer.clearLayers();
        if (!enabledRef.current.territory) return;
        for (const f of rows) {
          let geom; try { geom = JSON.parse(f.geojson); } catch { continue; }
          const style = f.dated
            ? { color: '#b45309', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.08 }
            : { color: '#64748b', weight: 1, dashArray: '4 4', fillColor: '#94a3b8', fillOpacity: 0.04 };
          L.geoJSON(geom, { style: () => style as any })
            .bindPopup(`<b>${f.fort_name}</b><br/><span style="font-size:11px">Teoretiskt borgterritorium (Voronoi, schematiskt)${f.dated ? `<br/>Daterad: ${f.period_start ?? ''}–${f.period_end ?? ''}` : '<br/><em>odaterad — vägs lägre</em>'}</span>`)
            .addTo(layer);
        }
      };
      if (terrGeoRef.current) { draw(terrGeoRef.current); }
      else if (enabled.territory) {
        (async () => {
          const { data } = await sb.rpc('oland_fort_territories');
          if (!data) return;
          terrGeoRef.current = data as any[];
          draw(data as any[]);
        })();
      } else { layer.clearLayers(); }
    }

    // Kalmarsunds-överfart + långgrund (crossing_points) — hypoteslager, hämtas en gång, cacheas.
    // Färg per kind: grund/shoal/långgrund cyan, rev/hinder rött, skyddsö grönt, start amber, hamn blå.
    {
      const layer = crossingRef.current;
      const CK: Record<string, string> = { grund: '#22d3ee', shoal: '#22d3ee', shallow_shore: '#22d3ee', rock: '#ef4444', obstruction: '#ef4444', shelter_island: '#16a34a', launch: '#f59e0b', harbor: '#0ea5e9', holme_fort: '#a855f7' };
      const draw = (rows: any[]) => {
        layer.clearLayers();
        if (!enabledRef.current.crossing) return;
        rows.forEach((p) => L.circleMarker([p.lat, p.lng], { radius: p.kind === 'shallow_shore' ? 4 : 5, color: '#0f172a', weight: 1, fillColor: CK[p.kind] ?? '#94a3b8', fillOpacity: 0.85 })
          .bindPopup(`<b>${p.name}</b><br/><span style="font-size:11px;color:#666">${p.kind} · Kalmarsund (hypotes/proxy)</span>`).addTo(layer));
      };
      if (crossingDataRef.current) { draw(crossingDataRef.current); }
      else if (enabled.crossing) {
        (async () => {
          const { data } = await sb.from('crossing_points').select('name,kind,lat,lng');
          if (!data) return; crossingDataRef.current = data; draw(data);
        })();
      } else { layer.clearLayers(); }
    }

    // Vårdkasar (beacon_sites) i Öland/Kalmarsund-området (bbox båda kuster).
    {
      const layer = beaconRef.current;
      const draw = (rows: any[]) => {
        layer.clearLayers();
        if (!enabledRef.current.beacon) return;
        rows.forEach((b) => L.circleMarker([b.lat, b.lng], { radius: 4, color: '#7c2d12', weight: 1, fillColor: '#f97316', fillOpacity: 0.85 })
          .bindPopup(`<b>${b.name || 'Vårdkase'}</b><br/><span style="font-size:11px;color:#666">Vårdkase${b.parish ? ` · ${b.parish}` : ''}</span>`).addTo(layer));
      };
      if (beaconDataRef.current) { draw(beaconDataRef.current); }
      else if (enabled.beacon) {
        (async () => {
          const { data } = await sb.from('beacon_sites').select('name,parish,lat,lng').gte('lat', 56.1).lte('lat', 57.5).gte('lng', 16.0).lte('lng', 17.2);
          if (!data) return; beaconDataRef.current = data; draw(data);
        })();
      } else { layer.clearLayers(); }
    }

    // Fornvägar (RAÄ färdväg/vägmärke) i Öland-området — punktlämningar (ej linjegeometri; vi har
    // ingen uppmätt sträckning). 1700-talets väghållningsstenar INGÅR EJ (kronologiskt skilda).
    {
      const layer = fornvagRef.current;
      const draw = (rows: any[]) => {
        layer.clearLayers();
        if (!enabledRef.current.fornvag) return;
        rows.forEach((r) => L.circleMarker([r.lat, r.lng], { radius: 4, color: '#451a03', weight: 1, fillColor: '#92400e', fillOpacity: 0.8 })
          .bindPopup(`<b>${r.name || 'Fornväg'}</b><br/><span style="font-size:11px;color:#666">${r.raa_type} · RAÄ Fornsök</span>`).addTo(layer));
      };
      if (fornvagDataRef.current) { draw(fornvagDataRef.current); }
      else if (enabled.fornvag) {
        (async () => {
          const { data } = await sb.from('heritage_sites').select('name,raa_type,lat,lng')
            .in('raa_type', ['färdväg', 'vägmärke'])
            .gte('lat', 56.15).lte('lat', 57.45).gte('lng', 16.3).lte('lng', 17.2);
          if (!data) return; fornvagDataRef.current = data; draw(data);
        })();
      } else { layer.clearLayers(); }
    }

    // Källor med tradition (RAÄ) — sakral-/kultkontinuitet (t.ex. helgonkällorna Sankt Elofs källa,
    // Kristkällan). Knyter till sidans kristnande-berättelse.
    {
      const layer = kallaRef.current;
      const draw = (rows: any[]) => {
        layer.clearLayers();
        if (!enabledRef.current.kalla) return;
        rows.forEach((r) => L.circleMarker([r.lat, r.lng], { radius: 4, color: '#164e63', weight: 1, fillColor: '#0891b2', fillOpacity: 0.85 })
          .bindPopup(`<b>${r.name || 'Källa med tradition'}</b><br/><span style="font-size:11px;color:#666">Källa med tradition · RAÄ Fornsök</span>`).addTo(layer));
      };
      if (kallaDataRef.current) { draw(kallaDataRef.current); }
      else if (enabled.kalla) {
        (async () => {
          const { data } = await sb.from('heritage_sites').select('name,raa_type,lat,lng')
            .eq('raa_type', 'Källa med tradition')
            .gte('lat', 56.15).lte('lat', 57.45).gte('lng', 16.3).lte('lng', 17.2);
          if (!data) return; kallaDataRef.current = data; draw(data);
        })();
      } else { layer.clearLayers(); }
    }

    // Östra landsvägen — schematisk korridor genom östra radens verifierade kyrknoder (ankarlinje).
    {
      const g = ostraledRef.current;
      g.clearLayers();
      if (enabled.ostraled) {
        L.polyline(OSTRA_LED, { color: '#b91c1c', weight: 3, dashArray: '2 7', opacity: 0.85 })
          .bindPopup('<b>Östra landsvägen (schematisk)</b><br/><span style="font-size:11px">Ankarlinje genom östra radens <b>belagda</b> kyrknoder (Böda–Högby–Källa–Föra–Gärdslösa–Runsten–N. Möckleby–Sandby–Stenåsa–Gräsgård). Historiska östra landsvägen band samman östsidans byar; <b>exakt sträckning ej uppmätt</b>. Runstens tvåtorniga (danskinspirerade) kyrka ligger på leden.</span>')
          .addTo(g);
      }
    }

    // Snäck-namn (ledungsindikator) — snäcka = ledungsskepp; snäck-namn brukar knytas till ledung/
    // skeppsvist. ONOMASTISK HYPOTES, ej belagt per lokal. Endast verifierade lägen (place_names/OSM).
    {
      const layer = snackRef.current;
      const draw = (rows: any[]) => {
        layer.clearLayers();
        if (!enabledRef.current.snack) return;
        rows.forEach((r) => L.circleMarker([r.lat, r.lng], { radius: 6, color: '#4c1d95', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.85 })
          .bindPopup(`<b>${r.name}</b><br/><span style="font-size:11px;color:#666">Snäck-namn · kan spegla <i>snäcka</i> (ledungsskepp) — onomastisk hypotes, ej belagt för denna lokal.</span>`).addTo(layer));
      };
      if (snackDataRef.current) { draw(snackDataRef.current); }
      else if (enabled.snack) {
        (async () => {
          const { data } = await sb.from('place_names').select('name,lat,lng')
            .ilike('name', '%snäck%').gte('lat', 56.4).lte('lat', 57.0).gte('lng', 16.3).lte('lng', 16.7);
          if (!data) return; snackDataRef.current = data; draw(data);
        })();
      } else { layer.clearLayers(); }
    }

    // Kommungränser (Lantmäteri, © Lantmäteriet) — Öland = Borgholm + Mörbylånga. Statisk indelning,
    // hämtas via useAdminBoundary (RPC get_admin_boundary_geojson). Konturlinje, default på.
    {
      const g = adminRef.current;
      g.clearLayers();
      if (enabled.admin) drawAdminBoundary(g, adminBoundary, { color: '#0ea5e9', weight: 2 });
    }
  };
  drawAllRef.current = drawAll;

  // PlaceMap ger kart-instansen EN gång: fäst grupperna, rita Köpingsvik-hubben, kör första drawAll.
  const handleMapReady = useCallback((map: L.Map, enabled: Record<string, boolean>) => {
    mapRef.current = map;
    // Köpingsvik-hubben (alltid synlig)
    L.circle([56.885, 16.727], { radius: 4000, color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.08 })
      .bindPopup('<b>Köpingsvik</b><br/><span style="font-size:11px">Öns dominerande vikingatida nod — 89 av 190 runstenar inom 4 km.</span>')
      .addTo(map);
    layerRef.current.addTo(map); connRef.current.addTo(map); windRef.current.addTo(map);
    solidiRef.current.addTo(map); terrRef.current.addTo(map);
    crossingRef.current.addTo(map); beaconRef.current.addTo(map);
    fornvagRef.current.addTo(map); kallaRef.current.addTo(map);
    ostraledRef.current.addTo(map); snackRef.current.addTo(map);
    adminRef.current.addTo(map);
    enabledRef.current = enabled;
    drawAllRef.current(enabled);
  }, []);

  // Legend-toggle → rita om alla bespoke-lager gated på nya enabled.
  const handleEnabledChange = useCallback((enabled: Record<string, boolean>) => {
    enabledRef.current = enabled;
    drawAllRef.current(enabled);
  }, []);

  // Sent inkommande data (solidi, adminBoundary) → rita om med senaste enabled när kartan finns.
  useEffect(() => {
    if (mapRef.current) drawAllRef.current(enabledRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, solidi, adminBoundary]);

  return (
    <div>
      <style>{`
        .oland-fort-label { background: rgba(30,58,138,0.88); color:#fff; border:0; box-shadow:none; font-size:10px; font-weight:600; padding:1px 5px; border-radius:3px; white-space:nowrap; }
        .oland-fort-label::before { display:none; }
      `}</style>
      <div className="hidden sm:block">
        <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} noData={shoreStatus === 'no-data'} modelCaption={useDem ? MHM_CAPTION : undefined} />
      </div>
      <div className="relative">
        {/* Mobil: flytande strandlinje-kontroll (frigör kartytan) — inline på desktop ovan. */}
        <div className="sm:hidden absolute left-2 top-16 z-[1105]">
          <ShorelinePeriodControl value={shoreYear} onChange={setShoreYear} variant="floating" noData={shoreStatus === 'no-data'} modelCaption={useDem ? MHM_CAPTION : undefined} />
        </div>
        <PlaceMap
          center={{ lat: 56.7, lng: 16.55 }}
          zoom={9}
          layers={[]}
          extraDefs={OLAND_DEFS}
          heightClass="h-[520px]"
          onMapReady={handleMapReady}
          onEnabledChange={handleEnabledChange}
        />
        {/* Förhärskande vind i Kalmarsund (SMHI) — sundet kanaliserar N–S; styr seglingsrutterna. */}
        <div className="absolute bottom-3 left-3 z-[1000]">
          <WindRose location="Kalmarsund" />
        </div>
      </div>
    </div>
  );
};

const Oland = () => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const { data: points = [], isLoading } = useOlandModel();
  const { data: allSolidi = [] } = useSolidi();
  const count = (k: string) => points.filter((p) => p.kind === k).length;
  // Öland-solidi med giltig koordinat (landscape = Öland).
  const olandSolidi = React.useMemo(() => allSolidi
    .filter((s) => (s.landscape || '').toLowerCase().includes('öland'))
    .map((s) => { const co = parseCoinCoord(s.coordinates as any); return co ? { lat: co.lat, lng: co.lng, ruler: s.ruler, find_place: s.find_place, parish: s.parish } : null; })
    .filter((x): x is NonNullable<typeof x> => !!x), [allSolidi]);

  return (
    <div className="min-h-screen viking-bg">
      <PageMeta
        title="Öland-modellen — vägnät och centralplatser under vikingatiden"
        titleEn="The Öland model — Viking-age roads and central places"
        description="Forskningssida: rekonstruktion av Ölands vikingatida vägnät och centralplatser ur runstenar, fornborgar, guldfynd, Frö-namn och kyrkor. Reproducerbar, källförd, med redovisade osäkerheter."
        descriptionEn="Research page: reconstructing Öland's Viking-age road network and central places."
        keywords="Öland, vikingatid, runstenar, fornborgar, Karlevi, Köpingsvik, Gråborg, Färjestadskragen, centralplats, vägnät"
      />
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-gold" /> Öland-modellen
          </h1>
          <p className="text-gold/90 text-sm font-medium mb-3">Vikingatidens vägnät och centralplatser</p>
          <p className="text-muted-foreground text-lg">
            Öland har inte ändrat form nämnvärt sedan järnåldern. Genom att lägga runstenar, fornborgar,
            guldfynd, Frö-namn och medeltidskyrkor på samma karta framträder ett troligt mönster för hur
            vägarna gick och var makten satt. Materialet är en <em>modell</em> — källförd och prövbar, inte en
            färdig slutsats.
          </p>
        </div>

        {/* Interaktiva kartan högst upp på sidan (Daniel) — legenden ligger på kartan (delad MapLegend).
            Platshållaren reserverar kartans yta under inladdning så sidan inte hoppar/"överladdas"
            när datan kommer (samma grepp som /sv/angermanland). */}
        {isLoading ? (
          <div className="viking-card rounded-lg border border-border mb-2 flex items-center justify-center" style={{ minHeight: 420 }}>
            <div className="animate-pulse text-sm text-muted-foreground">Laddar Öland-kartan…</div>
          </div>
        ) : (
          <OlandMap points={points} solidi={olandSolidi} />
        )}
        <p className="text-xs text-muted-foreground mt-3 mb-6 opacity-80">
          {points.length} punkter: {count('runestone')} runstenar · {count('hillfort')} fornborgar · {count('church')} kyrkor · {count('find')} guld-/silverfynd · {count('fro_name')} Frö-namn.
          {' '}Solidi-lagret rymmer {olandSolidi.length} individuella guldmynt (SHM CC BY).
          Källor: Samnordisk runtextdatabas; RAÄ/Fornsök; Historiska museet (guldfynd); Ortnamnsregistret.
        </p>

        <details className="viking-card rounded-lg border border-border mb-4 text-sm">
          <summary className="cursor-pointer px-4 py-2 text-gold font-medium">ⓘ Om borgterritorierna — metod &amp; källkritik</summary>
          <div className="px-4 pb-3 text-muted-foreground space-y-2">
            <p>Territorierna är <strong>Voronoi-/Thiessen-polygoner</strong>: varje fornborg får den yta som ligger närmare den än någon annan borg — en teoretisk modell av upptagningsområden <em>före</em> socken-/skatteformen. Daterade borgar ritas fyllda (orange), odaterade streckade och blekare.</p>
            <p><strong className="text-amber-300">Viktig källkritik:</strong> Voronoi förutsätter att borgarna är <em>samtida</em> — vilket de inte är. Detta är därför ett <strong>hypotesgenererande, schematiskt lager</strong>, inte belagda gränser. På Öland är 6 av 21 borgar daterade (folkvandringstid, försvar).</p>
            <p>Beräkningen är numera <strong>generaliserad</strong> (<code>fort_territories</code> per region-bbox) och kan köras för andra regioner. Fastlandets borgar (73 i Småland) är dock ännu <strong>odaterade</strong> och skulle ritas som osäkra tills de daterats.</p>
          </div>
        </details>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Route className="h-5 w-5" /> Vad datan visar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Väst/Kalmarsund-korridoren</strong> är entydig: Karlevistenen (Öl 1), Frö-klungan (Stora/Lilla Frö), Färjestadskragen (folkvandringstida prestigeguld, SHM 108870) och en runstenslinje längs sundet — monument, kult, guld och runstenar på samma axel.</p>
            <p><strong className="text-foreground">Köpingsvik</strong> är öns dominerande nod: 89 av 190 runstenar inom 4 km.</p>
            <p><strong className="text-foreground">Fornborgs-spinen</strong> ligger i mitten (Gråborg, Ismantorp, Bårby…); Sandby borg östligare mot Östersjön.</p>
            <p><strong className="text-foreground">E–V-väg Färjestaden→Björnhovda→Gråborg:</strong> Björnhovda-skattens (36 solidi) läge på vägen som passerar Gråborg pekar på en gammal tvärförbindelse mellan kust och inre.</p>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4 border-amber-600/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-300"><AlertTriangle className="h-5 w-5" /> Ärliga förbehåll</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Östkusten är gles</strong> på runstenar — modellen är väst-dominerad, inte två jämnstarka N–S-vägar.</li>
              <li><strong>Kyrkorna står tätt</strong> (uppmätt median ~5,5 km öbrett; tätare i söder) — inte 7–15 km som dagsräckvidds-modellen ger för fastlandets glesbygd. Se kristnande-grafen nedan.</li>
              <li><strong>Tvär-sundskontext:</strong> Kalmar-bygden (Hossmo m.fl.) mittemot hör till samma system över det långgrunda Kalmarsund — men den är fastland och visas inte här.</li>
              <li>Väglinjerna är ännu inte inritade; 1700-talets milstenar (~137) är nästa verktyg för att spåra dem.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="viking-card mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gold"><Route className="h-5 w-5" /> Kristnandet på Öland — tempo mot Uppland &amp; Ångermanland</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-6">
              <strong className="text-foreground">Öland kristnades fort:</strong> ~halva kyrkbeståndet stod redan på 1100-talet och var i stort klart till 1200. <strong>Uppland</strong> fylldes gradvis (16&nbsp;% vid 1100 → 58&nbsp;% vid 1200), och <strong>Ångermanland</strong> förblev glest (26 kyrkor, ~10 km isär, bara 3 fornborgar). Olika odlingslandskap och befolkning → olika tempo.
            </p>

            {/* Fyra fristående figurer — varje med egen rubrik och tydlig avgränsare
                (tidigare låg de i en osammanhängande hög; Daniel: "ser inte bra ut typografiskt"). */}
            <div className="[&>section]:border-t [&>section]:border-border/40 [&>section]:pt-6 [&>section]:mt-6 [&>section:first-child]:border-0 [&>section:first-child]:pt-0 [&>section:first-child]:mt-0">
              <section>
                <OlandChristianizationEpochs />
              </section>
              <section>
                <div className="text-sm font-semibold text-foreground mb-2">Kristnandetempo — Öland mot Uppland &amp; Ångermanland</div>
                <ChristianizationChart />
              </section>
              <section>
                <OlandChristianizationTimeline />
              </section>
              <section>
                <ChurchConsolidationCard sv={sv} />
              </section>
            </div>

            <p className="text-xs opacity-80 mt-6 border-t border-border/40 pt-4"><strong className="text-amber-300">Tolkning (hypotes):</strong> ett snabbt, front-tungt kristnande tyder på att kyrkorna restes på redan etablerade centrum — övertagande av gamla kult-/maktplatser — eller på ett område som var kristet-influerat tidigare. Täthet ensam avgör inte vilket; det gör kyrkornas läge (på hednisk kultplats? vid runsten med kors?). Nästa steg: lägga 190 Öland-runstenar + spolia (återbrukade bildstenar i kyrkor) mot kyrkolägena.</p>
          </CardContent>
        </Card>

        <div className="pt-4">
          <a href="/explore?center=56.7,16.6&zoom=9" className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">
            <Compass className="h-4 w-4" /> Öppna hela kartan (experimentera med fler lager)
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Oland;
