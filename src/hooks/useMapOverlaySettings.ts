import { useSyncExternalStore } from 'react';
import type { BasemapId } from '@/config/exploreCapabilities';
import { HISTORICAL_MAP_LAYERS } from '@/config/historicalMapLayers';

// Extern store (samma mönster som useNearMe) för "Kartor"-sektionen:
//  - basemapOverride: användarens val av bakgrundskarta (null = använd profilens default)
//  - opacity: per historisk karta (0..1)
//  - tone: per historisk karta ('color' | 'grayscale') — gråskala = lugn kalkerpappers-referens
// Konsumeras av useMapInitialization (basemap), useMapHistoricalOverlays (opacitet/ton) och MapsControl.
export type MapTone = 'color' | 'grayscale';

interface State {
  basemapOverride: BasemapId | null;
  opacity: Record<string, number>;
  tone: Record<string, MapTone>;
}

const defaultOpacity: Record<string, number> = Object.fromEntries(
  HISTORICAL_MAP_LAYERS.map((c) => [c.key, c.opacity]),
);

let state: State = { basemapOverride: null, opacity: { ...defaultOpacity }, tone: {} };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const setBasemapOverride = (b: BasemapId | null) => { state = { ...state, basemapOverride: b }; emit(); };
export const setMapOpacity = (key: string, v: number) => { state = { ...state, opacity: { ...state.opacity, [key]: v } }; emit(); };
export const setMapTone = (key: string, t: MapTone) => { state = { ...state, tone: { ...state.tone, [key]: t } }; emit(); };

// Icke-hook-getter för kart-hooks som behöver aktuella värden vid lager-skapande utan att prenumerera.
export const getMapOverlaySettings = () => state;
export const useMapOverlaySettings = () => useSyncExternalStore(subscribe, () => state);
