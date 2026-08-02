// src/hooks/useFieldNav.ts
import { useSyncExternalStore } from 'react';
import type { HeadingSource } from '@/utils/fieldNav';

// Fältlägets live-position (steg 1: bil/vägföljning). Samma store-mönster som useNearMe.
// Till skillnad från Near me (ögonblicksbild) är detta ETT AKTIVT läge med kontinuerlig
// följning — men bara medan `active` är sant; useFieldNavGeolocation river följningen annars.
export interface FieldNavPos {
  lat: number; lng: number; accuracy: number;
  headingDeg: number | null; headingSource: HeadingSource; speed: number | null;
}
interface State {
  active: boolean;
  pos: FieldNavPos | null;
  following: boolean; // kartan pannar med mig; AV när användaren själv dragit kartan
  error: string | null;
}
let state: State = { active: false, pos: null, following: true, error: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const startFieldNav = () => { state = { active: true, pos: null, following: true, error: null }; emit(); };
export const stopFieldNav = () => { state = { active: false, pos: null, following: true, error: null }; emit(); };
export const setFieldNavPos = (pos: FieldNavPos) => { state = { ...state, pos, error: null }; emit(); };
export const setFieldNavError = (error: string) => { state = { ...state, error }; emit(); };
export const setFieldNavFollowing = (following: boolean) => {
  if (state.following === following) return; // undvik onödig emit/re-render
  state = { ...state, following }; emit();
};

export const getFieldNavSnapshot = () => state;
export const useFieldNav = () => useSyncExternalStore(subscribe, getFieldNavSnapshot);
