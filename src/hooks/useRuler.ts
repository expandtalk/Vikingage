import { useSyncExternalStore } from 'react';

// Steg 2d: punkt-till-punkt-linjal. Klicka två punkter på kartan → geodetiskt avstånd.
export interface Pt { lat: number; lng: number }
interface RulerState { active: boolean; pts: Pt[] }
let state: RulerState = { active: false, pts: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const toggleRuler = () => { state = { active: !state.active, pts: [] }; emit(); };
export const addRulerPoint = (lat: number, lng: number) => {
  const pts = state.pts.length >= 2 ? [{ lat, lng }] : [...state.pts, { lat, lng }];
  state = { ...state, pts }; emit();
};
export const clearRuler = () => { state = { ...state, pts: [] }; emit(); };
export const useRuler = () => useSyncExternalStore(subscribe, () => state);

// Haversine, km.
export const rulerKm = (a: Pt, b: Pt): number => {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
