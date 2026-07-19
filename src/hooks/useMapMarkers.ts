
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLegendData } from './map/useLegendData';
import { resetMarkerManager } from '@/utils/markerPriority';
import { processInscriptionCoordinates } from './useMapMarkers/coordinateProcessor';
import { addMapMarkers } from './useMapMarkers/markerManager';
import { RunicInscription } from '@/types/inscription';
import { UseMapMarkersReturn } from '@/types/map';
import { useActiveExploreProfile } from './useExploreProfiles';
import { layerEmphasis, emphasisStyle } from '@/config/exploreProfiles';

export const useMapMarkers = (
  map: L.Map | null,
  inscriptions: RunicInscription[],
  onMarkerClick?: (inscription: RunicInscription) => void,
  isVikingMode: boolean = false,
  fortresses: any[] = [],
  enabledLegendItems: { [key: string]: boolean } = {},
  selectedPeriod: string = 'all',
  selectedTimePeriod: string = 'viking_age',
  historicalEvents: any[] = [],
  vikingCities: any[] = []
): UseMapMarkersReturn => {
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const markersRef = useRef<L.Marker[]>([]);

  const activeProfile = useActiveExploreProfile();
  const inscriptionEmphasis = emphasisStyle(layerEmphasis(activeProfile, 'runic_inscriptions'));

  const { generateLegendData } = useLegendData(
    inscriptions,
    isVikingMode,
    fortresses,
    enabledLegendItems,
    selectedTimePeriod
  );

  useEffect(() => {
    if (!map) return;

    console.log('=== MAP MARKERS DEBUG (COORDINATE FIX) ===');
    console.log('useMapMarkers: Updating markers with enabled items:', enabledLegendItems);
    console.log('useMapMarkers: Selected time period:', selectedTimePeriod);
    console.log('useMapMarkers: Is Viking mode:', isVikingMode);
    console.log('useMapMarkers: Inscriptions to process:', inscriptions.length);

    // Reset marker deduplication manager for new render
    resetMarkerManager();

    // ✅ SÄKER marker-borttagning med race condition-skydd
    const safeRemoveMarkers = (markersToRemove: L.Marker[]) => {
      markersToRemove.forEach((marker) => {
        try {
          if (marker && map && map.hasLayer && map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        } catch (error) {
          console.warn('⚠️ Error removing marker safely:', error);
        }
      });
    };

    // Clear existing markers safely
    safeRemoveMarkers(markersRef.current);
    markersRef.current = [];

    // Process inscriptions with enhanced coordinates
    const inscriptionsWithCoords = processInscriptionCoordinates(inscriptions, isVikingMode);

    // Add all markers (now async)
    const addMarkersAsync = async () => {
      try {
        const newMarkers = await addMapMarkers(
          map,
          inscriptionsWithCoords,
          onMarkerClick,
          isVikingMode,
          fortresses,
          enabledLegendItems,
          selectedTimePeriod,
          historicalEvents,
          vikingCities,
          inscriptionEmphasis.opacity
        );

        markersRef.current = newMarkers;
        console.log(`=== TOTAL MARKERS ADDED: ${markersRef.current.length} ===`);
        
        setMarkers(markersRef.current);
      } catch (error) {
        console.error('Error adding markers:', error);
      }
    };

    addMarkersAsync();

    return () => {
      // ✅ SÄKER cleanup med race condition-skydd
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => {
          try {
            if (marker && map && map.hasLayer && map.hasLayer(marker)) {
              map.removeLayer(marker);
            }
          } catch (error) {
            console.warn('⚠️ Error removing marker during cleanup:', error);
          }
        });
        markersRef.current = [];
      }
    };
  }, [
    map,
    inscriptions,
    fortresses,
    isVikingMode,
    selectedPeriod,
    selectedTimePeriod,
    onMarkerClick,
    enabledLegendItems,
    historicalEvents,
    inscriptionEmphasis.opacity
  ]);

  return { generateLegendData };
};
