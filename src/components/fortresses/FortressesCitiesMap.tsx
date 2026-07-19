import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, MapPin, ZoomIn } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

// Fix för Leaflet ikoner
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VikingFortress {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  fortress_type: string;
  country: string;
  region?: string;
  description?: string;
}

interface VikingCity {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  category: string;
  country: string;
  region?: string;
  description: string;
}

interface SwedishHillfort {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  raa_number: string;
  landscape: string;
  municipality?: string;
  description?: string;
}

interface FortressesCitiesMapProps {
  fortresses: VikingFortress[];
  cities: VikingCity[];
  hillforts?: SwedishHillfort[];
  onLocationClick?: (location: VikingFortress | VikingCity | SwedishHillfort, type: 'fortress' | 'city' | 'hillfort') => void;
  highlightedLocation?: { id: string; type: 'fortress' | 'city' | 'hillfort' } | null;
  showFortresses: boolean;
  showCities: boolean;
  showHillforts?: boolean;
  onToggleFortresses: () => void;
  onToggleCities: () => void;
  onToggleHillforts?: () => void;
}

// Fortress marker configurations
const FORTRESS_CONFIGS: { [key: string]: { color: string; icon: string } } = {
  ring_fortress: { color: '#8b4513', icon: '🏰' },
  hillfort: { color: '#a0522d', icon: '⛰️' },
  longphort: { color: '#6b8e23', icon: '🛡️' },
  royal_center: { color: '#cd853f', icon: '👑' },
  coastal_defense: { color: '#4682b4', icon: '🌊' },
  trading_post_fortress: { color: '#daa520', icon: '⚓' },
  linear_defense: { color: '#708090', icon: '🔗' }
};

// City marker configurations  
const CITY_CONFIGS: { [key: string]: { color: string; icon: string } } = {
  established_city: { color: '#FFD700', icon: '🏛️' },
  trading_post: { color: '#1E90FF', icon: '⚓' },
  religious_center: { color: '#8B4513', icon: '⛪' },
  gotlandic_center: { color: '#FF6347', icon: '🗿' },
  koping: { color: '#32CD32', icon: '🏪' }
};

// Swedish hillfort marker configuration
const HILLFORT_CONFIG = { color: '#8B4513', icon: '🏔️' };

