import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useRuler, addRulerPoint, rulerKm } from '@/hooks/useRuler';
import { setProbe, setProbeRadiusKm } from '@/hooks/useProximityProbe';

// Ritar linjalens punkter + linje + avstånd, och fångar kartklick när linjalen är aktiv.
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }

// Klick på linjen (eller dess mittetikett) → räckvidds-sond i mittpunkten,
// radie = halva sträckan (så formen spänner mellan punkterna).
const lineToProbe = (a: { lat: number; lng: number }, b: { lat: number; lng: number }, km: number) => {
  setProbe((a.lat + b.lat) / 2, (a.lng + b.lng) / 2, `Linjal-område (${km.toFixed(1)} km)`);
  setProbeRadiusKm(Math.max(1, Math.round(km / 2)));
};

export const useMapRuler = ({ map, isMapReady }: Props) => {
  const { active, pts } = useRuler();
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Klick-lyssnare på/av med linjalläget.
  useEffect(() => {
    if (!map) return;
    const onClick = (e: L.LeafletMouseEvent) => addRulerPoint(e.latlng.lat, e.latlng.lng);
    if (active) {
      map.on('click', onClick);
      const el = map.getContainer(); if (el) el.style.cursor = 'crosshair';
    }
    return () => {
      map.off('click', onClick);
      const el = map.getContainer(); if (el) el.style.cursor = '';
    };
  }, [map, active]);

  // Rita punkter/linje/avstånd.
  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!active || pts.length === 0) return;
    pts.forEach((p) => L.circleMarker([p.lat, p.lng], { radius: 5, color: '#1e293b', weight: 2, fillColor: '#f59e0b', fillOpacity: 1 }).addTo(layer));
    if (pts.length === 2) {
      const km = rulerKm(pts[0], pts[1]);
      const toProbe = (e: L.LeafletMouseEvent) => { L.DomEvent.stop(e); lineToProbe(pts[0], pts[1], km); };
      L.polyline([[pts[0].lat, pts[0].lng], [pts[1].lat, pts[1].lng]], { color: '#f59e0b', weight: 2, dashArray: '6 4' })
        .bindTooltip('Klicka på linjen → gör hypotes-område', { direction: 'top', sticky: true })
        .on('click', toProbe)
        .addTo(layer);
      const mid: [number, number] = [(pts[0].lat + pts[1].lat) / 2, (pts[0].lng + pts[1].lng) / 2];
      L.marker(mid, {
        icon: L.divIcon({
          className: 'ruler-label',
          html: `<div style="background:#78350f;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer">${km.toFixed(1)} km</div>`,
          iconSize: [0, 0] as any, iconAnchor: [0, 0],
        }),
      }).on('click', toProbe).addTo(layer);
    }
    return () => { layer.clearLayers(); };
  }, [map, isMapReady, active, pts]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
