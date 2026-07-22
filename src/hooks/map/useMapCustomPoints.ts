import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCustomPoints } from '@/hooks/useCustomPoints';

// Ritar användarens egna punkter (localStorage) på kartan. Popup: analysera 9 km-hexagon
// (Agnetas tes) via window-hooken. Alltid synligt när punkter finns — inget legend-gate.
interface Props { map: L.Map | null; isMapReady: React.RefObject<boolean> }
const esc = (s: unknown) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export const useMapCustomPoints = ({ map, isMapReady }: Props) => {
  const layerRef = useRef<L.LayerGroup | null>(null);
  const points = useCustomPoints();

  useEffect(() => {
    if (!map || !isMapReady.current) return;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    points.forEach((p) => {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
      L.marker([p.lat, p.lng], {
        icon: L.divIcon({
          className: 'my-point',
          html: `<div style="font-size:20px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))">📍</div>`,
          iconSize: [20, 20], iconAnchor: [10, 20],
        }),
      }).bindPopup(
        `<div style="min-width:170px">
           <strong>${esc(p.name)}</strong>
           <div style="font-size:11px;color:#64748b">min punkt · ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
           ${p.note ? `<div style="font-size:11px;color:#475569;margin-top:2px">${esc(p.note)}</div>` : ''}
           <button onclick='window.analyzeAgneta9km(${p.lat},${p.lng},${JSON.stringify(p.name)})'
             style="margin-top:6px;width:100%;padding:5px;background:#d97706;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">
             ⬡ Analysera 9 km
           </button>
         </div>`,
        { maxWidth: 240 },
      ).addTo(layer);
    });
  }, [map, isMapReady, points]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
