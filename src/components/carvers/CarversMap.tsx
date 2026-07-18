import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ZoomIn, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Fix för Leaflet ikoner
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Carver {
  id: string;
  name: string;
  region?: string;
  country?: string;
  period_active_start?: number;
  period_active_end?: number;
  inscriptionCount: number;
  signedCount: number;
  attributedCount: number;
  description?: string;
}

interface CarversMapProps {
  carvers: Carver[];
  onCarverClick?: (carver: Carver) => void;
  highlightedCarver?: { id: string } | null;
}

// Create approximate coordinates for Swedish regions and some other known locations
const getRegionCoordinates = (region?: string, country?: string): [number, number] | null => {
  if (!region && !country) return null;
  
  const coordinates: Record<string, [number, number]> = {
    // Swedish regions
    'uppland': [59.85, 17.65],
    'södermanland': [59.20, 16.55],
    'östergötland': [58.40, 15.62],
    'västergötland': [58.20, 13.00],
    'småland': [57.00, 14.50],
    'öland': [56.70, 16.70],
    'gotland': [57.50, 18.50],
    'skåne': [55.70, 13.20],
    'halland': [56.50, 12.85],
    'blekinge': [56.16, 15.05],
    'bohuslän': [58.30, 11.50],
    'dalsland': [58.80, 12.30],
    'värmland': [59.80, 13.50],
    'närke': [59.20, 15.20],
    'västmanland': [59.60, 16.55],
    'dalarna': [60.60, 15.60],
    'gävleborg': [61.70, 17.15],
    'hälsingland': [61.60, 16.20],
    'jämtland': [63.18, 14.64],
    'härjedalen': [62.08, 13.84],
    'medelpad': [62.40, 17.30],
    'ångermanland': [63.25, 18.71],
    'västerbotten': [64.75, 20.95],
    'norrbotten': [67.85, 20.22],
    
    // Norwegian regions
    'norge': [60.47, 8.47],
    'norway': [60.47, 8.47],
    'vestfold': [59.40, 10.40],
    'akershus': [59.95, 11.05],
    'oslo': [59.91, 10.75],
    'buskerud': [60.20, 9.60],
    'telemark': [59.20, 8.60],
    'rogaland': [58.87, 6.15],
    'hordaland': [60.39, 6.33],
    'sogn og fjordane': [61.20, 6.70],
    'møre og romsdal': [62.73, 7.16],
    'sør-trøndelag': [63.43, 10.39],
    'nord-trøndelag': [64.46, 12.30],
    'nordland': [67.28, 14.40],
    'troms': [69.65, 18.96],
    'finnmark': [70.07, 25.48],
    
    // Danish regions
    'danmark': [56.26, 9.50],
    'denmark': [56.26, 9.50],
    'jylland': [56.15, 9.50],
    'jutland': [56.15, 9.50],
    'fyn': [55.40, 10.40],
    'sjælland': [55.68, 11.57],
    'bornholm': [55.13, 14.92],
    
    // Default coordinates
    'sverige': [62.00, 15.00],
    'sweden': [62.00, 15.00],
  };
  
  // Try region first, then country
  const key = region?.toLowerCase() || country?.toLowerCase() || '';
  return coordinates[key] || null;
};

