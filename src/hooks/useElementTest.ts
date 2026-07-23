import { useSyncExternalStore } from 'react';

// Delad "testgrupp"-signal: en ordlista i /place-names kan förfylla hypotes-testet
// (FreeDistanceStatsCard) med ett valt namnled via "Analysera denna grupp"-knappen.
let elements: string[] = [];
let seq = 0; // ökar varje gång → kortet vet att det ska synka även om samma led väljs igen
const listeners = new Set<() => void>();
const snap = () => seq; // primitiv snapshot (loop-säker)

export const setElementTest = (els: string[]) => {
  elements = els;
  seq += 1;
  listeners.forEach((l) => l());
};
export const getElementTest = () => elements;

export const useElementTestSeq = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, snap);
