import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { valdemarsRoute, getRouteColor, getRouteDescription } from '@/utils/valdemarsRoute';

interface UseMapValdemarsRouteProps {
  map: L.Map | null;
  isVikingMode: boolean;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
  selectedTimePeriod?: string;
}

export const useMapValdemarsRoute = ({
  map,
  isVikingMode,
  enabledLegendItems,
  isMapReady,
  safelyAddLayer,
  selectedTimePeriod = 'viking_age'
}: UseMapValdemarsRouteProps) => {
  const routeLayersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!map || !isMapReady.current) return;

    // Clear existing route layers
    routeLayersRef.current.forEach(layer => {
      try {
        map.removeLayer(layer);
      } catch (error) {
        console.warn('Error removing Valdemar route layer:', error);
      }
    });
    routeLayersRef.current = [];

    // Legend is the authority: show the route whenever the layer is enabled
    // (gate on the same key the legend item uses, 'valdemar_route'). Dropped
    // the viking_age period gate that hid it in the default 'all' view.
    const showValdemarsRoute = enabledLegendItems.valdemar_route !== false;

    if (!showValdemarsRoute) return;

    console.log('⛵ Adding Valdemars segelled to map...');

    const routePoints = valdemarsRoute();
    if (routePoints.length === 0) {
      console.warn('No route points found for Valdemar\'s route');
      return;
    }

    // Create the main route line
    const coordinates = routePoints.map(point => [point.coordinates.lat, point.coordinates.lng] as [number, number]);
    
    const routeLine = L.polyline(coordinates, {
      color: getRouteColor(isVikingMode),
      weight: 4,
      opacity: 0.9,
      dashArray: '10, 5' // Dashed line to distinguish from rivers
    });

    // Add route description popup
    routeLine.bindPopup(`
      <div class="bg-slate-800 text-white p-4 rounded-lg border border-slate-600 min-w-[320px]">
        <h3 class="font-bold text-lg text-blue-300">Valdemars Segelled</h3>
        <p class="text-sm text-slate-400 mb-2">Kong Valdemar II:s seglingsrutt (1230-talet)</p>
        <p class="text-slate-300 text-sm mb-3">${getRouteDescription(isVikingMode)}</p>
        <div class="border-t border-slate-600 pt-2">
          <p class="text-xs text-slate-400">Historisk navigationsrutt från Utlängan till Tallinn</p>
        </div>
      </div>
    `, { maxWidth: 350 });

    if (safelyAddLayer(routeLine)) {
      routeLayersRef.current.push(routeLine);
    }

    // Add markers for major waypoints and lot stations
    routePoints.forEach(point => {
      if (point.isMajorWaypoint || point.isLotstation) {
        const isLotstation = point.isLotstation;
        const size = isLotstation ? 16 : 12;
        
        const icon = L.divIcon({
          html: `<div style="
            background: ${isLotstation ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)'};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${Math.max(8, size - 6)}px;
            color: white;
            font-weight: bold;
          ">${isLotstation ? '⚓' : '📍'}</div>`,
          className: 'valdemar-waypoint',
          iconSize: [size, size],
          iconAnchor: [size/2, size/2]
        });

        const marker = L.marker([point.coordinates.lat, point.coordinates.lng], { icon });
        
        marker.bindPopup(`
          <div class="bg-slate-800 text-white p-3 rounded border border-slate-600 min-w-[250px]">
            <h4 class="font-semibold text-blue-300">${point.name}</h4>
            <p class="text-xs text-slate-400 mb-2">
              ${isLotstation ? 'Lotsstation' : 'Viktigt landmärke'}
            </p>
            ${point.description ? `<p class="text-xs text-slate-300">${point.description}</p>` : ''}
            ${point.section ? `<p class="text-xs text-slate-400 mt-1">Sektion: ${point.section}</p>` : ''}
          </div>
        `);

        if (safelyAddLayer(marker)) {
          routeLayersRef.current.push(marker);
        }
      }
    });

    console.log(`⛵ Added Valdemar's route with ${routeLayersRef.current.length} layers (${routePoints.length} route points)`);

    return () => {
      routeLayersRef.current.forEach(layer => {
        try {
          map.removeLayer(layer);
        } catch (error) {
          console.warn('Error removing Valdemar route layer:', error);
        }
      });
      routeLayersRef.current = [];
    };
  }, [map, isVikingMode, enabledLegendItems, selectedTimePeriod, isMapReady, safelyAddLayer]);

  return routeLayersRef.current.length;
};