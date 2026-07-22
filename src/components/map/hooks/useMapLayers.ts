
import { useMemo, useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
import { useArchaeologicalMarkers } from "@/hooks/map/archaeological/useArchaeologicalMarkers";
import { addStakeBarrierMarkers } from "@/hooks/map/useStakeBarrierMarkers";

interface UseMapLayersProps {
  map: L.Map | null;
  selectedTimePeriod: string;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: boolean;
}

export const useMapLayers = ({ 
  map, 
  selectedTimePeriod, 
  enabledLegendItems, 
  isMapReady 
}: UseMapLayersProps) => {
  const isMapReadyRef = useRef<boolean>(false);
  const stakeBarrierMarkersRef = useRef<L.Marker[]>([]);
  
  // Update ref when map ready state changes
  useEffect(() => {
    isMapReadyRef.current = isMapReady;
  }, [isMapReady]);

  // Safe layer addition function
  const safelyAddLayer = useCallback((layer: L.Layer): boolean => {
    if (!map || !isMapReadyRef.current) {
      return false;
    }
    
    try {
      // Additional safety check - ensure map container exists in DOM
      if (!map.getContainer() || !document.contains(map.getContainer())) {
        console.warn('Map container not ready for layer addition');
        return false;
      }
      
      map.addLayer(layer);
      return true;
    } catch (error) {
      console.error('Error adding layer:', error);
      return false;
    }
  }, [map]);

  // Use the archaeological markers hook
  const { archaeologicalMarkers, findCount } = useArchaeologicalMarkers({
    map,
    selectedPeriod: selectedTimePeriod,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
    showClustering: true
  });

  // Handle stake barriers with proper legend control
  useMemo(() => {
    if (!map || !isMapReady) return;

    // Ensure stakeBarrierMarkersRef.current is always an array
    if (!Array.isArray(stakeBarrierMarkersRef.current)) {
      stakeBarrierMarkersRef.current = [];
    }

    // Clear existing stake barrier markers
    stakeBarrierMarkersRef.current.forEach(marker => {
      try {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      } catch (error) {
        console.error('Error removing stake barrier marker:', error);
      }
    });
    stakeBarrierMarkersRef.current = [];

    // Koppla bort ev. zoom-handler för spärrar (satt i addStakeBarrierMarkers).
    const barrierZoom = (map as any).__stakeBarrierZoom as (() => void) | undefined;
    if (barrierZoom) {
      map.off('zoomend', barrierZoom);
      (map as any).__stakeBarrierZoom = null;
    }

    // Add stake barriers if enabled and in correct time period
    const shouldShowStakeBarriers = selectedTimePeriod === 'viking_age' && 
                                   enabledLegendItems.stake_barriers !== false;

    console.log('🔱 Stake barriers visibility check:', {
      selectedTimePeriod,
      stakeBarriersEnabled: enabledLegendItems.stake_barriers,
      shouldShowStakeBarriers,
      mapReady: isMapReady
    });

    if (shouldShowStakeBarriers) {
      try {
        const markers = addStakeBarrierMarkers(map, true);
        if (Array.isArray(markers)) {
          stakeBarrierMarkersRef.current = markers;
        }
      } catch (error) {
        console.error('Error adding stake barrier markers:', error);
      }
    }
  }, [map, selectedTimePeriod, enabledLegendItems.stake_barriers, isMapReady]);

  return {
    safelyAddLayer,
    archaeologicalMarkers,
    findCount
  };
};
