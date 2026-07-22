
import { useState, useEffect, useMemo, useCallback } from 'react';
import { generateBasicInscriptionItems } from './legend/legendItemGenerators';
import { LEGEND_DEFAULTS } from './legend/itemEnabled';
import { processLegendItems } from './legend/legendItemProcessor';
import { filterInscriptionsByLegend } from './useLegendManager/inscriptionFilters';
import { useFocusManager } from './useFocusManager';
import { useChristianSites } from './useChristianSites';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t, language } = useLanguage();
  const [enabledLegendItems, setEnabledLegendItems] = useState<{ [key: string]: boolean }>({});

  // Fetch Christian sites data
  const { data: christianSites = [] } = useChristianSites();

  // "Kom ihåg min vy": spara/återställ legend-läget lokalt. När användaren INTE kommit
  // via en focus-vy (kort/deep-link) och har en sparad vy → återställ den ovanpå profilen.
  // Focus (kort) vinner alltid, så kuraterade vyer inte skrivs över.
  const SAVED_VIEW_KEY = 'vikingage_saved_legend_view_v1';
  useEffect(() => {
    let saved: Record<string, boolean> | null = null;
    try { const raw = localStorage.getItem(SAVED_VIEW_KEY); if (raw) saved = JSON.parse(raw); } catch { /* privat läge */ }
    if (!currentFocus && saved && typeof saved === 'object') {
      setEnabledLegendItems({ ...roleLayerPreset, ...saved });
    } else {
      setEnabledLegendItems({ ...roleLayerPreset });
    }
  }, [roleLayerPreset, currentFocus]);

  // Auto-spara vyn (så den kommer tillbaka nästa besök). Hoppar över tomt init-läge.
  useEffect(() => {
    if (Object.keys(enabledLegendItems).length === 0) return;
    try { localStorage.setItem(SAVED_VIEW_KEY, JSON.stringify(enabledLegendItems)); } catch { /* quota/privat */ }
  }, [enabledLegendItems]);
  
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
      t,
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
  }, [inscriptions, isVikingMode, selectedTimePeriod, enabledLegendItems, language]);

  // Handle legend toggle. En KATEGORI (post med barn) styr sina barn: kartlagren gate:ar
  // på barnens nycklar, så en kategori-toggle måste kaskadera — annars gömdes bara barnen
  // medan lagret låg kvar (kunde ej stängas av; Daniel: focus=churches). Stäng av → alla
  // barn av. Slå på → barnen till sin default (LEGEND_DEFAULTS) så tunga opt-in-lager inte
  // tänds oväntat och ett vettigt utgångsläge återställs.
  const handleLegendToggle = useCallback((itemId: string) => {
    setEnabledLegendItems(prevState => {
      const newValue = !prevState[itemId];
      const newState = { ...prevState, [itemId]: newValue };

      const findItem = (items: any[], id: string): any => {
        for (const it of items) {
          if (it.id === id) return it;
          if (it.children) { const f = findItem(it.children, id); if (f) return f; }
        }
        return null;
      };
      const collectChildIds = (item: any, acc: string[] = []): string[] => {
        (item.children || []).forEach((c: any) => { acc.push(c.id); collectChildIds(c, acc); });
        return acc;
      };

      const target = findItem(legendItems, itemId);
      if (target?.children?.length) {
        collectChildIds(target).forEach((cid) => {
          newState[cid] = newValue ? (LEGEND_DEFAULTS[cid] ?? false) : false;
        });
      }
      return newState;
    });
  }, [legendItems]);

  // Fokusera EN gud: visa bara den gudens kultplatser (religious_<deity>), dölj övriga.
  // deity = null → visa alla gudars kultplatser igen. Styr kartans religiösa lager
  // (useReligiousLocationMarkers gate:ar på religious_<deity> !== false).
  const DEITY_LEGEND_KEYS = [
    'religious_odin', 'religious_thor', 'religious_frey', 'religious_freyja',
    'religious_frigg', 'religious_ull', 'religious_njord', 'religious_other',
  ];
  const focusDeity = useCallback((deityKey: string | null) => {
    setEnabledLegendItems(prevState => {
      const newState = { ...prevState, religious_places: true, gods: false };
      DEITY_LEGEND_KEYS.forEach(k => {
        newState[k] = deityKey ? k === deityKey : true;
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
      'viking_cities', 'historical_events', 'valdemar_route',
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
    handleHideAll,
    focusDeity
  };
};
