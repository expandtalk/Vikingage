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

interface ProbeState { probe: Probe | null; radiusKm: number; shape: ProbeShape; modeKey: string | null }

let state: ProbeState = { probe: null, radiusKm: 30, shape: 'circle', modeKey: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setProbe = (lat: number, lng: number, label: string) => {
  state = { ...state, probe: { lat, lng, label } };
  emit();
};
export const clearProbe = () => { state = { ...state, probe: null }; emit(); };
export const setProbeRadiusKm = (km: number) => {
  state = { ...state, radiusKm: Math.max(1, Math.min(200, km)), modeKey: null };
  emit();
};
export const setProbeShape = (shape: ProbeShape) => { state = { ...state, shape }; emit(); };
export const setProbeMode = (key: string) => {
  const m = TRANSPORT_MODES.find((t) => t.key === key);
  if (m) { state = { ...state, radiusKm: m.radiusKm, modeKey: key }; emit(); }
};

export const useProximityProbe = () => useSyncExternalStore(subscribe, () => state);

// Exponera för Leaflet-popup-knappar (HTML-strängar utanför React-trädet).
if (typeof window !== 'undefined') {
  (window as any).setProximityProbe = (lat: number, lng: number, label: string) => setProbe(lat, lng, label);
}
