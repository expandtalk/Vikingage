import { useSyncExternalStore } from 'react';

// Delad "spotlight" för ett valt ortnamnsled på kartan (2c). Kartlagret sätter antalet
// efter laddning; kontrollen visar led + antal + stäng.
interface Spot { key: string | null; count: number }
let state: Spot = { key: null, count: 0 };
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const setSpotlight = (s: Spot) => { state = s; listeners.forEach((l) => l()); };
export const useElementSpotlight = () => useSyncExternalStore(subscribe, () => state);
