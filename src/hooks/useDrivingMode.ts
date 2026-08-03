import { useSyncExternalStore } from 'react';

// Billäge: en global map-first-flagga. Slås på när Near me står i "Kör" (bil) + är öppet.
// Sidan (Explore) och kartlagren läser den för att strippa forsknings-chrome (breadcrumb,
// tidslinje, händelselinje, AI-analys, intresse-knapp, footer) och maximera kartan medan
// man kör. `courseUp` = kartan roterar så färdriktningen pekar uppåt (navigator-läge); kan
// stängas av (norr-upp) för den som blir desorienterad. Extern store, samma mönster som useNearMe.
let driving = false;
let courseUp = true; // default på i billäge; togglas i NearMeControl
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setDrivingMode = (v: boolean) => { if (driving !== v) { driving = v; emit(); } };
export const setCourseUp = (v: boolean) => { if (courseUp !== v) { courseUp = v; emit(); } };

export const useDrivingMode = () => useSyncExternalStore(subscribe, () => driving, () => driving);
export const useCourseUp = () => useSyncExternalStore(subscribe, () => courseUp, () => courseUp);
