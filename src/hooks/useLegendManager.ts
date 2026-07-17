
import { useState, useEffect, useMemo, useCallback } from 'react';
import { generateBasicInscriptionItems } from './legend/legendItemGenerators';
import { processLegendItems } from './legend/legendItemProcessor';
import { filterInscriptionsByLegend } from './useLegendManager/inscriptionFilters';
import { useFocusManager } from './useFocusManager';
import { useChristianSites } from './useChristianSites';
import type { LegendPreset } from '@/types/legend';

export const useLegendManager = (
  inscriptions: any[],
  isVikingMode: boolean,
  selectedTimePeriod: string,
  roleLayerPreset: LegendPreset,
  dbStats?: any,
  hasActiveSearch?: boolean,
  searchResultInscriptions?: any[]
) => {
  const { currentFocus } = useFocusManager();
  const [enabledLegendItems, setEnabledLegendItems] = useState<{ [key: string]: boolean }>({});

  // Fetch Christian sites data
  const { data: christianSites = [] } = useChristianSites();

  // Initialize and update legend based on resolved profile preset (focus already merged upstream)
  useEffect(() => {
    setEnabledLegendItems({ ...roleLayerPreset });
  }, [roleLayerPreset]);
  
  console.log(`🎭 Legend Manager Debug (UPDATED):`);
  console.log(`  - Total inscriptions received: ${inscriptions.length}`);
  console.log(`  - Runic inscriptions enabled: ${enabledLegendItems.runic_inscriptions}`);
  console.log(`  - Current focus: ${currentFocus}`);
  console.log(`  - Role layer preset:`, roleLayerPreset);
  
  // Filter inscriptions based on enabled legend items or use search results if active search
  const mapInscriptions = useMemo(() => {
    console.log(`🔍 Filtering inscriptions for map (UPDATED)...`);
    console.log(`  - Input inscriptions: ${inscriptions.length}`);
    console.log(`  - Has active search: ${hasActiveSearch}`);
    console.log(`  - Search results count: ${searchResultInscriptions?.length || 0}`);
    console.log(`  - Runic inscriptions setting: ${enabledLegendItems.runic_inscriptions}`);
    
    // If there's an active search, show only search results on the map
    if (hasActiveSearch && searchResultInscriptions) {
      console.log(`🎯 Using search results for map display: ${searchResultInscriptions.length} inscriptions`);
      const filtered = filterInscriptionsByLegend(searchResultInscriptions, enabledLegendItems, isVikingMode, selectedTimePeriod);
      console.log(`📊 Search results after legend filtering: ${filtered.length}`);
      return filtered;
    }
    
    // Otherwise, show all inscriptions filtered by legend
    const filtered = filterInscriptionsByLegend(inscriptions, enabledLegendItems, isVikingMode, selectedTimePeriod);
    
    console.log(`📊 Inscription filtering results (UPDATED):`);
    console.log(`  - Input inscriptions: ${inscriptions.length}`);
    console.log(`  - Filtered inscriptions: ${filtered.length}`);
    
    return filtered;
  }, [inscriptions, enabledLegendItems, isVikingMode, selectedTimePeriod, hasActiveSearch, searchResultInscriptions]);

  // Generate legend items with correct counts
  const legendItems = useMemo(() => {
    console.log(`🏷️ Generating legend items (UPDATED)...`);
    
    const rawItems = generateBasicInscriptionItems(
      inscriptions, 
      isVikingMode, 
      enabledLegendItems, 
      (key: string) => key,
      selectedTimePeriod,
      dbStats,
      christianSites
    );
    
    const processedItems = processLegendItems(rawItems, enabledLegendItems);
    
    console.log(`📋 Legend items generated: ${processedItems.length}`);
    const runicItem = processedItems.find(item => item.id === 'runic_inscriptions');
    if (runicItem) {
      console.log(`📿 Runic inscriptions legend item:`, {
        id: runicItem.id,
        label: runicItem.label,
        count: runicItem.count,
        enabled: runicItem.enabled
      });
    }
    
    return processedItems;
  }, [inscriptions, isVikingMode, selectedTimePeriod, enabledLegendItems]);

  // Handle legend toggle
  const handleLegendToggle = useCallback((itemId: string) => {
    console.log(`🔄 Toggling legend item: ${itemId}`);
    setEnabledLegendItems(prevState => {
      const newState = {
        ...prevState,
        [itemId]: !prevState[itemId],
      };
      console.log(`📊 Legend state after toggle:`, {
        itemId,
        oldValue: prevState[itemId],
        newValue: newState[itemId],
        runicInscriptionsEnabled: newState.runic_inscriptions
      });
      return newState;
    });
  }, []);

  // Handle show all / hide all
  const handleShowAll = useCallback(() => {
    console.log(`👁️ Showing all legend items`);
    setEnabledLegendItems(prevState => {
      const newState = { ...prevState };
      // Set all existing legend items to true (visible)
      legendItems.forEach(item => {
        newState[item.id] = true;
      });
      console.log(`🔧 After show all:`, newState);
      return newState;
    });
  }, [legendItems]);

  const handleHideAll = useCallback(() => {
    console.log(`🙈 Hiding all legend items`);
    // Gate keys that render a layer but may be ABSENT from the generated
    // legendItems (nested children, or gate-only aliases that differ from the
    // profile-preset key). Without explicitly clearing these, their
    // `!== false` gates keep the layer on the map after "hide all".
    const EXTRA_GATE_KEYS = [
      'viking_centers', 'historical_events', 'valdemars_route',
      'road_rullstensas', 'road_halvagar', 'road_vinteragar', 'road_landmarks',
      'place_names_sacral', 'place_names_power', 'place_names_nature',
      'religious_center', 'trading_post', 'koping', 'established_city', 'gotlandic_center',
    ];
    setEnabledLegendItems(prevState => {
      const newState = { ...prevState };
      // Clear every currently-known key (covers the full profile preset set)…
      Object.keys(newState).forEach(k => { newState[k] = false; });
      // …plus the generated legend item ids and the extra gate keys above.
      legendItems.forEach(item => { newState[item.id] = false; });
      EXTRA_GATE_KEYS.forEach(k => { newState[k] = false; });
      console.log(`🔧 After hide all:`, newState);
      return newState;
    });
  }, [legendItems]);

  console.log(`✅ Legend Manager returning (UPDATED):`);
  console.log(`  - Input inscriptions: ${inscriptions.length}`);
  console.log(`  - Map inscriptions: ${mapInscriptions.length}`);
  console.log(`  - Legend items: ${legendItems.length}`);

  return {
    enabledLegendItems,
    legendItems,
    mapInscriptions,
    handleLegendToggle,
    handleShowAll,
    handleHideAll
  };
};
