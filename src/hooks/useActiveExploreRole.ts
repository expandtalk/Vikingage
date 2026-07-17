import { useSyncExternalStore } from 'react';
import { normalizeProfileId, PROFILE_IDS, type ProfileId } from '@/config/exploreProfiles';

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
const VALID: ProfileId[] = PROFILE_IDS;
const listeners = new Set<() => void>();

const normalize = (v: string | null): ProfileId => normalizeProfileId(v);

const getSnapshot = (): ProfileId => {
  try {
    return normalize(localStorage.getItem(KEY));
  } catch {
    return 'explore';
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
export const setActiveExploreRole = (role: ProfileId) => {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};

/** Reactive hook returning the current Explore role. */
export const useActiveExploreRole = (): ProfileId =>
  useSyncExternalStore(subscribe, getSnapshot, () => 'explore');
