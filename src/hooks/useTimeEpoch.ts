import { useSyncExternalStore } from 'react';

// Delad tidsepok för kartlager (arter/introduktioner). Negativa år = f.Kr.
export interface Epoch { key: string; label: string; from: number; to: number }
export const EPOCHS: Epoch[] = [
  { key: 'all', label: 'Alla epoker', from: -13000, to: 2000 },
  { key: 'stenalder', label: 'Stenålder', from: -13000, to: -1700 },
  { key: 'bronsalder', label: 'Bronsålder', from: -1700, to: -500 },
  { key: 'jarnalder', label: 'Järnålder', from: -500, to: 1050 },
  { key: 'vikingatid', label: 'Vikingatid', from: 793, to: 1066 },
  { key: 'medeltid', label: 'Medeltid', from: 1050, to: 1520 },
];

let epochKey = 'all';
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setEpoch = (key: string) => { epochKey = key; listeners.forEach((l) => l()); };
export const getEpochKey = () => epochKey;
export const useTimeEpoch = () => useSyncExternalStore(subscribe, getEpochKey);
export const epochRange = (key: string): Epoch => EPOCHS.find((e) => e.key === key) ?? EPOCHS[0];
