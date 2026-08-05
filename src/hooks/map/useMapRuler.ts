import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useRuler, addRulerPoint, updateRulerPoint, rulerKm, rulerCumKm } from '@/hooks/useRuler';
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
  const { active, mode, pts } = useRuler();
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
    // Egen hög pane så linjalens punkter/linje ALLTID tar klick — annars kapar medaljong-
    // markörerna (marker-panen) klicket. Pane-nivå z 680 (över tooltip 650, under popup 700)
    // slår hela marker-panen oavsett enskilda markörers z-index. Skapas en gång.
    if (!map.getPane('rulerPane')) {
      map.createPane('rulerPane');
      const p = map.getPane('rulerPane');
      if (p) p.style.zIndex = '680';
    }
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();
    if (!active || pts.length === 0) return;
    // Draggbara mätpunkter — justera sträckan utan att rensa och klicka om.
    const ptIcon = L.divIcon({ className: 'ruler-pt', html: '<span style="display:block;width:13px;height:13px;border-radius:50%;background:#f59e0b;border:2px solid #1e293b;box-shadow:0 0 3px rgba(0,0,0,.6);cursor:grab"></span>', iconSize: [13, 13], iconAnchor: [7, 7] });
    pts.forEach((p, i) => {
      const m = L.marker([p.lat, p.lng], { draggable: true, icon: ptIcon, zIndexOffset: 1000, pane: 'rulerPane' })
        .bindTooltip('Dra för att justera', { direction: 'top' })
        .addTo(layer);
      m.on('dragend', () => { const ll = m.getLatLng(); updateRulerPoint(i, ll.lat, ll.lng); });
    });
    const kmLabel = (km: number) => L.divIcon({
      className: 'ruler-label',
      html: `<div style="background:#78350f;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer">${km.toFixed(1)} km</div>`,
      iconSize: [0, 0] as unknown as L.PointExpression, iconAnchor: [0, 0],
    });

    if (mode === 'path' && pts.length >= 2) {
      // Sträckläge: bana genom alla vertexer + kumulativ km-etikett vid varje punkt
      // (motsvarar tavlans 0–2–4–…-skala). Total längd visas i linjalpanelen.
      const cum = rulerCumKm(pts);
      L.polyline(pts.map((p) => [p.lat, p.lng] as [number, number]), { color: '#f59e0b', weight: 2, pane: 'rulerPane' }).addTo(layer);
      pts.forEach((p, i) => {
        if (i === 0) return; // startpunkt = 0 km, ingen etikett behövs
        L.marker([p.lat, p.lng], { icon: kmLabel(cum[i]), interactive: false, pane: 'rulerPane' }).addTo(layer);
      });
    } else if (mode === 'simple' && pts.length === 2) {
      const km = rulerKm(pts[0], pts[1]);
      const toProbe = (e: L.LeafletMouseEvent) => { L.DomEvent.stop(e); lineToProbe(pts[0], pts[1], km); };
      L.polyline([[pts[0].lat, pts[0].lng], [pts[1].lat, pts[1].lng]], { color: '#f59e0b', weight: 2, dashArray: '6 4', pane: 'rulerPane' })
        .bindTooltip('Klicka på linjen → gör hypotes-område', { direction: 'top', sticky: true })
        .on('click', toProbe)
        .addTo(layer);
      const mid: [number, number] = [(pts[0].lat + pts[1].lat) / 2, (pts[0].lng + pts[1].lng) / 2];
      L.marker(mid, { icon: kmLabel(km), pane: 'rulerPane' }).on('click', toProbe).addTo(layer);
    }
    return () => { layer.clearLayers(); };
  }, [map, isMapReady, active, mode, pts]);

  useEffect(() => () => {
    try { if (layerRef.current && map?.hasLayer(layerRef.current)) map.removeLayer(layerRef.current); }
    catch { /* noop */ }
  }, [map]);
};
