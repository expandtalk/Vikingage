
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generateBasicInscriptionItems } from './legend/legendItemGenerators';
import { scopeLayersByPeriod, isEarlyPeriod, EARLY_DEFAULT_ON } from './legend/layerPeriodScope';
import { processLegendItems } from './legend/legendItemProcessor';
import { filterInscriptionsByLegend } from './useLegendManager/inscriptionFilters';
import { useFocusManager } from './useFocusManager';
import { useChristianSites } from './useChristianSites';
import { useLanguage } from '@/contexts/LanguageContext';
import { LEGEND_DEFAULTS } from './legend/itemEnabled';
import type { LegendPreset } from '@/types/legend';

// Persistensnyckel för "Kom ihåg min vy" (localStorage). Exporterad (inte lokal till hooken)
// så LegendControls' "Återställ till profilens standard"-knapp rensar EXAKT samma nyckel —
// en duplicerad literal där hade kunnat driva isär (v1→v2-bump missades i den andra filen).
// Bumpad v1→v2: gamla sparade vyer var profil-först och skulle blanda in ett preset som
// inte längre är basen (legenden/LEGEND_DEFAULTS är sanningskälla, se seed-effekten nedan).
export const SAVED_VIEW_KEY = 'vikingage_saved_legend_view_v2';

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

  // Period-scoping: för perioder äldre än vendeltid maskas icke-relevanta lager bort.
  // Rå-staten (enabledLegendItems) bevaras för toggles/sparning; kartan, legenden och
  // inskriftsfiltret drivs av den scope:ade versionen. Vendeltid/vikingatid = oförändrat.
  const scopedEnabled = useMemo(
    () => scopeLayersByPeriod(enabledLegendItems, selectedTimePeriod),
    [enabledLegendItems, selectedTimePeriod]
  );

  // "Kom ihåg min vy": spara/återställ legend-läget lokalt. Legenden är sanningskälla för
  // lager-synlighet — profil-presetet (roleLayerPreset) är INTE längre basen när ingen
  // focus är aktiv; default:ar i stället från LEGEND_DEFAULTS (profil styr fortf.
  // basemap/paneler/period). Focus (kort/deep-link) vinner alltid, så kuraterade vyer
  // (resolveProfileLayers) inte skrivs över. Nyckeln (SAVED_VIEW_KEY) är exporterad ovan.
  useEffect(() => {
    let saved: Record<string, boolean> | null = null;
    try { const raw = localStorage.getItem(SAVED_VIEW_KEY); if (raw) saved = JSON.parse(raw); } catch { /* privat läge */ }
    if (currentFocus) {
      // Focus bär sin kurerade override via resolveProfileLayers — behåll den oförändrad.
      setEnabledLegendItems({ ...roleLayerPreset });
    } else if (saved && typeof saved === 'object') {
      // Sparad vy vinner rakt av — profil-presetet ligger INTE längre under den.
      setEnabledLegendItems({ ...saved });
    } else {
      // Ingen focus, ingen sparad vy: seeda EXPLICIT med LEGEND_DEFAULTS (inte ett tomt
      // {}). Flera kart-hooks (t.ex. useMapHeritageSites) läser enabledLegendItems[key]
      // === true / !== false RAKT AV på rå-staten — de går INTE via itemEnabled()s
      // fallback. Ett tomt objekt hade osynliggjort opt-in-lager som ska vara PÅ som
      // standard (t.ex. heritage_grotta) och hållit deras legend-kategori hopfälld
      // (LegendCategory visar bara barn när kategorins enabled === true). Genom att
      // seeda med LEGEND_DEFAULTS får både legend-UI:t och kart-hooksen samma sanning.
      setEnabledLegendItems({ ...LEGEND_DEFAULTS });
    }
  }, [roleLayerPreset, currentFocus]);

  // Auto-spara vyn (så den kommer tillbaka nästa besök). Hoppar över tomt init-läge.
  useEffect(() => {
    if (Object.keys(enabledLegendItems).length === 0) return;
    try { localStorage.setItem(SAVED_VIEW_KEY, JSON.stringify(enabledLegendItems)); } catch { /* quota/privat */ }
  }, [enabledLegendItems]);

  // Djuptidens kärninnehåll (megaliter, folkgrupper, mynt, solidi …) seedas som DEFAULT PÅ
  // EN gång när man byter IN i en förhistorisk period — så kartan inte blir tom. Detta
  // ERSÄTTER den gamla scope-force:en (som gjorde lagren otogglingsbara). Skillnaden: här är
  // det bara ett utgångsläge — avbockning skriver rå-staten och sitter kvar (ref-vakt gör att
  // vi bara seedar vid FAKTISKT periodbyte, inte varje render). Lämnar man djuptid återställs
  // nycklarna till sina globala defaults så de inte läcker in i vendel/vikingatid.
  const lastSeededPeriodRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastSeededPeriodRef.current === selectedTimePeriod) return;
    const wasEarly = isEarlyPeriod(lastSeededPeriodRef.current ?? undefined);
    lastSeededPeriodRef.current = selectedTimePeriod;
    if (isEarlyPeriod(selectedTimePeriod)) {
      setEnabledLegendItems(prev => {
        const next = { ...prev };
        for (const k of EARLY_DEFAULT_ON) next[k] = true;
        return next;
      });
    } else if (wasEarly) {
      setEnabledLegendItems(prev => {
        const next = { ...prev };
        for (const k of EARLY_DEFAULT_ON) next[k] = LEGEND_DEFAULTS[k] ?? false;
        return next;
      });
    }
  }, [selectedTimePeriod]);
  
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
      const filtered = filterInscriptionsByLegend(searchResultInscriptions, scopedEnabled, isVikingMode, selectedTimePeriod);
      console.log(`📊 Search results after legend filtering: ${filtered.length}`);
      return filtered;
    }

    // Otherwise, show all inscriptions filtered by legend
    const filtered = filterInscriptionsByLegend(inscriptions, scopedEnabled, isVikingMode, selectedTimePeriod);
    
    console.log(`📊 Inscription filtering results (UPDATED):`);
    console.log(`  - Input inscriptions: ${inscriptions.length}`);
    console.log(`  - Filtered inscriptions: ${filtered.length}`);
    
    return filtered;
  }, [inscriptions, scopedEnabled, isVikingMode, selectedTimePeriod, hasActiveSearch, searchResultInscriptions]);

  // Generate legend items with correct counts
  const legendItems = useMemo(() => {
    console.log(`🏷️ Generating legend items (UPDATED)...`);
    
    const rawItems = generateBasicInscriptionItems(
      inscriptions,
      isVikingMode,
      scopedEnabled,
      t,
      selectedTimePeriod,
      dbStats,
      christianSites
    );

    const processedItems = processLegendItems(rawItems, scopedEnabled);
    
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
  }, [inscriptions, isVikingMode, selectedTimePeriod, scopedEnabled, language]);

  // Handle legend toggle. En KATEGORI (post med barn) styr sina barn: kartlagren gate:ar
  // på barnens nycklar, så en kategori-toggle måste kaskadera — annars gömdes bara barnen
  // medan lagret låg kvar (kunde ej stängas av; Daniel: focus=churches).
  // Slå på förälder → ALLA barn på. Stäng av → alla barn av. (Tidigare tändes barnen bara
  // till sin LEGEND_DEFAULTS, vilket för opt-in-barn = false → "inget hände" när man slog på
  // t.ex. Monastic orders / Church and christianity. Daniel: aktiverar man ett överval ska
  // alla underval aktiveras.)
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
          newState[cid] = newValue;   // förälder på → alla barn på; förälder av → alla barn av
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
      // Tänd ALLA — inkl. barn (intresse-underlagren). Utan rekursionen tändes bara
      // kategori-föräldrarna och kartan/intressena ändrades inte (Daniel: "Show all funkar ej").
      const setAll = (items: typeof legendItems) => items.forEach(item => {
        newState[item.id] = true;
        if (item.children) setAll(item.children as typeof legendItems);
      });
      setAll(legendItems);
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
      // …plus de genererade legend-ids (inkl. barn) och extra gate-nycklarna.
      const clearAll = (items: typeof legendItems) => items.forEach(item => {
        newState[item.id] = false;
        if (item.children) clearAll(item.children as typeof legendItems);
      });
      clearAll(legendItems);
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
    // Kartan/legenden får den period-scope:ade versionen; toggles/sparning arbetar
    // mot rå-staten via setEnabledLegendItems i handlers ovan.
    enabledLegendItems: scopedEnabled,
    legendItems,
    mapInscriptions,
    handleLegendToggle,
    handleShowAll,
    handleHideAll,
    focusDeity
  };
};
