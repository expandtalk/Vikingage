import { useSyncExternalStore } from 'react';

// Litet delat filter för kyrklagrets byggår. Delas mellan legend-reglaget och
// useMapChurches utan djup prop-tråd. 0 = visa alla (även odaterade). >0 = visa
// bara kyrkor med built_from >= värdet.
let churchYearFrom = 0;
const listeners = new Set<() => void>();

export const CHURCH_YEAR_MIN = 1000;
export const CHURCH_YEAR_MAX = 1800;

export const getChurchYearFrom = () => churchYearFrom;
export const setChurchYearFrom = (y: number) => {
  churchYearFrom = y;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

export const useChurchYearFrom = () => useSyncExternalStore(subscribe, getChurchYearFrom);
