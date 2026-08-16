import React, { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapLegend } from './MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';
import { resolvePlaceLayers, placeLayerStyleMap, type PlaceLayerConfig } from './placeLayers';
import { useProgressiveAdmin } from '@/hooks/map/useProgressiveAdmin';
import { OSM_BASEMAP, leafletTileOptions } from '@/config/basemaps';

// Återanvändbar rik platskarta för ALLA orter. Driven av EN RPC (place_features_near) som ger
// kronologiskt kategoriserade punkter runt en center. Delad MapLegend (kronologisk ordning) +
// alla Leaflet-fixar (global leaflet.css, ResizeObserver + invalidateSize mot 0-bredd-init).
// KOMPONERBAR: onMapReady ger föräldern kart-instansen så kurerade sidor (Öland m.fl.) kan rita
// egna special-lager ovanpå (Köpingsvik-hub, vindled, Voronoi) utan att förlora baskartan.

interface PlaceFeature {
  layer: string; id: string; name: string | null;
  lat: number; lng: number; sublabel: string | null; source: string;
}

interface PlaceMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  radiusM?: number;
  heightClass?: string;                 // t.ex. "h-[520px]"
  extraDefs?: LegendLayerDef[];         // kurerad sida lägger till egna legend-poster
  onMapReady?: (map: L.Map, enabled: Record<string, boolean>) => void;
  legendPlacement?: 'overlay' | 'inline'; // 'inline' = legend under kartan (smal aside, täcker ej kartan)
  layers?: PlaceLayerConfig[];          // baslager (default DEFAULT_PLACE_LAYERS) — se ./placeLayers
  onEnabledChange?: (enabled: Record<string, boolean>) => void; // legend-toggles ändrade
  progressiveAdmin?: boolean;           // zoom-progressivt admin-lager (landskap→kommun→socken/stad)
}

export const PlaceMap: React.FC<PlaceMapProps> = ({
  center, zoom = 11, radiusM = 25000, heightClass = 'h-[520px]', extraDefs = [], onMapReady,
  legendPlacement = 'overlay', layers, onEnabledChange, progressiveAdmin = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const groupRef = useRef<L.LayerGroup | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const readyRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const activeLayers = useMemo(() => resolvePlaceLayers(layers), [layers]);
  const STYLE = useMemo(() => placeLayerStyleMap(activeLayers), [activeLayers]);

  const defs = useMemo<LegendLayerDef[]>(() => [
    ...activeLayers.map((l) => ({ key: l.key, label: l.label, color: l.color, group: 'layer' as const, defaultOn: l.defaultOn })),
    ...extraDefs,
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap' as const, defaultOn: true },
  ], [activeLayers, extraDefs]);
  const { enabled, toggle } = useMapLegendState(defs);

  useEffect(() => { onEnabledChange?.(enabled); }, [enabled, onEnabledChange]);

  // Zoom-progressivt admin-lager (landskap→kommun→socken/stad). Aktiveras när kartan är redo.
  useProgressiveAdmin(mapRef, progressiveAdmin && mapReady);

  const { data: features = [] } = useQuery({
    queryKey: ['place-features-near', center.lat, center.lng, radiusM],
    enabled: Number.isFinite(center?.lat) && Number.isFinite(center?.lng),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PlaceFeature[]> => {
      const { data, error } = await (supabase as any).rpc('place_features_near', {
        p_lat: center.lat, p_lng: center.lng, p_radius_m: radiusM,
      });
      if (error) throw error;
      return (data ?? []) as PlaceFeature[];
    },
  });

  // Init EN gång. leaflet.css är global (main.tsx); RO + fördröjda invalidateSize mot 0-bredd-init.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [center.lat, center.lng], zoom, scrollWheelZoom: true });
    // Baskarta ur central config (OSM idag; förberedd för Lantmäteri topo när VITE_LM_TOPO_* finns).
    const bm = leafletTileOptions(OSM_BASEMAP);
    tileRef.current = L.tileLayer(bm.url, bm.options).addTo(map);
    groupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    roRef.current = new ResizeObserver(() => { try { map.invalidateSize(); } catch { /* noop */ } });
    roRef.current.observe(containerRef.current);
    [60, 250, 600, 1200].forEach((d) => setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, d));
    if (!readyRef.current) { readyRef.current = true; onMapReady?.(map, enabled); }
    setMapReady(true);
    return () => {
      try { roRef.current?.disconnect(); } catch { /* noop */ }
      map.remove(); mapRef.current = null; groupRef.current = null; tileRef.current = null; readyRef.current = false;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Center ändras (annan ort) → panorera om.
  useEffect(() => {
    if (mapRef.current && Number.isFinite(center?.lat) && Number.isFinite(center?.lng)) {
      mapRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // Baskarta på/av.
  useEffect(() => {
    const map = mapRef.current, tile = tileRef.current;
    if (!map || !tile) return;
    if (enabled.osm) { if (!map.hasLayer(tile)) tile.addTo(map); }
    else if (map.hasLayer(tile)) map.removeLayer(tile);
  }, [enabled.osm]);

  // Punkter — filtrerade per lager i legenden.
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    g.clearLayers();
    for (const f of features) {
      if (!enabled[f.layer]) continue;
      const s = STYLE[f.layer] ?? { color: '#94a3b8', radius: 3 };
      // "Fornlämningar (övrigt)" är tätt (400 kring Göteborg) → rita som svag bakgrundstextur
      // så det inte dränker de kuraterade lagren men ändå markeras (Daniel).
      const subtle = f.layer === 'fornlamning';
      L.circleMarker([f.lat, f.lng], {
        radius: s.radius, color: '#0f172a', weight: subtle ? 0.4 : 0.8, fillColor: s.color, fillOpacity: subtle ? 0.45 : 0.85,
      })
        .bindPopup(`<b>${f.name ?? ''}</b>${f.sublabel ? `<br/><span style="font-size:11px;color:#666">${f.sublabel}</span>` : ''}`)
        .addTo(g);
    }
  }, [features, enabled]);

  return (
    <div className={legendPlacement === 'inline' ? '' : 'relative'}>
      <div ref={containerRef} className={`w-full ${heightClass} rounded-lg overflow-hidden border border-border`} style={{ minHeight: 360 }} />
      <MapLegend defs={defs} enabled={enabled} onToggle={toggle} mapRef={mapRef} title="Lager (kronologiskt)" placement={legendPlacement} />
    </div>
  );
};
