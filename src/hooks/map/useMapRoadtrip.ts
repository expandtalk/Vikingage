import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useRoadtrip } from '@/hooks/useRoadtrip';

// Ritar roadtrip-lagret: bilrutten (casing + linje) och en målmarkör. Läser store; ritar
// inget förrän en rutt finns. Zoomar EN gång så hela rutten ryms (fitRef-vakt → inte varje
// render, så användaren kan panorera fritt efteråt).
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const flagIcon = (label: string) => L.divIcon({
  className: 'roadtrip-flag',
  html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="background:#2563eb;color:#fff;font-size:11px;font-weight:600;padding:2px 7px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.4);max-width:160px;overflow:hidden;text-overflow:ellipsis">🏁 ${esc(label)}</div>
      <div style="width:2px;height:12px;background:#2563eb"></div>
    </div>`,
  iconSize: [0, 0], iconAnchor: [0, 26],
});

export const useMapRoadtrip = ({ map, isMapReady }: Props) => {
  const { dest, route } = useRoadtrip();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fitRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!route || !dest) { fitRef.current = null; return; }

    L.polyline(route.coords, { color: '#0f172a', weight: 8, opacity: 0.35, lineJoin: 'round' }).addTo(layer);
    L.polyline(route.coords, { color: '#2563eb', weight: 4, opacity: 0.95, lineJoin: 'round' }).addTo(layer);
    L.marker([dest.lat, dest.lng], { icon: flagIcon(dest.label) }).addTo(layer);

    const key = `${dest.lat.toFixed(4)},${dest.lng.toFixed(4)}:${route.coords.length}`;
    if (fitRef.current !== key) {
      fitRef.current = key;
      try { map.flyToBounds(L.latLngBounds(route.coords), { padding: [50, 50], maxZoom: 13, duration: 0.8 }); } catch { /* noop */ }
    }
    return () => { layer.clearLayers(); };
  }, [map, isMapReady, dest, route]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); } catch { /* noop */ }
  }, [map]);
};
