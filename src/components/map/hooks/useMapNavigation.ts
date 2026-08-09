
import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';

interface UseMapNavigationProps {
  map: L.Map | null;
  onMapNavigate?: (navFunction: (lat: number, lng: number, zoom: number, label?: string) => void) => void;
}

export const useMapNavigation = ({ map, onMapNavigate }: UseMapNavigationProps) => {
  // Highlight-markör för den plats sökningen faktiskt löste upp. Utan denna centrerades bara
  // kartan (setView) och en granne kunde visuellt utge sig för att vara resultatet (Nicolai→Birgitta-buggen).
  const highlightRef = useRef<L.CircleMarker | null>(null);

  // Set up map navigation function with proper validation
  const handleMapNavigate = useCallback((lat: number, lng: number, zoom: number, label?: string) => {
    // Validate coordinates before attempting to navigate
    if (!map) {
      console.warn('Map not initialized for navigation');
      return;
    }

    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      console.warn('Invalid coordinates for map navigation:', { lat, lng, zoom });
      return;
    }

    if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
      console.warn('NaN values in coordinates for map navigation:', { lat, lng, zoom });
      return;
    }

    // Additional validation for reasonable coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('Coordinates out of valid range:', { lat, lng, zoom });
      return;
    }

    if (zoom < 0 || zoom > 20) {
      console.warn('Zoom level out of valid range:', { zoom });
      return;
    }

    try {
      map.setView([lat, lng], zoom, { animate: true, duration: 1.5 });
      // Rensa ev. tidigare highlight, och markera den upplösta platsen om ett namn gavs.
      if (highlightRef.current) { try { map.removeLayer(highlightRef.current); } catch { /* noop */ } highlightRef.current = null; }
      if (label) {
        const m = L.circleMarker([lat, lng], { radius: 9, color: '#f59e0b', weight: 3, fillColor: '#f59e0b', fillOpacity: 0.25 });
        m.bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -6], className: 'search-highlight-label' });
        m.addTo(map);
        highlightRef.current = m;
      }
    } catch (error) {
      console.error('Error navigating map:', error, { lat, lng, zoom });
    }
  }, [map]);

  // Call parent onMapNavigate if provided
  useEffect(() => {
    if (onMapNavigate) {
      console.log('🗺️ [useMapNavigation] Passing navigation function up to parent component.');
      onMapNavigate(handleMapNavigate);
    }
  }, [handleMapNavigate, onMapNavigate]);

  return { handleMapNavigate };
};
