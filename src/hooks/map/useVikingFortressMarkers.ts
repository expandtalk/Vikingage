
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface VikingFortress {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  fortress_type: string;
  country: string;
  region?: string;
  description?: string;
  historical_significance?: string;
  construction_start?: number;
  construction_end?: number;
}

// Function to get SVG icon for fortress type
const getFortressIcon = (fortressType: string) => {
  switch (fortressType) {
    case 'ring_fortress':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.5 7.5S5 18 5 13s3.5-7.5 7.5-7.5S20 8 20 13Z"/><path d="M12 8v5l2 2"/></svg>';
    case 'hillfort':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>';
    case 'longphort':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="m12 2 3 3.5L12 9 9 5.5z"/></svg>';
    case 'royal_center':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>';
    case 'coastal_defense':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.5 7.5S5 18 5 13s3.5-7.5 7.5-7.5S20 8 20 13Z"/><path d="M12 8v5l2 2"/></svg>';
    case 'trading_post':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4m8 0h-4m-4 4h8m-8-8h8"/></svg>';
    case 'linear_defense':
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.5 7.5S5 18 5 13s3.5-7.5 7.5-7.5S20 8 20 13Z"/><path d="M12 8v5l2 2"/></svg>';
    default:
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4m8 0h-4m-4 4h8m-8-8h8"/></svg>';
  }
};

const FORTRESS_CONFIGS = {
  ring_fortress: {
    color: '#8b4513', // Saddle brown - jordnära brun färg
    size: { width: 16, height: 16 },
    border: '2px solid white',
    iconSize: [18, 18] as [number, number],
    anchor: [9, 9] as [number, number],
    label: 'Ring fortress',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-100'
  },
  hillfort: {
    color: '#a0522d', // Sienna - varm jordton
    size: { width: 14, height: 14 },
    border: '1px solid white',
    iconSize: [16, 16] as [number, number],
    anchor: [8, 8] as [number, number],
    label: 'Hillfort',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-100'
  },
  longphort: {
    color: '#6b8e23', // Olive drab - mörk olivgrön
    size: { width: 14, height: 14 },
    border: '1px solid white',
    iconSize: [16, 16] as [number, number],
    anchor: [8, 8] as [number, number],
    label: 'Longphort',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  royal_center: {
    color: '#cd853f', // Peru - varm gyllenbrun
    size: { width: 15, height: 15 },
    border: '1px solid white',
    iconSize: [17, 17] as [number, number],
    anchor: [8.5, 8.5] as [number, number],
    label: 'Royal center',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  coastal_defense: {
    color: '#4682b4', // Steel blue - mörk stålblå
    size: { width: 13, height: 13 },
    border: '1px solid white',
    iconSize: [15, 15] as [number, number],
    anchor: [7.5, 7.5] as [number, number],
    label: 'Coastal defense',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  trading_post: {
    color: '#daa520', // Goldenrod - guldbrun för handelsplatser
    size: { width: 15, height: 15 },
    border: '1px solid white',
    iconSize: [17, 17] as [number, number],
    anchor: [8.5, 8.5] as [number, number],
    label: 'Trading post',
    textColor: 'text-yellow-800',
    bgColor: 'bg-yellow-200'
  },
  linear_defense: {
    color: '#708090', // Slate gray - för linjära försvarsvallar
    size: { width: 18, height: 12 },
    border: '1px solid white',
    iconSize: [20, 14] as [number, number],
    anchor: [10, 7] as [number, number],
    label: 'Linear defense',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-100'
  }
};

export const addVikingFortressMarkers = (
  map: L.Map,
  fortresses: VikingFortress[],
  fortressType: string,
  enabled: boolean
): L.Marker[] => {
  if (!enabled) return [];

  // Check if map and its container are ready
  if (!map || !map.getContainer() || !document.contains(map.getContainer())) {
    console.warn('Map container not ready for viking fortress markers');
    return [];
  }

  const markers: L.Marker[] = [];
  const filteredFortresses = fortresses.filter(f => f.fortress_type === fortressType);
  const config = FORTRESS_CONFIGS[fortressType as keyof typeof FORTRESS_CONFIGS];

  if (!config) return [];

  // Klustring: fornborgarna är nu ~1100 (Wikidata-import) — utan kluster blev
  // kartan en oläslig prickmatta. En MarkerClusterGroup slås samman vid utzoomning
  // och expanderar vid inzoomning. Gruppen returneras som ETT borttagbart lager
  // (cleanup i useMapMarkers kör map.removeLayer på varje returnerad post).
  const cluster = (L as any).markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 12,
  }) as L.LayerGroup;

  filteredFortresses.forEach(fortress => {
    try {
      const iconSvg = getFortressIcon(fortressType);
      
      const customIcon = L.divIcon({
        html: `<div style="
          background: ${config.color};
          width: ${config.size.width}px;
          height: ${config.size.height}px;
          border-radius: ${fortressType === 'linear_defense' ? '2px' : '4px'};
          border: ${config.border};
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">${iconSvg}</div>`,
        className: 'viking-fortress-marker',
        iconSize: config.iconSize,
        iconAnchor: config.anchor
      });

      const marker = L.marker([fortress.coordinates.lat, fortress.coordinates.lng], { icon: customIcon })
        .bindPopup(`
          <div class="p-3 max-w-sm">
            <h3 class="font-bold text-base ${config.textColor}">${fortress.name}</h3>
            <p class="text-sm text-gray-600">${fortress.description || config.label}</p>
            ${fortress.historical_significance ? `<p class="text-xs text-gray-500 mt-1">${fortress.historical_significance}</p>` : ''}
            <span class="inline-block mt-2 px-2 py-1 ${config.bgColor} ${config.textColor} text-xs rounded">
              ${fortress.fortress_type.replace('_', ' ')}
            </span>
          </div>
        `);

      cluster.addLayer(marker);
      markers.push(marker);
    } catch (error) {
      console.error('Error creating viking fortress marker:', error);
    }
  });

  // Lägg klustergruppen på kartan och returnera DEN (inte de enskilda markörerna)
  // så att cleanup river hela gruppen med map.removeLayer(cluster).
  if (markers.length && map && map.getContainer() && document.contains(map.getContainer())) {
    cluster.addTo(map);
    return [cluster as unknown as L.Marker];
  }
  return [];
};

export const getFortressMarkersByType = (fortresses: VikingFortress[]) => {
  return {
    ring_fortresses: fortresses.filter(f => f.fortress_type === 'ring_fortress'),
    hillforts: fortresses.filter(f => f.fortress_type === 'hillfort'),
    longphorts: fortresses.filter(f => f.fortress_type === 'longphort'),
    royal_centers: fortresses.filter(f => f.fortress_type === 'royal_center'),
    coastal_defenses: fortresses.filter(f => f.fortress_type === 'coastal_defense'),
    trading_posts: fortresses.filter(f => f.fortress_type === 'trading_post'),
    linear_defenses: fortresses.filter(f => f.fortress_type === 'linear_defense')
  };
};
