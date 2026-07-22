import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RELIGIOUS_PLACES, ReligiousPlace, getPairedPlaces, getPlacesForTimePeriod } from '@/utils/religiousLocations/religiousPlacesData';
import { HISTORICAL_PERIODS, getPeriodForYear } from '@/utils/religiousLocations/chronology';
import { globalMarkerManager, getMarkerPriority } from '@/utils/markerPriority';

const getDeityIcon = (deity: string): string => {
  switch (deity) {
    case 'thor': return '⚡';
    case 'odin': return '👁️';
    case 'frey': return '🌾';
    case 'ull': return '🏹';
    case 'njord': return '🌊';
    case 'frigg': return '👸';
    default: return '⛪';
  }
};

const getDeityColor = (deity: string): { background: string; border: string; text: string } => {
  switch (deity) {
    case 'thor':
      return { background: 'rgba(239, 68, 68, 0.9)', border: '#dc2626', text: '#ffffff' };
    case 'odin':
      return { background: 'rgba(59, 130, 246, 0.9)', border: '#2563eb', text: '#ffffff' };
    case 'frey':
      return { background: 'rgba(34, 197, 94, 0.9)', border: '#16a34a', text: '#ffffff' };
    case 'ull':
      return { background: 'rgba(168, 85, 247, 0.9)', border: '#7c3aed', text: '#ffffff' };
    case 'njord':
      return { background: 'rgba(14, 165, 233, 0.9)', border: '#0284c7', text: '#ffffff' };
    case 'frigg':
      return { background: 'rgba(236, 72, 153, 0.9)', border: '#db2777', text: '#ffffff' };
    default:
      return { background: 'rgba(156, 163, 175, 0.9)', border: '#6b7280', text: '#ffffff' };
  }
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'temple': return '🏛️';
    case 'sacred_grove': return '🌳';
    case 'offering_spring': return '💧';
    case 'royal_center': return '👑';
    case 'cult_site': return '⛩️';
    case 'rock_carving': return '🗿';
    default: return '📍';
  }
};

