import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { usePlaceNameMarkers, PlaceNameMarker } from '@/hooks/map/usePlaceNameMarkers';
import { useActiveExploreProfile } from '@/hooks/useExploreProfiles';
import { layerEmphasis, emphasisStyle } from '@/config/exploreProfiles';

/**
 * Ortnamnslager (GIS-pilot).
 * Design: docs/superpowers/specs/2026-07-17-ortnamn-gis-pilot-design.md
 *
 * Speglar ArchaeologicalSitesLayer. Visar ALLA ortnamn som matchar aktiva element —
 * inget handplockat urval (vetenskapligt krav, rapport §5.1).
 */

interface PlaceNamesLayerProps {
  map: L.Map | null;
  enabledLegendItems: { [key: string]: boolean };
  isVisible: boolean;
  onCountChange?: (count: number) => void;
}

export const PlaceNamesLayer: React.FC<PlaceNamesLayerProps> = ({
  map,
  enabledLegendItems,
  isVisible,
  onCountChange,
}) => {
  const markersRef = useRef<L.Marker[]>([]);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const placeNames = usePlaceNameMarkers(enabledLegendItems, isVisible);

  const activeProfile = useActiveExploreProfile();
  const emphasis = emphasisStyle(layerEmphasis(activeProfile, 'place_names'));

  const clearMarkers = () => {
    try {
      if (layerGroupRef.current && map && map.hasLayer && map.hasLayer(layerGroupRef.current)) {
        layerGroupRef.current.clearLayers();
      }
      markersRef.current = [];
    } catch (error) {
      console.warn('⚠️ Error clearing place name markers:', error);
    }
  };

  const createMarker = (place: PlaceNameMarker): L.Marker => {
    const iconHtml = `
      <div style="
        background-color: ${place.color};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${place.symbol}
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -11],
      className: 'place-name-marker',
    });

    return L.marker(place.position, { icon: customIcon }).bindPopup(place.popupContent, {
      maxWidth: 320,
      className: 'place-name-popup',
    });
  };

  useEffect(() => {
    if (!map || !isVisible) {
      clearMarkers();
      onCountChange?.(0);
      return;
    }

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    clearMarkers();

    placeNames.forEach((place) => {
      const marker = createMarker(place);
      markersRef.current.push(marker);
      if (layerGroupRef.current) {
        marker.addTo(layerGroupRef.current);
      }
    });

    // Dämpa hela lagret när profilen inte har ortnamn som primärlager.
    layerGroupRef.current?.eachLayer((layer: any) => {
      if (typeof layer.setOpacity === 'function') layer.setOpacity(emphasis.opacity);
    });

    console.log(`🏷️ Place names: rendered ${placeNames.length} markers`);
    onCountChange?.(placeNames.length);

    return () => {
      clearMarkers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isVisible, placeNames, emphasis.opacity]);

  // Säker cleanup när komponenten unmountas.
  useEffect(() => {
    return () => {
      try {
        if (layerGroupRef.current && map && map.hasLayer && map.hasLayer(layerGroupRef.current)) {
          map.removeLayer(layerGroupRef.current);
        }
      } catch (error) {
        console.warn('⚠️ Error removing place name layer group during cleanup:', error);
      }
    };
  }, [map]);

  return null;
};