export const FortressesCitiesMap: React.FC<FortressesCitiesMapProps> = ({
  fortresses,
  cities,
  hillforts = [],
  onLocationClick,
  highlightedLocation,
  showFortresses,
  showCities,
  showHillforts = true,
  onToggleFortresses,
  onToggleCities,
  onToggleHillforts = () => {}
}) => {
  const { language } = useLanguage();
  const sv = language === 'sv';
  const M = sv
    ? { interactiveMap: 'Interaktiv karta', fortifications: 'Befästningar', cities: 'Centra', hillforts: 'Fornborgar', showAll: 'Visa alla', legend: 'Förklaring' }
    : { interactiveMap: 'Interactive map', fortifications: 'Fortifications', cities: 'Centres', hillforts: 'Hillforts', showAll: 'Show all', legend: 'Legend' };
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Scandinavia
    const map = L.map(mapContainerRef.current, {
      preferCanvas: true, // canvas-rendering: tusentals markörer utan DOM-kostnad
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

  // Create custom marker for hillforts
  const createHillfortMarker = (
    hillfort: SwedishHillfort,
    isHighlighted: boolean = false
  ) => {
    const size = isHighlighted ? 35 : 25;
    const zIndex = isHighlighted ? 1000 : 50;

    const icon = L.divIcon({
      html: `
        <div style="
          background: ${HILLFORT_CONFIG.color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2px solid ${isHighlighted ? '#FFD700' : 'white'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.5}px;
          color: white;
          font-weight: bold;
          position: relative;
          z-index: ${zIndex};
        ">
          ${HILLFORT_CONFIG.icon}
        </div>
      `,
      className: 'hillfort-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });

    const marker = L.marker([hillfort.coordinates.lat, hillfort.coordinates.lng], { icon });
    
    // Add popup
    const popupContent = `
      <div class="p-3 max-w-sm">
        <h3 class="font-bold text-base text-gray-800">${hillfort.name || 'Namnlös fornborg'}</h3>
        <p class="text-sm text-gray-600 mt-1">${hillfort.description || `RAÄ-nummer: ${hillfort.raa_number}`}</p>
        <div class="mt-2 flex flex-wrap gap-1">
          <span class="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
            ${hillfort.landscape}
          </span>
          ${hillfort.municipality ? `<span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${hillfort.municipality}</span>` : ''}
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent);

    // Add click handler
    marker.on('click', () => {
      onLocationClick?.(hillfort, 'hillfort');
    });

    return marker;
  };

  // Create custom marker
  const createCustomMarker = (
    location: VikingFortress | VikingCity, 
    type: 'fortress' | 'city',
    isHighlighted: boolean = false
  ) => {
    const config = type === 'fortress' 
      ? FORTRESS_CONFIGS[(location as VikingFortress).fortress_type] || FORTRESS_CONFIGS.ring_fortress
      : CITY_CONFIGS[(location as VikingCity).category] || CITY_CONFIGS.established_city;

    const size = isHighlighted ? 40 : 30;
    const zIndex = isHighlighted ? 1000 : 100;

    const icon = L.divIcon({
      html: `
        <div style="
          background: ${config.color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid ${isHighlighted ? '#FFD700' : 'white'};
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.4}px;
          color: white;
          font-weight: bold;
          position: relative;
          z-index: ${zIndex};
        ">
          ${config.icon}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });

    const marker = L.marker([location.coordinates.lat, location.coordinates.lng], { icon });
    
    // Add popup
    const popupContent = `
      <div class="p-3 max-w-sm">
        <h3 class="font-bold text-base text-gray-800">${location.name}</h3>
        <p class="text-sm text-gray-600 mt-1">${location.description || 'Ingen beskrivning tillgänglig'}</p>
        <div class="mt-2">
          <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            ${type === 'fortress' ? 'Befästning' : 'Stad'}: ${location.country}
          </span>
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent);

    // Add click handler
    marker.on('click', () => {
      onLocationClick?.(location, type);
    });

    return marker;
  };

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add fortress markers
    if (showFortresses) {
      fortresses.forEach(fortress => {
        const isHighlighted = highlightedLocation?.id === fortress.id && highlightedLocation?.type === 'fortress';
        const marker = createCustomMarker(fortress, 'fortress', isHighlighted);
        markersRef.current.addLayer(marker);
      });
    }

    // Add city markers
    if (showCities) {
      cities.forEach(city => {
        const isHighlighted = highlightedLocation?.id === city.id && highlightedLocation?.type === 'city';
        const marker = createCustomMarker(city, 'city', isHighlighted);
        markersRef.current.addLayer(marker);
      });
    }

    // Add hillfort markers
    if (showHillforts && hillforts) {
      hillforts.forEach(hillfort => {
        const isHighlighted = highlightedLocation?.id === hillfort.id && highlightedLocation?.type === 'hillfort';
        const marker = createHillfortMarker(hillfort, isHighlighted);
        markersRef.current.addLayer(marker);
      });
    }
  }, [fortresses, cities, hillforts, showFortresses, showCities, showHillforts, highlightedLocation, onLocationClick]);

  // Zoom to location function
  const zoomToLocation = (location: VikingFortress | VikingCity) => {
    if (mapRef.current) {
      mapRef.current.setView([location.coordinates.lat, location.coordinates.lng], 10);
    }
  };

  // Zoom to fit all markers
  const zoomToFitAll = () => {
    if (!mapRef.current) return;

    const allLocations = [
      ...(showFortresses ? fortresses : []),
      ...(showCities ? cities : [])
    ];

    if (allLocations.length === 0) return;

    const bounds = L.latLngBounds(
      allLocations.map(loc => [loc.coordinates.lat, loc.coordinates.lng])
    );

    mapRef.current.fitBounds(bounds, { padding: [20, 20] });
  };

  return (
    <Card className="viking-card">
      <CardContent className="p-0">
        {/* Map Controls */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold" />
              <h3 className="font-semibold text-foreground">{M.interactiveMap}</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showFortresses ? "default" : "outline"}
                size="sm"
                onClick={onToggleFortresses}
                className="text-xs"
              >
                <Badge variant="secondary" className="mr-1">
                  {fortresses.length}
                </Badge>
                {M.fortifications}
              </Button>
              
              <Button
                variant={showCities ? "default" : "outline"}
                size="sm"
                onClick={onToggleCities}
                className="text-xs"
              >
                <Badge variant="secondary" className="mr-1">
                  {cities.length}
                </Badge>
                {M.cities}
              </Button>

              {hillforts && hillforts.length > 0 && (
                <Button
                  variant={showHillforts ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleHillforts}
                  className="text-xs"
                >
                  <Badge variant="secondary" className="mr-1">
                    {hillforts.length}
                  </Badge>
                  {M.hillforts}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={zoomToFitAll}
                className="text-xs"
              >
                <ZoomIn className="h-3 w-3 mr-1" />
                {M.showAll}
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
            <p className="mb-2 font-medium">{M.legend}:</p>
            <div className="flex flex-wrap gap-4">
              {showFortresses && (
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs">🏰</div>
                  <span>{M.fortifications}</span>
                </div>
              )}
              {showCities && (
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">🏛️</div>
                  <span>{M.cities}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};