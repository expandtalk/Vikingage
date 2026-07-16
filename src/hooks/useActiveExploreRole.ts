import { useSyncExternalStore } from 'react';
import type { UserRole } from './legend/rolePresets';

/**
 * Shared, reactive store for the active Explore persona/role
 * (explorer | linguist | geographer | researcher).
 *
 * The panel-layout selector persists the choice to localStorage under
 * `activePreset`, but usePanelManager keeps it in per-instance state that does
 * not propagate to other components. This tiny external store lets ANY
 * component read the current role reactively — in particular useExplorerData,
 * which feeds it into useLegendManager so each role shows different map layers.
 */
const KEY = 'activePreset';
const VALID: UserRole[] = ['explorer', 'linguist', 'geographer', 'researcher'];
const listeners = new Set<() => void>();

const normalize = (v: string | null): UserRole =>
  VALID.includes(v as UserRole) ? (v as UserRole) : 'explorer';

const getSnapshot = (): UserRole => {
  try {
    return normalize(localStorage.getItem(KEY));
  } catch {
    return 'explorer';
  }
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  // React to changes from other browser tabs too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
};

/** Set the active role and notify all subscribers in this tab. */
export const setActiveExploreRole = (role: UserRole) => {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};

/** Reactive hook returning the current Explore role. */
export const useActiveExploreRole = (): UserRole =>
  useSyncExternalStore(subscribe, getSnapshot, () => 'explorer');
