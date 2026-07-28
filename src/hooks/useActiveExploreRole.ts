import { useSyncExternalStore } from 'react';
import { normalizeProfileId, type ProfileId } from '@/config/exploreProfiles';

/**
 * Delad, reaktiv store för Explore-profilerna. Stödjer nu FLERA samtidigt (additivt):
 * en person kan vara marinarkeolog + geolog + ockult och se unionen av lagren.
 *
 * - `activePresets` (JSON-array) = valda profiler. `activePreset` (enkel) = primär (index 0),
 *   behålls bakåtkompatibelt (basemap/tema/paneler/period tas från primär).
 * - useSyncExternalStore kräver STABIL snapshot-referens → vi cachar den parsade arrayen och
 *   returnerar samma referens tills localStorage-strängen ändras (annars oändlig render-loop).
 */
const KEY = 'activePreset';        // primär (bakåtkompat.)
const KEY_MULTI = 'activePresets'; // hela urvalet (JSON-array)
const listeners = new Set<() => void>();

let cachedRaw = ' ';
let cachedRoles: ProfileId[] = ['explore'];

const readRoles = (): ProfileId[] => {
  try {
    const rawMulti = localStorage.getItem(KEY_MULTI);
    const rawSingle = localStorage.getItem(KEY);
    const raw = `${rawMulti ?? ''}|${rawSingle ?? ''}`;
    if (raw === cachedRaw) return cachedRoles;
    cachedRaw = raw;
    let arr: unknown = [];
    if (rawMulti) { try { arr = JSON.parse(rawMulti); } catch { arr = []; } }
    let ids = Array.isArray(arr) ? (arr as unknown[]).map((v) => String(v)) : [];
    if (ids.length === 0) ids = [rawSingle ?? 'explore'];
    const norm = ids.map(normalizeProfileId).filter((v, i, a) => a.indexOf(v) === i);
    cachedRoles = norm.length ? norm : ['explore'];
    return cachedRoles;
  } catch {
    return cachedRoles;
  }
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === KEY_MULTI) cb(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage); };
};

const persist = (ids: ProfileId[]) => {
  const clean = ids.map(normalizeProfileId).filter((v, i, a) => a.indexOf(v) === i);
  const final: ProfileId[] = clean.length ? clean : ['explore'];
  try {
    localStorage.setItem(KEY_MULTI, JSON.stringify(final));
    localStorage.setItem(KEY, final[0]);
  } catch { /* privat läge */ }
  listeners.forEach((l) => l());
};

/** Sätt HELA urvalet (primär = första). */
export const setActiveExploreRoles = (ids: ProfileId[]) => persist(ids);

/** Sätt en enda aktiv profil (ersätter urvalet). Bakåtkompatibel. */
export const setActiveExploreRole = (role: ProfileId) => persist([role]);

/** Lägg till/ta bort en profil ur urvalet (aldrig tomt). */
export const toggleExploreRole = (role: ProfileId) => {
  const cur = readRoles();
  const next = cur.includes(role) ? cur.filter((r) => r !== role) : [...cur, role];
  persist(next.length ? next : [role]);
};

/** Gör en profil till primär (flytta först) utan att ändra urvalet. */
export const setPrimaryExploreRole = (role: ProfileId) => {
  const cur = readRoles();
  persist([role, ...cur.filter((r) => r !== role)]);
};

/** Primär profil (index 0) — bakåtkompatibel. */
export const useActiveExploreRole = (): ProfileId =>
  useSyncExternalStore(subscribe, () => readRoles()[0], () => 'explore');

/** Hela det additiva urvalet. */
export const useActiveExploreRoles = (): ProfileId[] =>
  useSyncExternalStore(subscribe, readRoles, () => cachedRoles);
