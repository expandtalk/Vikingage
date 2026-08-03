import { useSyncExternalStore } from 'react';
import type { RouteResult } from '@/services/routing';

// Roadtrip-läge (bil): skriv ett mål → geokoda → rita bilrutt. Extern store enligt samma
// mönster som useNearMe/useRuler: store ⇄ kart-hook (useMapRoadtrip ritar rutt+målmarkör) ⇄
// kontroll-UI (NearMeControl bil-läge). Målet är en referensrutt, inte turn-by-turn-navigering.
export interface RoadtripDest { lat: number; lng: number; label: string }
type Status = 'idle' | 'searching' | 'done' | 'error';
interface State { dest: RoadtripDest | null; route: RouteResult | null; status: Status; error: string | null }

let state: State = { dest: null, route: null, status: 'idle', error: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setRoadtripSearching = () => { state = { ...state, status: 'searching', error: null }; emit(); };
export const setRoadtripResult = (dest: RoadtripDest, route: RouteResult) => { state = { dest, route, status: 'done', error: null }; emit(); };
export const setRoadtripError = (error: string) => { state = { ...state, status: 'error', error }; emit(); };
export const clearRoadtrip = () => { state = { dest: null, route: null, status: 'idle', error: null }; emit(); };

export const useRoadtrip = () => useSyncExternalStore(subscribe, () => state);
