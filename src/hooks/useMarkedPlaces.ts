import { useSyncExternalStore } from 'react';

export interface MarkedPlace { id: string; lat: number; lng: number; label?: string; createdAt: number }
const KEY = 'vikingage_marked_places_v1';

export function parsePlaces(raw: string | null): MarkedPlace[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((p): p is MarkedPlace =>
      p && typeof p.id === 'string'
        && Number.isFinite(p.lat) && Number.isFinite(p.lng)
        && Number.isFinite(p.createdAt));
  } catch { return []; }
}
export function makePlace(
  input: { lat: number; lng: number; label?: string }, createdAt: number, id: string,
): MarkedPlace {
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) throw new Error('bad coords');
  return { id, lat: input.lat, lng: input.lng, ...(input.label ? { label: input.label } : {}), createdAt };
}

let places: MarkedPlace[] = typeof window !== 'undefined' ? parsePlaces(window.localStorage.getItem(KEY)) : [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const persist = () => { if (typeof window !== 'undefined') { try { window.localStorage.setItem(KEY, JSON.stringify(places)); } catch { /* quota */ } } };

// id/createdAt come from callers at call time (Date.now/crypto ok in app runtime, not in tests).
export const addMarkedPlace = (input: { lat: number; lng: number; label?: string }) => {
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());
  places = [...places, makePlace(input, Date.now(), id)];
  persist(); emit();
};
export const removeMarkedPlace = (id: string) => { places = places.filter((p) => p.id !== id); persist(); emit(); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useMarkedPlaces = () => useSyncExternalStore(subscribe, () => places, () => places);