const createReligiousPlaceMarker = (
  place: ReligiousPlace,
  map: L.Map,
  isPaired: boolean = false,
  isMultiple: boolean = false,
  selectedTimePeriod: string = 'viking_age'
): L.Marker => {
  const markerType = 'religious_places';
  const priority = getMarkerPriority(markerType);

  // Check with deduplication manager
  const shouldShow = globalMarkerManager.addMarker({
    location: { lat: place.coordinates.lat, lng: place.coordinates.lng },
    type: markerType,
    priority,
    name: place.name,
    data: place
  });

  if (!shouldShow) {
    console.log(`⏭️ Skipping religious place ${place.name} - higher priority marker exists`);
    return null;
  }

  const deityIcon = getDeityIcon(place.deity);
  const typeIcon = getTypeIcon(place.type);
  const colors = getDeityColor(place.deity);
  
  // Storlek baserat på betydelse och ålder
  const getMarkerSize = () => {
    if (place.establishedPeriod === 'neolithic') return { width: 150, height: 44, fontSize: 14 };
    if (place.establishedPeriod === 'bronze_age') return { width: 145, height: 42, fontSize: 13 };
    if (place.type === 'royal_center') return { width: 140, height: 42, fontSize: 13 };
    if (place.type === 'temple') return { width: 130, height: 40, fontSize: 12 };
    if (isPaired) return { width: 120, height: 38, fontSize: 11 };
    return { width: 110, height: 36, fontSize: 11 };
  };

  const size = getMarkerSize();
  
  // Lägg till visuella indikatorer för ålder
  let borderStyle = `3px solid ${colors.border}`;
  if (place.establishedPeriod === 'neolithic' || place.establishedPeriod === 'bronze_age') {
    borderStyle = `4px double ${colors.border}`; // Dubbel ram för äldre platser
  }
  if (isPaired) {
    borderStyle = `3px double ${colors.border}`;
  }
  if (isMultiple) {
    borderStyle = `3px dashed ${colors.border}`;
  }

  const customIcon = L.divIcon({
    html: `<div style="
      background: ${colors.background};
      min-width: ${size.width}px;
      height: ${size.height}px;
      border-radius: ${size.height/2}px;
      border: ${borderStyle};
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${size.fontSize}px;
      font-weight: bold;
      color: ${colors.text};
      text-align: center;
      padding: 0 12px;
      white-space: nowrap;
      gap: 6px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      backdrop-filter: blur(3px);
      z-index: 600;
    ">
      <span style="font-size: ${size.fontSize + 2}px;">${deityIcon}</span>
      <span style="font-size: ${size.fontSize - 1}px;">${typeIcon}</span>
      <span style="color: ${colors.text};">${place.name.split(' (')[0]}</span>
    </div>`,
    className: `religious-place-marker ${place.deity} ${place.establishedPeriod}`,
    iconSize: [size.width, size.height],
    iconAnchor: [size.width/2, size.height/2]
  });

  // Förbättrad popup med periodinformation
  const establishedPeriodData = HISTORICAL_PERIODS.find(p => p.id === place.establishedPeriod);
  const activeInPeriods = place.historicalPeriods.map(pid => 
    HISTORICAL_PERIODS.find(p => p.id === pid)?.name
  ).filter(Boolean).join(', ');

  // Skapa evidenstaggar
  const evidenceTags = place.evidence.map(ev => {
    const evidenceLabels = {
      'runestone': '📜 Runsten',
      'archaeological': '🏺 Arkeologi',
      'place_name': '📝 Ortnamn',
      'church_foundation': '⛪ Kyrkogrund',
      'historical_record': '📖 Historisk källa',
      'cathedral': '⛪ Katedral',
    };
    return `<span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: ${colors.background}60; color: #ffffff !important; border: 1px solid ${colors.border}; margin: 2px;">
      ${evidenceLabels[ev] || ev}
    </span>`;
  }).join('');

  const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: customIcon })
    .bindPopup(`
      <div style="background: rgba(30, 41, 59, 0.98) !important; color: white !important; padding: 16px; border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.4); border: 3px solid ${colors.border}; backdrop-filter: blur(6px); min-width: 320px; max-width: 360px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${colors.border}; background: ${colors.background}; display: flex; align-items: center; justify-content: center; font-size: 18px;">
            <span style="color: #ffffff;">${deityIcon}</span>
          </div>
          <div>
            <h3 style="font-weight: bold; font-size: 18px; color: #ffffff !important; margin: 0;">${place.name}</h3>
            <p style="font-size: 13px; color: rgba(255,255,255,0.7) !important; margin: 2px 0 0 0;">${place.region}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <p style="color: rgba(255,255,255,0.9) !important; font-size: 14px; line-height: 1.5; margin: 0;">${place.description}</p>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
          ${evidenceTags}
          ${isPaired ? '<span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: rgba(147, 51, 234, 0.6); color: #ffffff !important; border: 1px solid #7c3aed; margin: 2px;">🔗 Gudapar</span>' : ''}
          ${isMultiple ? '<span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: rgba(245, 158, 11, 0.6); color: #ffffff !important; border: 1px solid #d97706; margin: 2px;">📍 Multipel plats</span>' : ''}
        </div>
        
        <div style="margin-bottom: 12px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 6px;">
          <p style="font-size: 12px; color: rgba(255,255,255,0.8) !important; margin: 0;"><strong>Etablerad:</strong> ${establishedPeriodData?.name || place.establishedPeriod}</p>
          <p style="font-size: 12px; color: rgba(255,255,255,0.8) !important; margin: 4px 0 0 0;"><strong>Aktiv under:</strong> ${activeInPeriods}</p>
        </div>
        
      </div>
    `, {
      maxWidth: 380,
      className: 'religious-place-popup'
    });

  return marker;
};

