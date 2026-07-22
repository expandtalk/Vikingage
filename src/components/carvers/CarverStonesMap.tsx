import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/contexts/LanguageContext';

interface CarverStone {
  id: string;
  signum: string;
  location: string | null;
  coordinates: { lat: number; lng: number } | null;
}

interface CarverStonesMapProps {
  inscriptions: { inscription: CarverStone }[];
  onStoneClick?: (inscription: CarverStone) => void;
}

/** Karta över de enskilda stenar en ristare gjort (koordinater ur get_carver_inscriptions). */
export const CarverStonesMap: React.FC<CarverStonesMapProps> = ({ inscriptions, onStoneClick }) => {
  const { language } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<L.LayerGroup>(new L.LayerGroup());

  const stones = inscriptions
    .map((ci) => ci.inscription)
    .filter((i) => i?.coordinates && typeof i.coordinates.lat === 'number' && typeof i.coordinates.lng === 'number');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { preferCanvas: true, center: [59.5, 16.5], zoom: 5, scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current.addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layerRef.current.clearLayers();
    const pts: [number, number][] = [];
    for (const s of stones) {
      const { lat, lng } = s.coordinates!;
      pts.push([lat, lng]);
      const m = L.circleMarker([lat, lng], {
        radius: 7, color: '#b45309', fillColor: '#f59e0b', fillOpacity: 0.8, weight: 2,
      }).bindPopup(`<strong>${s.signum}</strong>${s.location ? `<br/>${s.location}` : ''}`);
      if (onStoneClick) m.on('click', () => onStoneClick(s));
      layerRef.current.addLayer(m);
    }
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 11 });
    setTimeout(() => map.invalidateSize(), 100);
  }, [inscriptions, onStoneClick]);

  if (stones.length === 0) {
    return (
      <div className="text-sm text-slate-400 py-4 text-center">
        {language === 'en' ? 'No stones with coordinates to map.' : 'Inga stenar med koordinater att visa på karta.'}
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">
        {stones.length} {language === 'en' ? 'stones on the map' : 'stenar på kartan'}
      </div>
      <div ref={containerRef} className="w-full h-[360px] rounded-lg overflow-hidden border border-white/10" />
    </div>
  );
};
