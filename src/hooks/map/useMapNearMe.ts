import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNearMe } from '@/hooks/useNearMe';

// Ritar "Near me"-lagret på kartan: min position (blå prick + noggrannhetsring),
// sökradie-cirkel och träffmarkörer. Läser store; ritar inget förrän position finns.
// Exponerar window.__nearMeFlyTo så listan i kontrollen kan flyga till ett objekt.
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dist = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export const useMapNearMe = ({ map, isMapReady }: Props) => {
  const { open, pos, radiusKm, results } = useNearMe();
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Flyg-till + öppna popup (VAR + VAD) för listobjekt (används av NearMeControl).
  useEffect(() => {
    if (!map) return;
    (window as unknown as { __nearMeFlyTo?: (a: number, b: number, label?: string, type?: string, dist?: string) => void }).__nearMeFlyTo =
      (lat, lng, label, type, dist) => {
        try {
          map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
          if (label) {
            L.popup({ offset: [0, -6] }).setLatLng([lat, lng])
              .setContent(`<strong>${esc(label)}</strong>${type ? `<br/><span style="font-size:11px;color:#666">${esc(type)}${dist ? ' · ' + esc(dist) : ''}</span>` : ''}`)
              .openOn(map);
          }
        } catch { /* noop */ }
      };
    return () => { try { delete (window as unknown as { __nearMeFlyTo?: unknown }).__nearMeFlyTo; } catch { /* noop */ } };
  }, [map]);

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!open || !pos) return;

    // Sökradie (visar området listan täcker)
    L.circle([pos.lat, pos.lng], { radius: radiusKm * 1000, color: '#38bdf8', weight: 1, fillColor: '#38bdf8', fillOpacity: 0.06 }).addTo(layer);
    // GPS-noggrannhetsring
    if (pos.accuracy) L.circle([pos.lat, pos.lng], { radius: pos.accuracy, color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.12, dashArray: '4 3' }).addTo(layer);
    // Min position
    L.circleMarker([pos.lat, pos.lng], { radius: 7, color: '#ffffff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 })
      .bindTooltip('Du är här', { direction: 'top' }).addTo(layer);
    // Träffmarkörer
    (results ?? []).forEach((f) => {
      L.circleMarker([f.lat, f.lng], { radius: 5, color: '#0c4a6e', weight: 1, fillColor: '#22d3ee', fillOpacity: 0.9 })
        .bindPopup(`<strong>${esc(f.label)}</strong><br/><span style="font-size:11px;color:#666">${esc(f.feature_type)} · ${dist(f.distance_km)}</span>`)
        .addTo(layer);
    });
    return () => { layer.clearLayers(); };
  }, [map, isMapReady, open, pos, radiusKm, results]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
