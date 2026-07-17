
import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { useMapInstance } from './useMapInstance';
import { useMapTileLayer } from './useMapTileLayer';
import { useMapRiverSystems } from './useMapRiverSystems';
import { useMapValdemarsRoute } from './useMapValdemarsRoute';

interface UseMapInitializationProps {
  isVikingMode: boolean;
  enabledLegendItems: { [key: string]: boolean };
  selectedPeriod: string;
  selectedTimePeriod: string;
  onRefreshRivers?: (refreshFn: () => void) => void; // Fix callback signature
}

export const useMapInitialization = ({ 
  isVikingMode, 
  enabledLegendItems,
  selectedPeriod,
  selectedTimePeriod,
  onRefreshRivers
}: UseMapInitializationProps) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [riverRefreshTrigger, setRiverRefreshTrigger] = useState(0);
  const isMapReadyRef = useRef<boolean>(false);
  
  const { mapContainer, map } = useMapInstance({ isVikingMode });

  // Wait for map to be initialized
  useEffect(() => {
    if (map.current) {
      setIsMapReady(true);
      isMapReadyRef.current = true;
    }
  }, [map]);

  // Safe layer addition function
  const safelyAddLayer = (layer: L.Layer): boolean => {
    if (!map.current || !isMapReadyRef.current) {
      return false;
    }
    
    try {
      map.current.addLayer(layer);
      return true;
    } catch (error) {
      console.error('Error adding layer:', error);
      return false;
    }
  };

  // Expose refresh function via callback
  useEffect(() => {
    if (onRefreshRivers) {
      const refreshRivers = () => {
        setRiverRefreshTrigger(prev => prev + 1);
      };
      onRefreshRivers(refreshRivers);
    }
  }, [onRefreshRivers]);

  // Add tile layer with proper parameters
  useMapTileLayer({ 
    map: map.current, 
    isVikingMode, 
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    mapContainer,
    safelyAddLayer
  });

  // Add river systems only if enabled - pass object parameters with all required props
  useMapRiverSystems({
    map: map.current,
    isVikingMode,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
    selectedTimePeriod,
    refreshTrigger: riverRefreshTrigger
  });

  // Add Valdemar's route only if enabled
  useMapValdemarsRoute({
    map: map.current,
    isVikingMode,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    safelyAddLayer,
    selectedTimePeriod
  });

  return { 
    mapContainer, 
    map: map.current,
    isMapReady
  };
};