export const CarversMap: React.FC<CarversMapProps> = ({
  carvers,
  onCarverClick,
  highlightedCarver
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const { language } = useLanguage();
  const sv = language === 'sv';
  const t = sv ? {
    title: 'Runristare karta',
    onMap: (a: number, b: number) => `${a} av ${b} på kartan`,
    showAll: 'Visa alla',
    stones: 'stenar',
    signed: 'signerade',
    unknownPlace: 'Okänd plats',
    legendTitle: 'Förklaring (antal ristade stenar):',
    s20: '20+ stenar', s10: '10-19 stenar', s5: '5-9 stenar', s2: '2-4 stenar', s1: '1 sten',
  } : {
    title: 'Carver map',
    onMap: (a: number, b: number) => `${a} of ${b} on the map`,
    showAll: 'Show all',
    stones: 'stones',
    signed: 'signed',
    unknownPlace: 'Unknown location',
    legendTitle: 'Legend (number of carved stones):',
    s20: '20+ stones', s10: '10-19 stones', s5: '5-9 stones', s2: '2-4 stones', s1: '1 stone',
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Scandinavia
    const map = L.map(mapContainerRef.current, {
      center: [60.0, 15.0], // Skandinavien
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Add markers layer group to map
    markersRef.current.addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Create custom marker for carver
  const createCarverMarker = (carver: Carver, isHighlighted: boolean = false) => {
    const coordinates = getRegionCoordinates(carver.region, carver.country);
    if (!coordinates) return null;

    const size = isHighlighted ? 45 : 35;
    const zIndex = isHighlighted ? 1000 : 100;
    
    // Color based on number of inscriptions
    let color = '#6b7280'; // gray
    if (carver.inscriptionCount >= 20) color = '#dc2626'; // red - very productive
    else if (carver.inscriptionCount >= 10) color = '#ea580c'; // orange - productive  
    else if (carver.inscriptionCount >= 5) color = '#d97706'; // amber - moderately productive
    else if (carver.inscriptionCount >= 2) color = '#059669'; // emerald - some work
    else color = '#0d9488'; // teal - minimal work

    const icon = L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid ${isHighlighted ? '#FFD700' : 'white'};
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.35}px;
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
          position: relative;
          z-index: ${zIndex};
        ">
          ${carver.inscriptionCount}
        </div>
      `,
      className: 'custom-carver-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });

    const marker = L.marker(coordinates, { icon });
    
    // Add popup
    const popupContent = `
      <div class="p-3 max-w-sm">
        <h3 class="font-bold text-base text-gray-800">${carver.name}</h3>
        <p class="text-sm text-gray-600 mt-1">${carver.inscriptionCount} ${t.stones} (${carver.signedCount} ${t.signed})</p>
        ${carver.description ? `<p class="text-xs text-gray-500 mt-2 italic">"${carver.description}"</p>` : ''}
        <div class="mt-2">
          <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            ${carver.region || carver.country || t.unknownPlace}
          </span>
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent);

    // Add click handler
    marker.on('click', () => {
      onCarverClick?.(carver);
    });

    return marker;
  };

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add carver markers
    carvers.forEach(carver => {
      const isHighlighted = highlightedCarver?.id === carver.id;
      const marker = createCarverMarker(carver, isHighlighted);
      if (marker) {
        markersRef.current.addLayer(marker);
      }
    });
  }, [carvers, highlightedCarver, onCarverClick]);

  // Zoom to fit all markers
  const zoomToFitAll = () => {
    if (!mapRef.current) return;

    const carversWithCoords = carvers.filter(carver => 
      getRegionCoordinates(carver.region, carver.country)
    );

    if (carversWithCoords.length === 0) return;

    const bounds = L.latLngBounds(
      carversWithCoords.map(carver => {
        const coords = getRegionCoordinates(carver.region, carver.country);
        return coords as [number, number];
      }).filter(Boolean)
    );

    mapRef.current.fitBounds(bounds, { padding: [20, 20] });
  };

  const carversWithLocation = carvers.filter(carver => 
    getRegionCoordinates(carver.region, carver.country)
  ).length;

  return (
    <Card className="viking-card">
      <CardContent className="p-0">
        {/* Map Controls */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">{t.title}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {t.onMap(carversWithLocation, carvers.length)}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={zoomToFitAll}
                className="text-xs"
              >
                <ZoomIn className="h-3 w-3 mr-1" />
                {t.showAll}
              </Button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-[500px] relative"
          style={{ minHeight: '500px' }}
        />

        {/* Legend */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p className="mb-2 font-medium">{t.legendTitle}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">ᚱ</div>
                <span>{t.s20}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs">ᚱ</div>
                <span>{t.s10}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs">ᚱ</div>
                <span>{t.s5}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">ᚱ</div>
                <span>{t.s2}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs">ᚱ</div>
                <span>{t.s1}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};