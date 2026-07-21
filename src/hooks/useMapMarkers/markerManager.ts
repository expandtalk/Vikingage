
import L from 'leaflet';
import { addRunicInscriptionMarkers } from '../map/useRunicInscriptionMarkers';
import { addVikingFortressMarkers } from '../map/useVikingFortressMarkers';
import { addStakeBarrierMarkers } from '../map/useStakeBarrierMarkers';
import { addReligiousLocationMarkers } from '../map/useReligiousLocationMarkers';
import { addGermanicGroupMarkers } from '../map/useGermanicGroupMarkers';
import { addFolkGroupMarkers } from '../map/useFolkGroupMarkers';
import { addHistoricalEventMarkers } from './historicalEventMarkers';
import { BaseInscription } from '@/types/inscription';
import { HistoricalEventMarker } from '@/hooks/useHistoricalEventMarkers';

export const addMapMarkers = async (
  map: L.Map,
  inscriptionsWithCoords: BaseInscription[],
  onMarkerClick: ((inscription: BaseInscription) => void) | undefined,
  isVikingMode: boolean,
  fortresses: any[],
  enabledLegendItems: { [key: string]: boolean },
  selectedTimePeriod: string,
  historicalEvents: HistoricalEventMarker[] = [],
  vikingCities: any[] = [],
  inscriptionOpacity: number = 1
): Promise<L.Marker[]> => {
  const markers: L.Marker[] = [];

  // Add runic inscriptions if enabled
  if (enabledLegendItems.runic_inscriptions !== false && inscriptionsWithCoords.length > 0) {
    console.log(`🗿 Adding ${inscriptionsWithCoords.length} runic inscription markers`);
    const inscriptionMarkers = addRunicInscriptionMarkers(map, inscriptionsWithCoords, onMarkerClick);
    // Dämpa/lyft inskriftsmarkörerna enligt aktiv profils primärlager-betoning.
    if (inscriptionOpacity !== 1) {
      inscriptionMarkers.forEach((m) => m.setOpacity(inscriptionOpacity));
    }
    markers.push(...inscriptionMarkers);
    console.log(`✅ Added ${inscriptionMarkers.length} runic inscription markers`);
  } else {
    // Lagret avstängt (eller inga träffar): städa bort ev. kvarvarande runstenskluster.
    // Klustret ligger på map.__runeClusterGroup, inte i markers[], så anroparens
    // per-markör-städning missar det → runstenar låg kvar trots avstängd toggle (fix).
    const mapAny = map as unknown as { __runeClusterGroup?: L.LayerGroup };
    if (mapAny.__runeClusterGroup && map.hasLayer(mapAny.__runeClusterGroup)) {
      map.removeLayer(mapAny.__runeClusterGroup);
      mapAny.__runeClusterGroup = undefined;
    }
  }

  // Add folk group markers if enabled (await the async function)
  if (enabledLegendItems.folk_groups !== false) {
    console.log(`👥 Adding folk group markers for period: ${selectedTimePeriod}`);
    const folkGroupMarkers = await addFolkGroupMarkers(map, selectedTimePeriod, enabledLegendItems);
    markers.push(...folkGroupMarkers);
    console.log(`✅ Added ${folkGroupMarkers.length} folk group markers`);
  }

  // Add Viking fortress markers if enabled
  if (fortresses.length > 0 && selectedTimePeriod === 'viking_age') {
    // Check if general viking_fortresses is enabled OR specific fortress types
    const shouldAddFortresses = enabledLegendItems.viking_fortresses !== false || 
                               enabledLegendItems.royal_center !== false;

    if (shouldAddFortresses) {
      console.log(`🏰 Adding Viking fortress markers: ${fortresses.length} fortresses`);
      
      if (enabledLegendItems.royal_center !== false) {
        const fortressMarkers = addVikingFortressMarkers(map, fortresses, 'royal_center', true);
        markers.push(...fortressMarkers);
      }
      
      ['ring_fortress', 'fortress', 'hillfort', 'longphort', 'coastal_defense'].forEach(type => {
        if (enabledLegendItems[type] !== false || enabledLegendItems.viking_fortresses !== false) {
          const fortressMarkers = addVikingFortressMarkers(map, fortresses, type, true);
          markers.push(...fortressMarkers);
        }
      });
    }
  }

  if (isVikingMode && enabledLegendItems.stake_barriers !== false && selectedTimePeriod === 'viking_age') {
    const stakeBarrierMarkers = addStakeBarrierMarkers(map, true);
    markers.push(...stakeBarrierMarkers);
  }

  if (enabledLegendItems.religious_places !== false) {
    console.log(`✅ Religious places ENABLED - adding markers`);
    const religiousMarkers = addReligiousLocationMarkers(map, enabledLegendItems, selectedTimePeriod);
    markers.push(...religiousMarkers);
  } else {
    console.log(`🚫 Religious places DISABLED - skipping markers`);
  }

  // Note: Archaeological find markers are rendered by useMapLayers/useArchaeologicalMarkers
  // (src/hooks/map/archaeological/useArchaeologicalMarkers.ts) to avoid double-rendering.

  if (enabledLegendItems.germanic_timeline !== false) {
    const germanicMarkers = addGermanicGroupMarkers(map, selectedTimePeriod, enabledLegendItems);
    markers.push(...germanicMarkers);
  }

  // Add historical event markers if enabled
  if (enabledLegendItems.historical_events !== false && historicalEvents.length > 0) {
    console.log(`🏛️ Adding ${historicalEvents.length} historical event markers`);
    const eventMarkers = addHistoricalEventMarkers(map, historicalEvents);
    markers.push(...eventMarkers);
    console.log(`✅ Added ${eventMarkers.length} historical event markers`);
  }

  // Add Viking cities/centers if enabled
  if (enabledLegendItems.viking_cities !== false && selectedTimePeriod === 'viking_age') {
    console.log(`🏘️ Adding Viking centers markers`);
    // Import the Viking city markers hook and add them
    const { addVikingCityMarkers } = await import('../map/useVikingCityMarkers');
    const cityMarkers = await addVikingCityMarkers(map, vikingCities, 'all', enabledLegendItems);
    markers.push(...cityMarkers);
    console.log(`✅ Added ${cityMarkers.length} Viking city markers`);
  }

  // Note: River routes and Valdemar's route are now handled by dedicated hooks in useMapInitialization

  return markers;
};
