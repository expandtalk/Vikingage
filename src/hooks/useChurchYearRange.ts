import { useSyncExternalStore } from 'react';

// Fritt byggårs-intervall för kyrkolagret (från/till). Default = medeltid (1000–1550),
// men går att sätta fritt (t.ex. 1800–2000 för moderna kyrkor).
// showUndated: odaterade kyrkor (built_from = null) räknas som kategori "okänd" och döljs
// som standard — annars visades flera hundra odaterade kyrkor under varje vald period.
export interface ChurchYearRange { from: number; to: number; showUndated: boolean }

let state: ChurchYearRange = { from: 1000, to: 1550, showUndated: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const setChurchYearRange = (from: number, to: number) => {
  state = { ...state, from: Math.min(from, to), to: Math.max(from, to) };
  emit();
};
export const setChurchShowUndated = (showUndated: boolean) => {
  state = { ...state, showUndated };
  emit();
};
export const getChurchYearRange = () => state;
export const useChurchYearRange = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => state, () => state);
