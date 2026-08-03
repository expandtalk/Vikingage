import { useSyncExternalStore } from 'react';

// Billäge: en global map-first-flagga. Slås på när Near me står i "Kör" (bil) + är öppet.
// Sidan (Explore) och kartlagren läser den för att strippa forsknings-chrome (breadcrumb,
// tidslinje, händelselinje, AI-analys, intresse-knapp, footer) och maximera kartan medan
// man kör. Extern store enligt samma mönster som useNearMe/useRoadtrip.
let on = false;
const listeners = new Set<() => void>();
export const setDrivingMode = (v: boolean) => { if (on !== v) { on = v; listeners.forEach((l) => l()); } };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useDrivingMode = () => useSyncExternalStore(subscribe, () => on, () => on);
