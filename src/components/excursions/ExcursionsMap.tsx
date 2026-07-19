import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EXCURSIONS } from '@/data/excursions';
import { RELIGIOUS_PLACES } from '@/utils/religiousLocations/religiousPlacesData';
import { ARCHAEOLOGICAL_FINDS } from '@/utils/archaeologicalFinds';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExcursionsMapProps {
  /** Called when an excursion marker is clicked (id of the excursion). */
  onSelect?: (id: string) => void;
}

/**
 * Översiktskarta för utflyktssidan: utflyktsmål (orange) ovanpå ett kontextlager
 * av kultplatser/kyrkor/källor (blå) och arkeologiska fynd (bärnsten).
 * Imperativ Leaflet, samma mönster som CarversMap (undviker react-leaflet-versionskrångel).
 */
export const ExcursionsMap: React.FC<ExcursionsMapProps> = ({ onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const { language } = useLanguage();
  const sv = language === 'sv';

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      preferCanvas: true,
      center: [58.6, 16.3],
      zoom: 5,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Kontextlager: kultplatser/kyrkor/källor
    RELIGIOUS_PLACES.forEach((p) => {
      L.circleMarker([p.coordinates.lat, p.coordinates.lng], {
        radius: 3,
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.5,
      })
        .bindPopup(`<b>${p.name}</b><br/><span style="font-size:11px;color:#666">${p.type}</span>`)
        .addTo(map);
    });

    // Kontextlager: arkeologiska fynd
    ARCHAEOLOGICAL_FINDS.forEach((f) => {
      L.circleMarker([f.lat, f.lng], {
        radius: 3,
        color: '#d97706',
        weight: 1,
        fillColor: '#d97706',
        fillOpacity: 0.5,
      })
        .bindPopup(`<b>${sv ? f.name : f.nameEn}</b><br/><span style="font-size:11px;color:#666">${f.findType}</span>`)
        .addTo(map);
    });

    // Utflyktsmål ovanpå
    EXCURSIONS.forEach((e) => {
      const icon = L.divIcon({
        html: `<div style="
          background:#ea580c;
          width:24px;height:24px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:2px solid white;
          box-shadow:0 2px 5px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        "><span style="transform:rotate(45deg);font-size:12px">⚑</span></div>`,
        className: 'excursion-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -22],
      });
      const marker = L.marker([e.coords.lat, e.coords.lng], { icon, zIndexOffset: 1000 }).addTo(map);
      marker.bindPopup(
        `<div style="min-width:180px">
          <b style="font-size:13px">${e.name}</b><br/>
          <span style="font-size:11px;color:#666">${e.region} · ${e.period}</span>
        </div>`,
      );
      marker.on('click', () => onSelectRef.current?.(e.id));
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Init once; onSelect is read through a ref so it stays current without re-init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] rounded-lg overflow-hidden border border-border"
      style={{ minHeight: 420 }}
    />
  );
};
