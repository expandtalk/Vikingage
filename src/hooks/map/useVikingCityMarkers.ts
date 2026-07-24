
import L from 'leaflet';
import { filterCitiesByPeriod, getCategoryColor, getCategoryLabel } from '@/hooks/useVikingCities';
import { createPlaceMedallion, markerColor, isRoyalSeat, royalSeatIcon } from '@/utils/map/placeMarker';

// Stadskategori → medaljong-ikon.
const CITY_ICON: Record<string, string> = {
  religious_center: 'pillar', trading_post: 'scales', koping: 'scales',
  established_city: 'church', gotlandic_center: 'church',
};

interface VikingCity {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: string;
  period_start: number;
  period_end: number;
  country: string;
  region?: string;
  description: string;
  historical_significance?: string;
  replaces?: string;
  unesco_site: boolean;
  status: string;
  population_estimate?: number;
}

// Function to get SVG icon for city category
const getCityIcon = (category: string) => {
  switch (category) {
    case 'religious_center':
      return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>';
    case 'trading_post':
      return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4m8 0h-4m-4 4h8m-8-8h8"/></svg>';
    case 'koping':
      return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4m8 0h-4m-4 4h8m-8-8h8"/></svg>';
    case 'established_city':
      return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4m8 0h-4m-4 4h8m-8-8h8"/></svg>';
    case 'gotlandic_center':
      return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>';
    default:
      return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4m8 0h-4m-4 4h8m-8-8h8"/></svg>';
  }
};

export const addVikingCityMarkers = (
  map: L.Map,
  vikingCities: VikingCity[],
  selectedPeriod: string,
  enabledLegendItems: { [key: string]: boolean }
): L.Marker[] => {
  // Check if map and its container are ready
  if (!map || !map.getContainer() || !document.contains(map.getContainer())) {
    console.warn('Map container not ready for viking city markers');
    return [];
  }

  const markers: L.Marker[] = [];
  const filteredCities = filterCitiesByPeriod(vikingCities, selectedPeriod);
  
  console.log('Adding Viking cities to map:', filteredCities.length, 'cities filtered from', vikingCities.length, 'total cities');
  
  filteredCities.forEach(city => {
    const categoryEnabled = enabledLegendItems[city.category] !== false;
    console.log(`City ${city.name} (${city.category}): enabled=${categoryEnabled}`);
    if (!categoryEnabled) return;

    // Double-check map readiness before creating each marker
    if (!map || !map.getContainer() || !document.contains(map.getContainer())) {
      console.warn('Map container became unavailable during city marker creation');
      return;
    }

    try {
      const catColor = getCategoryColor(city.category);
      // Gemensam medaljong: kungasäten (Birka/Sigtuna/Nidaros…) → guld; annars dämpad kategorifärg.
      const customIcon = createPlaceMedallion({
        color: markerColor(city.category),
        icon: royalSeatIcon(city.name) || CITY_ICON[city.category] || 'church',
        label: city.name,
        royal: isRoyalSeat(city.name),
        className: `viking-city ${city.category}`,
      });

      const marker = L.marker([city.coordinates.lat, city.coordinates.lng], { icon: customIcon })
        .bindPopup(`
          <div class="p-3 max-w-sm">
            <h3 class="font-bold text-base" style="color: ${catColor};">${city.name}</h3>
            <p class="text-sm text-gray-600">${city.description}</p>
            <span class="inline-block mt-2 px-2 py-1 text-xs rounded" style="background-color: ${markerColor}20; color: ${markerColor};">
              ${getCategoryLabel(city.category)}
            </span>
            <div class="text-xs text-gray-500 mt-1">
              ${city.period_start}-${city.period_end} e.Kr.
            </div>
          </div>
        `);

      // Safely add marker to map
      if (map && map.getContainer() && document.contains(map.getContainer())) {
        marker.addTo(map);
        markers.push(marker);
      } else {
        console.warn('Cannot add city marker - map container not available');
      }
    } catch (error) {
      console.error('Error creating viking city marker:', error);
    }
  });

  return markers;
};
