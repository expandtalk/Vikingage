import { useSyncExternalStore } from 'react';

// Delad "klusterfall"-signal: prova-exemplen i /sv/ortnamn kan välja ett fördefinierat fall
// (t.ex. Sandby borg → -by) i OnomasticClusterCard via en klickbar exempel-knapp.
let caseId = '';
let seq = 0; // ökar varje gång → kortet synkar även om samma fall väljs igen
const listeners = new Set<() => void>();
const snap = () => seq;

export const setClusterCase = (id: string) => {
  caseId = id;
  seq += 1;
  listeners.forEach((l) => l());
};
export const getClusterCase = () => caseId;

export const useClusterCaseSeq = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, snap);
