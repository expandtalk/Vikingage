import { useSyncExternalStore } from 'react';

// "Mina punkter" — användarens egna ortnamn med position, sparade LOKALT i webbläsaren
// (localStorage). Ingen DB-skrivning, ingen inloggning: hypoteserna stannar hos användaren
// tills hen väljer att dela dem. Håller det källförda korpuset rent (source ≠ 'user').
// En punkt används som centrum för räckvidds-/formverktyget (t.ex. Agnetas 9 km-hexagon).

export interface CustomPoint { id: string; name: string; lat: number; lng: number; note?: string }

const KEY = 'vikingage_custom_points_v1';

const load = (): CustomPoint[] => {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as CustomPoint[]) : []; }
  catch { return []; }
};

let points: CustomPoint[] = typeof window !== 'undefined' ? load() : [];
const listeners = new Set<() => void>();
const emit = () => {
  try { localStorage.setItem(KEY, JSON.stringify(points)); } catch { /* privat läge/quota */ }
  listeners.forEach((l) => l());
};

export const addCustomPoint = (name: string, lat: number, lng: number, note?: string) => {
  const id = `cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  points = [...points, { id, name: name.trim() || 'Namnlös punkt', lat, lng, note: note?.trim() || undefined }];
  emit();
};
export const removeCustomPoint = (id: string) => { points = points.filter((p) => p.id !== id); emit(); };
export const clearCustomPoints = () => { points = []; emit(); };

export const useCustomPoints = () =>
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => points,
    () => points,
  );
