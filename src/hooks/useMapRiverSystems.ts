
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

interface UseMapRiverSystemsProps {
  map: L.Map | null;
  isVikingMode: boolean;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.RefObject<boolean>;
  safelyAddLayer: (layer: L.Layer) => boolean;
  selectedTimePeriod?: string;
  refreshTrigger?: number; // Add refresh trigger
}

interface DatabaseRiverSystem {
  id: string;
  name: string;
  name_en: string;
  description?: string;
  period: string;
  significance?: string;
  historical_significance?: string;
  color: string;
  width: number;
  importance: 'primary' | 'secondary';
  type?: string;
  total_length_km?: number;
  coordinates: Array<{
    sequence_order: number;
    latitude: number;
    longitude: number;
    name?: string;
    name_en?: string;
    description?: string;
    is_trading_post: boolean;
    is_portage: boolean;
  }>;
}

export const useMapRiverSystems = ({
  map,
  isVikingMode,
  enabledLegendItems,
  isMapReady,
  safelyAddLayer,
  selectedTimePeriod = 'viking_age',
  refreshTrigger
}: UseMapRiverSystemsProps) => {
  const riverLayersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!map || !isMapReady.current) return;

    // Clear existing river layers
    riverLayersRef.current.forEach(layer => {
      try {
        map.removeLayer(layer);
      } catch (error) {
        console.warn('Error removing river layer:', error);
      }
    });
    riverLayersRef.current = [];

    // Legend is the authority: show rivers whenever the layer is enabled,
    // regardless of the selected period (dropped the viking_age/vendel period
    // gate that hid rivers in the default 'all' view).
    const showRivers = enabledLegendItems.river_routes !== false;

    if (!showRivers) return;

    console.log('Adding detailed river systems to map...');

    // Fetch river systems from database
    const fetchAndDisplayRiverSystems = async () => {
      try {
        const { data: systems, error: systemsError } = await supabase
          .from('river_systems')
          .select('*')
          .order('name');

        if (systemsError) {
          console.error('Error fetching river systems:', systemsError);
          return;
        }

        // Fetch coordinates for each system
        const systemsWithCoordinates: DatabaseRiverSystem[] = await Promise.all(
          systems.map(async (system) => {
            const { data: coordinates, error: coordsError } = await supabase
              .from('river_coordinates')
              .select('*')
              .eq('river_system_id', system.id)
              .order('sequence_order');

            if (coordsError) {
              console.error('Error fetching coordinates:', coordsError);
              return {
                ...system,
                importance: (system.importance === 'primary' ? 'primary' : 'secondary') as 'primary' | 'secondary',
                coordinates: []
              };
            }

            return {
              ...system,
              importance: (system.importance === 'primary' ? 'primary' : 'secondary') as 'primary' | 'secondary',
              coordinates: coordinates || []
            };
          })
        );

        // Add Nordic river systems from database
        systemsWithCoordinates.forEach(route => {
          if (route.coordinates.length === 0) return;
          
          const coordinates = route.coordinates.map(coord => [coord.latitude, coord.longitude] as [number, number]);
          
          // Derive line weight from importance for a consistent visual
          // hierarchy. The per-row `width` column is inconsistent (some
          // secondary rivers were wider than some primary ones), so we ignore
          // it and give primary routes one weight and secondary another.
          const riverLine = L.polyline(coordinates, {
            color: route.color || '#3b82f6',
            weight: route.importance === 'primary' ? 4 : 2.5,
            opacity: 0.8,
            dashArray: route.type === 'coastal_route' ? '10, 5' : undefined
          });

          const lengthInfo = route.total_length_km ? `<p class="text-xs text-slate-400 mb-1">Längd: ${route.total_length_km} km</p>` : '';

          riverLine.bindPopup(`
            <div class="bg-slate-800 text-white p-3 rounded-lg border border-slate-600 min-w-[280px]">
              <h3 class="font-bold text-lg text-blue-300">${route.name}</h3>
              <p class="text-sm text-slate-400 mb-2">${route.name_en}</p>
              <p class="text-slate-300 text-sm mb-2">${route.description || ''}</p>
              ${lengthInfo}
              <p class="text-xs text-slate-400">${route.historical_significance || route.significance || ''}</p>
            </div>
          `, { maxWidth: 300 });

          if (safelyAddLayer(riverLine)) {
            riverLayersRef.current.push(riverLine);
          }

          // Add markers for trading posts and portages
          route.coordinates.forEach(point => {
            if (point.is_trading_post || point.is_portage) {
              const icon = L.divIcon({
                html: `<div style="
                  background: ${point.is_trading_post ? 'rgba(59, 130, 246, 0.9)' : 'rgba(168, 85, 247, 0.9)'};
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
                className: 'river-point-marker',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              });

              const marker = L.marker([point.latitude, point.longitude], { icon });
              
              if (point.name) {
                marker.bindPopup(`
                  <div class="bg-slate-800 text-white p-2 rounded border border-slate-600">
                    <h4 class="font-semibold">${point.name}</h4>
                    <p class="text-xs text-slate-400">${point.is_trading_post ? 'Handelsplats' : 'Portage-punkt'}</p>
                    ${point.description ? `<p class="text-xs text-slate-300 mt-1">${point.description}</p>` : ''}
                  </div>
                `);
              }

              if (safelyAddLayer(marker)) {
                riverLayersRef.current.push(marker);
              }
            }
          });
        });

      } catch (error) {
        console.error('Error loading river systems:', error);
      }
    };

    // Fetch and display database river systems
    fetchAndDisplayRiverSystems();

    // All rivers are now loaded from database above

    console.log(`Added ${riverLayersRef.current.length} detailed river system layers to map from database`);

    return () => {
      riverLayersRef.current.forEach(layer => {
        try {
          map.removeLayer(layer);
        } catch (error) {
          console.warn('Error removing river layer:', error);
        }
      });
      riverLayersRef.current = [];
    };
  }, [map, isVikingMode, enabledLegendItems, selectedTimePeriod, isMapReady, safelyAddLayer, refreshTrigger]);

  return riverLayersRef.current.length;
};
