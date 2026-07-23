import { useSyncExternalStore } from 'react';

// Delad "räckvidds"-sond: en vald punkt + radie + FORM. Kartlagret ritar formen och
// hämtar närliggande lager (ortnamn/kulturlager/runstenar/fort) via features_near_point.
// Tre former fångar tre optimeringsprinciper (Daniel):
//   cirkel   = isotrop räckvidd från en punkt (dagsresecatchment åt alla håll)
//   fyrkant  = rutnät/väg-spacing (romerska borgar en dagsmarsch isär, kadaster)
//   hexagon  = central-place-tessellering (Christaller — optimal packning av territorier)
// Storleken sätts av en DAGSRESA som beror på transporttekniken (tekniksprång).

export type ProbeShape = 'circle' | 'square' | 'hexagon';
export interface Probe { lat: number; lng: number; label: string }

export interface TransportMode {
  key: string;
  labelSv: string;
  labelEn: string;
  radiusKm: number;   // dagsresa (envägs räckvidd = radie)
  note: string;
}
// Dagsresor är RIKTVÄRDEN (redovisade osäkerheter i UI) — inte exakta konstanter.
export const TRANSPORT_MODES: TransportMode[] = [
  { key: 'foot',      labelSv: 'Till fots',    labelEn: 'On foot',      radiusKm: 30,  note: '~25–35 km/dag (romersk dagsmarsch ~30 km)' },
  { key: 'wagon',     labelSv: 'Vagn/oxe',     labelEn: 'Ox-cart',      radiusKm: 15,  note: '~15 km/dag — långsammast (före ridhästen)' },
  { key: 'horse',     labelSv: 'Häst',         labelEn: 'Horse',        radiusKm: 50,  note: '~40–60 km/dag efter stigbygel & sadel' },
  { key: 'boat_row',  labelSv: 'Båt (rodd)',   labelEn: 'Boat (oars)',  radiusKm: 40,  note: 'rodd/paddel, före seglet' },
  { key: 'boat_sail', labelSv: 'Båt (segel)',  labelEn: 'Boat (sail)',  radiusKm: 100, note: '~100+ km/dag med segel (Skandinavien ~700-tal)' },
];

export interface ProbeCounts {
  place_names_curated: number;
  place_names_osm: number;
  kulturlager: number;
  runestones: number;
  fortresses: number;
  area_km2: number;
}
// Fullständigt sond-resultat (objektlistorna INUTI formen) — behövs för export.
// Speglar features_in_shape-svaret; listorna är cappade (1500/lager) medan counts är exakta.
export interface ProbeResult {
  place_names?: { name: string; lat: number; lng: number; category?: string }[];
  kulturlager?: { name: string; type?: string; lat: number; lng: number }[];
  runestones?: { signum: string; lat: number; lng: number }[];
  fortresses?: { name: string; type?: string; lat: number; lng: number }[];
}
interface ProbeState { probe: Probe | null; radiusKm: number; shape: ProbeShape; modeKey: string | null; counts: ProbeCounts | null; result: ProbeResult | null; note: string }

let state: ProbeState = { probe: null, radiusKm: 30, shape: 'circle', modeKey: null, counts: null, result: null, note: '' };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setProbe = (lat: number, lng: number, label: string) => {
  state = { ...state, probe: { lat, lng, label }, counts: null, result: null, note: '' };
  emit();
};
export const clearProbe = () => { state = { ...state, probe: null, counts: null, result: null, note: '' }; emit(); };
// Fri hypotes-/anteckningstext knuten till området (name = probe.label, hypotes = note).
export const setProbeNote = (note: string) => { state = { ...state, note }; emit(); };
export const setProbeRadiusKm = (km: number) => {
  state = { ...state, radiusKm: Math.max(1, Math.min(200, km)), modeKey: null, counts: null, result: null };
  emit();
};
export const setProbeShape = (shape: ProbeShape) => { state = { ...state, shape, counts: null, result: null }; emit(); };
export const setProbeMode = (key: string) => {
  const m = TRANSPORT_MODES.find((t) => t.key === key);
  if (m) { state = { ...state, radiusKm: m.radiusKm, modeKey: key, counts: null, result: null }; emit(); }
};
export const setProbeCounts = (counts: ProbeCounts | null) => { state = { ...state, counts }; emit(); };
// Fullständigt resultat (objektlistorna) — sätts av kartlagret efter RPC:n, används för export.
export const setProbeResult = (result: ProbeResult | null) => { state = { ...state, result }; emit(); };

export const useProximityProbe = () => useSyncExternalStore(subscribe, () => state);

// Exponera för Leaflet-popup-knappar (HTML-strängar/DOM utanför React-trädet).
if (typeof window !== 'undefined') {
  const w = window as unknown as Record<string, unknown>;
  // Kanonisk bro: popup-injektorn, kartklick och linjalen går alla genom setProbe.
  // Håll __reachProbe stabilt — det kan refereras från genererad popup-HTML.
  w.__reachProbe = (lat: number, lng: number, label: string) => setProbe(lat, lng, label);
  // Bakåtkompatibla alias (äldre popup-HTML / bokmärken kan referera dessa).
  w.setProximityProbe = w.__reachProbe;
  // Agnetas 9 km: sätt sond + hexagon + 9 km i ett svep (daglig maskvidd).
  w.analyzeAgneta9km = (lat: number, lng: number, label: string) => {
    setProbe(lat, lng, label); setProbeShape('hexagon'); setProbeRadiusKm(9);
  };
}
