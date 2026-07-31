import { useSyncExternalStore } from 'react';

// Steg 2d: punkt-till-punkt-linjal. Klicka två punkter på kartan → geodetiskt avstånd.
// Utökat läge "Sträcka": klicka N punkter → en bana med kumulativ längd + dagsresor
// (som Lantmäteriets vandringstavla med 0–10 km-skalan, men även uttryckt i dagsresor).
export interface Pt { lat: number; lng: number }
export type RulerMode = 'simple' | 'path';
interface RulerState { active: boolean; mode: RulerMode; pts: Pt[] }
let state: RulerState = { active: false, mode: 'simple', pts: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const toggleRuler = () => { state = { ...state, active: !state.active, pts: [] }; emit(); };
// Byt läge (Enkel ↔ Sträcka) — nollställ punkterna så lägena inte blandas.
export const setRulerMode = (mode: RulerMode) => { state = { ...state, mode, pts: [] }; emit(); };
export const addRulerPoint = (lat: number, lng: number) => {
  // Enkelt läge: två punkter, tredje klicket börjar om. Sträckläge: förläng banan.
  const pts = state.mode === 'path'
    ? [...state.pts, { lat, lng }]
    : (state.pts.length >= 2 ? [{ lat, lng }] : [...state.pts, { lat, lng }]);
  state = { ...state, pts }; emit();
};
export const clearRuler = () => { state = { ...state, pts: [] }; emit(); };
// Ta bort sista punkten (sträckläge — ångra ett felklick utan att börja om).
export const undoRulerPoint = () => { state = { ...state, pts: state.pts.slice(0, -1) }; emit(); };
// Flytta en befintlig mätpunkt (dra i markören på kartan).
export const updateRulerPoint = (i: number, lat: number, lng: number) => {
  if (i < 0 || i >= state.pts.length) return;
  const pts = state.pts.slice(); pts[i] = { lat, lng };
  state = { ...state, pts }; emit();
};
export const useRuler = () => useSyncExternalStore(subscribe, () => state);

// Haversine, km.
export const rulerKm = (a: Pt, b: Pt): number => {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

// Summa av alla delsträckor (banans totala längd), km.
export const rulerPathKm = (pts: Pt[]): number => {
  let sum = 0;
  for (let i = 1; i < pts.length; i++) sum += rulerKm(pts[i - 1], pts[i]);
  return sum;
};

// Kumulativt avstånd vid varje vertex: [0, d1, d1+d2, …] — används för tick-etiketterna.
export const rulerCumKm = (pts: Pt[]): number[] => {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) sum += rulerKm(pts[i - 1], pts[i]);
    out.push(sum);
  }
  return out;
};
