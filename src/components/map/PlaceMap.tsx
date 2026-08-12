import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapLegend } from './MapLegend';
import { useMapLegendState, type LegendLayerDef } from '@/hooks/map/useMapLegendState';

// Återanvändbar rik platskarta för ALLA orter. Driven av EN RPC (place_features_near) som ger
// kronologiskt kategoriserade punkter runt en center. Delad MapLegend (kronologisk ordning) +
// alla Leaflet-fixar (global leaflet.css, ResizeObserver + invalidateSize mot 0-bredd-init).
// KOMPONERBAR: onMapReady ger föräldern kart-instansen så kurerade sidor (Öland m.fl.) kan rita
// egna special-lager ovanpå (Köpingsvik-hub, vindled, Voronoi) utan att förlora baskartan.

interface PlaceFeature {
  layer: string; id: string; name: string | null;
  lat: number; lng: number; sublabel: string | null; source: string;
}

// Kronologisk lagerdefinition (ordning = legendens ordning). Nyckeln MÅSTE matcha place_features_near.
const LAYERS: { key: string; label: string; color: string; radius: number; defaultOn: boolean }[] = [
  { key: 'megalit',     label: 'Megalitgravar & stensättningar', color: '#a78bfa', radius: 4,   defaultOn: true },
  { key: 'hallristning',label: 'Hällristningar (bronsålder)',    color: '#fb923c', radius: 3,   defaultOn: true },
  { key: 'rest_sten',   label: 'Resta stenar',                   color: '#cbd5e1', radius: 3,   defaultOn: false },
  { key: 'grotta',      label: 'Grottor',                        color: '#9ca3af', radius: 3,   defaultOn: false },
  { key: 'runsten',     label: 'Runstenar',                      color: '#f59e0b', radius: 4.5, defaultOn: true },
  { key: 'bildsten',    label: 'Bildstenar',                     color: '#eab308', radius: 4.5, defaultOn: true },
  { key: 'mynt',        label: 'Myntfynd',                       color: '#fbbf24', radius: 3.5, defaultOn: true },
  { key: 'offer',       label: 'Offer- & kultplatser',           color: '#34d399', radius: 3.5, defaultOn: true },
  { key: 'kristen',     label: 'Kristna platser',                color: '#38bdf8', radius: 4.5, defaultOn: true },
  { key: 'kyrka',       label: 'Kyrkor',                         color: '#0ea5e9', radius: 4.5, defaultOn: true },
  { key: 'avrattning',  label: 'Avrättningsplatser',             color: '#ef4444', radius: 4,   defaultOn: false },
  { key: 'fornlamning', label: 'Fornlämningar (övrigt)',         color: '#64748b', radius: 2.5, defaultOn: false },
];
const STYLE = Object.fromEntries(LAYERS.map((l) => [l.key, l]));

interface PlaceMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  radiusM?: number;
  heightClass?: string;                 // t.ex. "h-[520px]"
  extraDefs?: LegendLayerDef[];         // kurerad sida lägger till egna legend-poster
  onMapReady?: (map: L.Map, enabled: Record<string, boolean>) => void;
  legendPlacement?: 'overlay' | 'inline'; // 'inline' = legend under kartan (smal aside, täcker ej kartan)
}

export const PlaceMap: React.FC<PlaceMapProps> = ({
  center, zoom = 11, radiusM = 25000, heightClass = 'h-[520px]', extraDefs = [], onMapReady,
  legendPlacement = 'overlay',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const groupRef = useRef<L.LayerGroup | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const readyRef = useRef(false);

  const defs = useMemo<LegendLayerDef[]>(() => [
    ...LAYERS.map((l) => ({ key: l.key, label: l.label, color: l.color, group: 'layer' as const, defaultOn: l.defaultOn })),
    ...extraDefs,
    { key: 'osm', label: 'Baskarta (OSM)', color: '#64748b', group: 'basemap' as const, defaultOn: true },
  ], [extraDefs]);
  const { enabled, toggle } = useMapLegendState(defs);

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
    tileRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
    groupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    roRef.current = new ResizeObserver(() => { try { map.invalidateSize(); } catch { /* noop */ } });
    roRef.current.observe(containerRef.current);
    [60, 250, 600, 1200].forEach((d) => setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, d));
    if (!readyRef.current) { readyRef.current = true; onMapReady?.(map, enabled); }
    return () => {
      try { roRef.current?.disconnect(); } catch { /* noop */ }
      map.remove(); mapRef.current = null; groupRef.current = null; tileRef.current = null; readyRef.current = false;
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
      L.circleMarker([f.lat, f.lng], {
        radius: s.radius, color: '#0f172a', weight: 0.8, fillColor: s.color, fillOpacity: 0.85,
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