export const addReligiousLocationMarkers = (
  map: L.Map | null,
  enabledItems: { [key: string]: boolean },
  selectedTimePeriod: string = 'viking_age'
): L.Marker[] => {
  console.log(`🔍 RELIGIOUS PLACES DEBUG:`, {
    mapExists: !!map,
    religious_places_value: enabledItems.religious_places,
    religious_places_type: typeof enabledItems.religious_places,
    is_explicitly_false: enabledItems.religious_places === false,
    selectedTimePeriod
  });

  if (!map) {
    console.log(`❌ No map - returning empty array`);
    return [];
  }

  const markers: L.Marker[] = [];
  
  // STRIKTA CHECK: religious_places måste explicit vara !== false för att visa
  if (enabledItems.religious_places === false) {
    console.log(`🚫🚫🚫 RELIGIOUS PLACES EXPLICITLY DISABLED - RETURNING EMPTY ARRAY`);
    return markers;
  }
  
  // Extra check: om religious_places är undefined, visa inte heller
  if (enabledItems.religious_places === undefined || enabledItems.religious_places === null) {
    console.log(`⚠️ Religious places is undefined/null - NOT showing to be safe`);
    return markers;
  }

  console.log('✅ Religious places IS ENABLED - proceeding to add markers for time period:', selectedTimePeriod);

  // Offerkällor är flyttade till kulturlagret (heritage_sites, 'Källa med tradition') och
  // ritas där med diskret ikon — visas ej längre bland gudarnas kultplatser (blaffigt).
  const placesForPeriod = getPlacesForTimePeriod(selectedTimePeriod).filter((p) => p.type !== 'offering_spring');
  console.log(`Found ${placesForPeriod.length} religious places for period ${selectedTimePeriod}`);

  const pairedPlaces = getPairedPlaces();
  const pairedIds = new Set();
  Object.values(pairedPlaces).forEach(pair => {
    pair.forEach(place => pairedIds.add(place.id));
  });

  const multiplePlaces = new Set();
  placesForPeriod.forEach(place => {
    if (place.isMultiple) {
      multiplePlaces.add(place.id);
    }
  });

  placesForPeriod.forEach(place => {
    const deityKey = `religious_${place.deity}`;
    if (enabledItems[deityKey] === false) {
      return;
    }

    const isPaired = pairedIds.has(place.id);
    const isMultiple = multiplePlaces.has(place.id);
    
    const marker = createReligiousPlaceMarker(place, map, isPaired, isMultiple, selectedTimePeriod);
    if (marker) {
      map.addLayer(marker);
      markers.push(marker);
    }
  });

  // Skapa linjer mellan parade platser (endast om båda är aktiva under perioden)
  Object.values(pairedPlaces).forEach(pair => {
    if (pair.length === 2) {
      const [place1, place2] = pair;
      
      const place1Active = placesForPeriod.some(p => p.id === place1.id);
      const place2Active = placesForPeriod.some(p => p.id === place2.id);
      
      if (place1Active && place2Active) {
        const colors1 = getDeityColor(place1.deity);
        
        const polyline = L.polyline([
          [place1.coordinates.lat, place1.coordinates.lng],
          [place2.coordinates.lat, place2.coordinates.lng]
        ], {
          color: colors1.border,
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 5'
        }).bindPopup(`
          <div style="background: rgba(30, 41, 59, 0.98) !important; color: white !important; padding: 12px; border-radius: 6px;">
            <h4 style="color: #ffffff !important; margin: 0 0 8px 0;">Gudapar</h4>
            <p style="color: rgba(255,255,255,0.9) !important; margin: 0; font-size: 13px;">
              ${place1.name} ↔ ${place2.name}<br>
              <small style="color: rgba(255,255,255,0.7) !important;">Kosmologisk enhet i forntida trossystem</small>
            </p>
          </div>
        `);
        
        map.addLayer(polyline);
      }
    }
  });

  console.log(`Added ${markers.length} religious location markers for period ${selectedTimePeriod} (after deduplication)`);
  return markers;
};
