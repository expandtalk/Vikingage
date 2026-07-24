import L from 'leaflet';
import { HistoricalEventMarker, getEventTypeColor, getEventTypeIcon, getSignificanceSize } from '@/hooks/useHistoricalEventMarkers';
import { createPlaceMedallion, markerColor } from '@/utils/map/placeMarker';

// Händelsetyp → medaljong-ikon.
const EVENT_ICON: Record<string, string> = {
  raid: 'shield', settlement: 'house', political: 'scroll',
  military: 'shield', religious: 'cross', trade: 'coin',
};

export const createHistoricalEventMarker = (
  event: HistoricalEventMarker,
  map: L.Map
): L.Marker | null => {
  if (!event.coordinates) {
    return null;
  }

  const { lat, lng } = event.coordinates;
  const color = getEventTypeColor(event.event_type);

  // Gemensam medaljong: händelsetyp-ikon, dämpad ring, händelsenamnet under.
  const customIcon = createPlaceMedallion({
    color: markerColor('event'),
    icon: EVENT_ICON[event.event_type] || 'scroll',
    label: event.event_name,
    className: `historical-event ${event.event_type}`,
  });

  const marker = L.marker([lat, lng], { icon: customIcon });

  // Create popup content
  const yearRange = event.year_end && event.year_end !== event.year_start
    ? `${event.year_start}-${event.year_end}`
    : `${event.year_start}`;

  const popupContent = `
    <div class="historical-event-popup">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: ${color};">
        ${event.event_name}
      </h3>
      <div style="margin-bottom: 6px;">
        <strong>År:</strong> ${yearRange}
      </div>
      <div style="margin-bottom: 6px;">
        <strong>Typ:</strong> ${getEventTypeLabel(event.event_type)}
      </div>
      <div style="margin-bottom: 6px;">
        <strong>Betydelse:</strong> ${getSignificanceLabel(event.significance_level)}
      </div>
      ${event.region_affected && event.region_affected.length > 0 ? `
        <div style="margin-bottom: 6px;">
          <strong>Regioner:</strong> ${event.region_affected.join(', ')}
        </div>
      ` : ''}
      ${event.description ? `
        <div style="margin-top: 8px; font-size: 12px; color: #666;">
          ${event.description}
        </div>
      ` : ''}
    </div>
  `;

  marker.bindPopup(popupContent, {
    maxWidth: 300,
    className: 'historical-event-popup-container'
  });

  return marker;
};

export const addHistoricalEventMarkers = (
  map: L.Map,
  events: HistoricalEventMarker[]
): L.Marker[] => {
  const markers: L.Marker[] = [];

  events.forEach(event => {
    const marker = createHistoricalEventMarker(event, map);
    if (marker) {
      marker.addTo(map);
      markers.push(marker);
    }
  });

  console.log(`✅ Added ${markers.length} historical event markers to map`);
  return markers;
};

// Helper functions for labels
const getEventTypeLabel = (eventType: string): string => {
  const labels: { [key: string]: string } = {
    'raid': 'Plundring',
    'settlement': 'Bosättning',
    'political': 'Politisk händelse',
    'military': 'Militär händelse',
    'religious': 'Religiös händelse',
    'trade': 'Handelshändelse'
  };
  return labels[eventType] || eventType;
};

const getSignificanceLabel = (significance: string): string => {
  const labels: { [key: string]: string } = {
    'very_high': 'Mycket hög',
    'high': 'Hög',
    'medium': 'Medel',
    'low': 'Låg'
  };
  return labels[significance] || significance;
};