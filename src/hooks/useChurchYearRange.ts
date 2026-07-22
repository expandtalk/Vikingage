import { useSyncExternalStore } from 'react';

// Fritt byggårs-intervall för kyrkolagret (från/till). Default = medeltid (1000–1550),
// men går att sätta fritt (t.ex. 1800–2000 för moderna kyrkor). Odaterade kyrkor
// (built_from = null) visas alltid — vi vet inte deras år.
export interface ChurchYearRange { from: number; to: number }

let state: ChurchYearRange = { from: 1000, to: 1550 };
const listeners = new Set<() => void>();

export const setChurchYearRange = (from: number, to: number) => {
  state = { from: Math.min(from, to), to: Math.max(from, to) };
  listeners.forEach((l) => l());
};
export const getChurchYearRange = () => state;
export const useChurchYearRange = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => state, () => state);
