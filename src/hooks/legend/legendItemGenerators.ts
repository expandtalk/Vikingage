
import { isUnderwaterInscription } from '@/utils/coordinateMapping';
import { getGroupsByPeriod } from '@/utils/germanicTimeline/timelineData';
import { getFindsInPeriod, ARCHAEOLOGICAL_FINDS } from '@/utils/archaeologicalFinds';
import { getDeityPlaces, getChristianCenters, getChristianCentersByType } from '@/utils/religiousLocations/religiousPlacesData';
import { generateChristianSitesLegendItems } from './christianSitesLegend';
import { ChristianSite } from '@/hooks/useChristianSites';
import { LegendItem, RunicInscription } from './types';

export const generateBasicInscriptionItems = (
  inscriptions: RunicInscription[],
  isVikingMode: boolean,
  enabledLegendItems: { [key: string]: boolean },
  t: (key: string) => string,
  selectedTimePeriod: string = 'all',
  dbStats?: any,
  christianSites?: ChristianSite[]
): LegendItem[] => {
  const items: LegendItem[] = [];

  console.log(`🏗️ CORRECT COUNT: Generating legend items with proper counts`);
  console.log(`📊 ACTUAL inscriptions count: ${inscriptions.length} (should be 2818+)`);
  console.log('🎯 DEBUG: First few inscriptions:', inscriptions.slice(0, 3).map(i => ({ signum: i.signum, coordinates: i.coordinates })));

  // Separera svenska och utländska runstenar
  const swedishInscriptions = inscriptions.filter(i => 
    !i.country || 
    i.country.toLowerCase().includes('sverige') || 
    i.country.toLowerCase().includes('sweden') ||
    i.country.toLowerCase() === 'sweden'
  );
  
  const foreignInscriptions = inscriptions.filter(i => 
    i.country && 
    !i.country.toLowerCase().includes('sverige') && 
    !i.country.toLowerCase().includes('sweden') &&
    i.country.toLowerCase() !== 'sweden'
  );

  console.log(`🇸🇪 Svenska runstenar: ${swedishInscriptions.length}`);
  console.log(`🌍 Utländska runstenar: ${foreignInscriptions.length}`);

  // 1. SVENSKA RUNSTENAR - första prioritet
  items.push({
    id: 'runic_inscriptions',
    label: t('swedishRunestones'),
    color: isVikingMode ? '#f97316' : '#ef4444',
    count: swedishInscriptions.length,
    enabled: enabledLegendItems.runic_inscriptions !== false
  });

  // 2. UTLÄNDSKA RUNSTENAR - andra prioritet
  if (foreignInscriptions.length > 0) {
    items.push({
      id: 'foreign_inscriptions',
      label: t('runestonesInOtherCountries'),
      color: isVikingMode ? '#8b5cf6' : '#a855f7',
      count: foreignInscriptions.length,
      enabled: enabledLegendItems.foreign_inscriptions !== false
    });
  }

  // 2. VIKINGACENTRA - andra prioritet
  if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'all') {
    items.push({
      id: 'viking_cities',
      label: t('vikingCenters'),
      color: '#8b5cf6',
      count: 49,
      enabled: enabledLegendItems.viking_cities !== false
    });
  }

  // 3+4. VATTENVÄGAR (kategori) — Valdemars segelled ligger nu UNDER vattenvägar.
  items.push({
    id: 'water_routes',
    label: '🌊 ' + t('vikingWaterways'),
    color: '#1e40af',
    count: 95 + 12,
    enabled: enabledLegendItems.water_routes !== false,
    type: 'category',
    children: [
      { id: 'valdemar_route', label: '⚔️ ' + t('valdemarsRoute'), color: '#1e3a8a', count: 95, enabled: enabledLegendItems.valdemar_route !== false },
      { id: 'river_routes', label: t('importantWaterways'), color: '#1e40af', count: 12, enabled: enabledLegendItems.river_routes !== false },
    ],
  });

  // 5. VIKINGATIDA VÄGAR - femte prioritet
  if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'all') {
    const roadChildren = [
      { id: 'road_rullstensas', label: t('eskerRoads'), color: '#CD853F', count: 5 },
      { id: 'road_halvagar', label: t('hollowWays'), color: '#A0522D', count: 2 },
      { id: 'road_vinteragar', label: t('winterRoads'), color: '#4682B4', count: 2 },
      { id: 'road_landmarks', label: t('bridgesAndFords'), color: '#2F4F4F', count: 5 }
    ].map(child => ({
      ...child,
      enabled: enabledLegendItems[child.id] !== false
    }));

    const totalRoadCount = roadChildren.reduce((sum, child) => sum + child.count, 0);
    
    items.push({
      id: 'viking_roads',
      label: t('vikingAgeRoads'),
      color: '#8B4513',
      count: totalRoadCount,
      enabled: enabledLegendItems.viking_roads !== false,
      type: 'category',
      children: roadChildren
    });
  }

  // 6. FORNBORGAR - sjätte prioritet
  items.push({
    id: 'viking_fortresses',
    label: t('fortresses'),
    color: '#dc2626',
    count: dbStats?.totalFortresses || 49,
    enabled: enabledLegendItems.viking_fortresses !== false
  });

  // (Vårdkasar ligger under "Kulturlager" som heritage_vardkase — den fristående
  //  beacon_sites-knappen togs bort för att undvika dubblett.)

  // Kulturarv (spatialt) — viewport-laddat lager (Steg 1). Skalar till obegränsat
  // antal punkter; laddar bara det som är i vyn via sites_in_bbox. AV som standard.
  // Kulturlager (spatialt, viewport-laddat). Kategori med per-typ-kryss — tänd
  // en typ i taget (sockenkyrkor, kloster, vårdkasar…). Allt AV som standard.
  // Föräldern 'heritage_sites' = "visa alla typer".
  items.push({
    id: 'heritage_sites',
    label: '🗺️ Kulturlager',
    color: '#7c3aed',
    count: 6385,
    // Föräldern PÅ som standard så per-typ-kryssen är åtkomliga (LegendCategory
    // döljer barn om parent är av). Kartan drivs av barnen — alla av → tom karta.
    enabled: enabledLegendItems.heritage_sites !== false,
    type: 'category',
    children: [
      { id: 'heritage_kyrka', label: 'Sockenkyrkor', color: '#e11d48', count: 4223, enabled: enabledLegendItems.heritage_kyrka === true },
      { id: 'heritage_kapell', label: 'Kapell', color: '#db2777', count: 275, enabled: enabledLegendItems.heritage_kapell === true },
      { id: 'heritage_kloster', label: 'Kloster', color: '#c026d3', count: 93, enabled: enabledLegendItems.heritage_kloster === true },
      { id: 'heritage_vardkase', label: 'Vårdkasar', color: '#f59e0b', count: 211, enabled: enabledLegendItems.heritage_vardkase === true },
      { id: 'heritage_dos', label: 'Dösar', color: '#7c3aed', count: 192, enabled: enabledLegendItems.heritage_dos === true },
      { id: 'heritage_ganggrift', label: 'Gånggrifter', color: '#9333ea', count: 426, enabled: enabledLegendItems.heritage_ganggrift === true },
      { id: 'heritage_bildsten', label: 'Bildstenar', color: '#0891b2', count: 192, enabled: enabledLegendItems.heritage_bildsten === true },
      { id: 'heritage_skeppssattning', label: 'Skeppssättningar', color: '#0d9488', count: 865, enabled: enabledLegendItems.heritage_skeppssattning === true },
    ],
  });

  // 7. RESTEN - kultplatser och andra objekt - dynamisk räkning
  const religiousChildren = [
    { id: 'religious_thor', label: t('thorCultSites'), color: '#ef4444', count: getDeityPlaces('thor', selectedTimePeriod).length },
    { id: 'religious_odin', label: t('odinCultSites'), color: '#3b82f6', count: getDeityPlaces('odin', selectedTimePeriod).length }, 
    { id: 'religious_frey', label: t('freyCultSites'), color: '#22c55e', count: getDeityPlaces('frey', selectedTimePeriod).length },
    { id: 'religious_ull', label: t('ullCultSites'), color: '#a855f7', count: getDeityPlaces('ull', selectedTimePeriod).length },
    { id: 'religious_njord', label: t('njordCultSites'), color: '#0ea5e9', count: getDeityPlaces('njord', selectedTimePeriod).length },
    { id: 'religious_frigg', label: t('friggCultSites'), color: '#ec4899', count: getDeityPlaces('frigg', selectedTimePeriod).length },
    { id: 'religious_other', label: t('otherCultSites'), color: '#9ca3af', count: getDeityPlaces('other', selectedTimePeriod).length }
  ].sort((a, b) => {
    // Mest överst; "övriga" alltid sist.
    if (a.id === 'religious_other') return 1;
    if (b.id === 'religious_other') return -1;
    return b.count - a.count;
  }).map(child => ({
    ...child,
    enabled: false // Inaktiverad som standard
  }));

  const totalReligiousCount = religiousChildren.reduce((sum, child) => sum + child.count, 0);
  
  items.push({
    id: 'religious_places',
    label: t('paganCultSites'),
    color: '#fbbf24',
    count: totalReligiousCount,
    enabled: false, // Inaktiverad som standard
    type: 'category',
    children: religiousChildren
  });

  // ✅ FOLKGRUPPER - Mer prominent placering (efter Valdemars segelled)
  const germanicGroups = getGroupsByPeriod(selectedTimePeriod);
  if (germanicGroups.length > 0) {
    items.push({
      id: 'germanic_timeline',
      label: '🛡️ ' + t('germanicPeoples'),
      color: '#8b5cf6',
      count: germanicGroups.length,
      enabled: enabledLegendItems.germanic_timeline !== false, // ✅ Default enabled for prominence
      type: 'primary' as const // ✅ Make prominent
    });
  }

  items.push({
    id: 'stake_barriers',
    label: t('barrierDefenses'),
    color: '#dc2626',
    count: 8,
    enabled: false
  });

  items.push({
    id: 'viking_regions',
    label: t('vikingRegiments'),
    color: '#7c3aed',
    count: 12,
    enabled: false
  });

  // ✅ ORPHAN LAYERS - renderas redan på kartan men saknade kryssruta i legenden
  items.push({
    id: 'folk_groups',
    label: 'Folkgrupper',
    color: '#0d9488',
    count: 0,
    enabled: enabledLegendItems.folk_groups !== false
  });

  items.push({
    id: 'historical_events',
    label: 'Historiska händelser',
    color: '#FF6B6B',
    count: 0,
    enabled: enabledLegendItems.historical_events !== false
  });

  items.push({
    id: 'place_names',
    label: 'Ortnamn',
    color: '#65a30d',
    count: 0,
    enabled: enabledLegendItems.place_names !== false
  });

  // Dåtida strandlinje (SGU strandförskjutningsmodell, CC-BY). Bakgrundspolygon för
  // vald tidsperiod. AV som standard (=== true matchar lagrets gate).
  items.push({
    id: 'paleo_shoreline',
    label: '🌊 Dåtida strandlinje (SGU)',
    color: '#3b82f6',
    count: 0,
    enabled: enabledLegendItems.paleo_shoreline === true
  });

  // Rikt kyrkolager (byggår, stift, socken/härad, ruinstatus + Commons-bild). Viewport-laddat,
  // zoom-gate ≥8. AV som standard (=== true matchar useMapChurches-gaten).
  items.push({
    id: 'ecclesiastical_churches',
    label: '⛪ Kyrkor (stift & bild)',
    color: '#e11d48',
    count: 0,
    enabled: enabledLegendItems.ecclesiastical_churches === true
  });

  // Add Christian sites if provided
  if (christianSites && christianSites.length > 0) {
    const christianItems = generateChristianSitesLegendItems(christianSites, t);
    items.push(...christianItems);
  }

  console.log(`✅ CORRECT: Generated ${items.length} legend items - Runestones: ${inscriptions.length} (should be 2818+)`);
  console.log('🗺️ ÖLAND DEBUG: Checking for Öland inscriptions...');
  const olandCount = inscriptions.filter(i => 
    i.signum?.startsWith('Öl') || 
    i.signum?.startsWith('B') && (
      i.parish?.includes('Runstens socken') || 
      i.parish?.includes('Gärdslösa socken') ||
      i.parish?.includes('Gräsgårds socken') ||
      i.parish?.includes('Stenåsa socken')
    )
  ).length;
  console.log(`🏝️ Öland inscriptions found: ${olandCount}`);

  // === FULL KATEGORI-GRUPPERING ===
  // Efterbearbetar den platta listan till toppnivå-kategorier (visuell organisation).
  // Rör inte lager-id:n → alla toggles/lager fortsätter fungera. Befintliga kategorier
  // (heritage_sites/religious_places/water_routes/viking_roads) behålls som de är
  // (LegendCategory stödjer inte djup-nästling → de ligger kvar på toppnivå).
  const byId = new Map(items.map((i) => [i.id, i] as const));
  const used = new Set<string>();
  const sumCount = (children: LegendItem[]) => children.reduce((s, c) => s + (c.count || 0), 0);
  const group = (id: string, label: string, color: string, childIds: string[]): LegendItem | null => {
    const children = childIds.map((cid) => byId.get(cid)).filter(Boolean) as LegendItem[];
    if (children.length === 0) return null;
    children.forEach((c) => used.add(c.id));
    return { id, label, color, count: sumCount(children), enabled: enabledLegendItems[id] !== false, type: 'category', children };
  };
  const keep = (id: string): LegendItem | null => {
    const it = byId.get(id);
    if (it) used.add(id);
    return it ?? null;
  };
  const ordered: (LegendItem | null)[] = [
    group('cat_runic', 'ᛘ ' + t('swedishRunestones'), '#ef4444', ['runic_inscriptions', 'foreign_inscriptions']),
    group('cat_ecclesiastical', '⛪ Kyrkor & stift', '#e11d48', ['ecclesiastical_churches']),
    keep('heritage_sites'),
    keep('religious_places'),
    keep('water_routes'),
    keep('viking_roads'),
    group('cat_defense', '🏰 ' + t('fortresses'), '#dc2626', ['viking_fortresses', 'viking_cities', 'stake_barriers']),
    group('cat_folk', '🛡️ ' + t('germanicPeoples'), '#8b5cf6', ['germanic_timeline', 'folk_groups', 'viking_regions']),
    group('cat_geo', '📍 Platser & geodata', '#65a30d', ['place_names', 'historical_events', 'paleo_shoreline']),
  ];
  const grouped = ordered.filter(Boolean) as LegendItem[];
  // Allt ogrupperat (t.ex. kristna centra) läggs sist, oförändrat.
  items.forEach((i) => { if (!used.has(i.id)) grouped.push(i); });

  return grouped;
};

export const generateStatusBasedItems = (
  inscriptions: RunicInscription[],
  enabledLegendItems: { [key: string]: boolean },
  t: (key: string) => string
): LegendItem[] => {
  const items: LegendItem[] = [];

  const statusCategories = [
    { id: 'well_preserved', status: 'good', label: t('wellPreserved'), color: '#22c55e' },
    { id: 'damaged', status: 'damaged', label: t('damaged'), color: '#f59e0b' },
    { id: 'fragmentary', status: 'fragmentary', label: t('fragmentary'), color: '#ef4444' }
  ];

  statusCategories.forEach(category => {
    const count = inscriptions.filter(i => i.status === category.status).length;
    if (count > 0) {
      items.push({
        id: category.id,
        label: category.label,
        color: category.color,
        count,
        enabled: enabledLegendItems[category.id] !== false
      });
    }
  });

  return items;
};

export const generateUnderwaterItems = (
  inscriptions: RunicInscription[],
  enabledLegendItems: { [key: string]: boolean },
  t: (key: string) => string
): LegendItem[] => {
  const items: LegendItem[] = [];

  const underwaterCount = inscriptions.filter(i => isUnderwaterInscription(i)).length;
  if (underwaterCount > 0) {
    items.push({
      id: 'underwater',
      label: t('underwater'),
      color: '#0891b2',
      count: underwaterCount,
      enabled: enabledLegendItems.underwater !== false
    });
  }

  return items;
};

export const generateCountryBasedItems = (
  inscriptions: RunicInscription[],
  enabledLegendItems: { [key: string]: boolean },
  t: (key: string) => string
): LegendItem[] => {
  const items: LegendItem[] = [];

  const countryCategories = [
    // Major Scandinavian countries - ON per default
    { id: 'sweden', country: 'Sweden', label: t('sweden'), color: '#3b82f6', majorCountry: true },
    { id: 'norway', country: 'Norway', label: t('norway'), color: '#dc2626', majorCountry: true },
    { id: 'denmark', country: 'Denmark', label: t('denmark'), color: '#ef4444', majorCountry: true },
    { id: 'iceland', country: 'Iceland', label: t('iceland'), color: '#0891b2', majorCountry: true },
    
    // Minor countries - OFF per default
    { id: 'finland', country: 'Finland', label: t('finland'), color: '#10b981', majorCountry: false },
    { id: 'estonia', country: 'Estonia', label: t('estonia'), color: '#8b5cf6', majorCountry: false },
    { id: 'russia', country: 'Russia', label: t('russia'), color: '#f59e0b', majorCountry: false },
    { id: 'ukraine', country: 'Ukraine', label: t('ukraine'), color: '#06b6d4', majorCountry: false },
    { id: 'england', country: 'England', label: t('england'), color: '#84cc16', majorCountry: false },
    { id: 'ireland', country: 'Ireland', label: t('ireland'), color: '#22c55e', majorCountry: false },
    { id: 'scotland', country: 'Scotland', label: t('scotland'), color: '#a855f7', majorCountry: false },
    { id: 'faroe_islands', country: 'Faroe Islands', label: t('faroeIslands'), color: '#0ea5e9', majorCountry: false },
    { id: 'greenland', country: 'Greenland', label: t('greenland'), color: '#64748b', majorCountry: false }
  ];

  countryCategories.forEach(category => {
    const count = inscriptions.filter(i => i.country === category.country).length;
    if (count > 0) {
      items.push({
        id: category.id,
        label: category.label,
        color: category.color,
        count,
        enabled: enabledLegendItems[category.id] !== false
      });
    }
  });

  return items;
};

export const generateReligiousItems = (
  enabledLegendItems: { [key: string]: boolean },
  selectedTimePeriod: string = 'all',
  t: (key: string) => string
): LegendItem[] => {
  const items: LegendItem[] = [];

  // Pagan deity items
  const paganChildren = [
    { id: 'religious_thor', label: t('thorCultSites'), color: '#ef4444', count: getDeityPlaces('thor', selectedTimePeriod).length },
    { id: 'religious_odin', label: t('odinCultSites'), color: '#3b82f6', count: getDeityPlaces('odin', selectedTimePeriod).length }, 
    { id: 'religious_frey', label: t('freyCultSites'), color: '#22c55e', count: getDeityPlaces('frey', selectedTimePeriod).length },
    { id: 'religious_ull', label: t('ullCultSites'), color: '#a855f7', count: getDeityPlaces('ull', selectedTimePeriod).length },
    { id: 'religious_njord', label: t('njordCultSites'), color: '#0ea5e9', count: getDeityPlaces('njord', selectedTimePeriod).length },
    { id: 'religious_frigg', label: t('friggCultSites'), color: '#ec4899', count: getDeityPlaces('frigg', selectedTimePeriod).length },
    { id: 'religious_other', label: t('otherCultSites'), color: '#9ca3af', count: getDeityPlaces('other', selectedTimePeriod).length }
  ].filter(child => child.count > 0).map(child => ({
    ...child,
    enabled: enabledLegendItems[child.id] !== false,
    parentId: 'pagan_gods'
  }));

  // Christian center items
  const christianChildren = [
    { id: 'christian_archbishop', label: t('archbishopSeats'), color: '#7c2d12', count: getChristianCentersByType('archbishop_seat', selectedTimePeriod).length },
    { id: 'christian_bishop', label: t('bishopSeats'), color: '#a16207', count: getChristianCentersByType('bishop_seat', selectedTimePeriod).length },
    { id: 'christian_mission', label: t('missionSites'), color: '#059669', count: getChristianCentersByType('mission_site', selectedTimePeriod).length },
    { id: 'christian_franciscan', label: t('franciscanMonasteries'), color: '#7c3aed', count: getChristianCentersByType('franciscan', selectedTimePeriod).length },
    { id: 'christian_dominican', label: t('dominicanMonasteries'), color: '#dc2626', count: getChristianCentersByType('dominican', selectedTimePeriod).length },
    { id: 'christian_birgittine', label: t('birgittineMonasteries'), color: '#2563eb', count: getChristianCentersByType('birgittine', selectedTimePeriod).length }
  ].filter(child => child.count > 0).map(child => ({
    ...child,
    enabled: enabledLegendItems[child.id] !== false,
    parentId: 'christian_centers'
  }));

  // Calculate totals
  const totalPagan = paganChildren.reduce((sum, child) => sum + child.count, 0);
  const totalChristian = christianChildren.reduce((sum, child) => sum + child.count, 0);
  const totalReligious = totalPagan + totalChristian;

  // Create main religious category with subcategories
  const religiousCategories = [];
  
  if (totalPagan > 0) {
    religiousCategories.push({
      id: 'pagan_gods',
      label: '🔨 ' + t('paganGods'),
      color: '#6b7280',
      count: totalPagan,
      enabled: enabledLegendItems.pagan_gods !== false,
      type: 'category',
      children: paganChildren
    });
  }

  if (totalChristian > 0) {
    religiousCategories.push({
      id: 'christian_centers',
      label: '✝️ ' + t('christianCenters'),
      color: '#92400e',
      count: totalChristian,
      enabled: enabledLegendItems.christian_centers !== false,
      type: 'category',
      children: christianChildren
    });
  }

  items.push({
    id: 'religious_places',
    label: t('religious'),
    color: '#fbbf24',
    count: totalReligious,
    enabled: enabledLegendItems.religious_places !== false,
    type: 'category',
    children: religiousCategories
  });

  return items;
};

export const generateTimelineAndArchaeologicalItems = (
  selectedTimePeriod: string,
  enabledLegendItems: { [key: string]: boolean },
  t: (key: string) => string
): LegendItem[] => {
  const items: LegendItem[] = [];

  // Add Germanic timeline
  const germanicGroups = getGroupsByPeriod(selectedTimePeriod);
  items.push({
    id: 'germanic_timeline',
    label: t('germanicPeoples'),
    color: '#8b5cf6',
    count: germanicGroups.length,
    enabled: enabledLegendItems.germanic_timeline !== false
  });

  // Add archaeological finds
  const archaeologicalFinds = getFindsInPeriod(ARCHAEOLOGICAL_FINDS, selectedTimePeriod);
  items.push({
    id: 'archaeological_finds',
    label: t('discoveries'),
    color: '#059669',
    count: archaeologicalFinds.length,
    enabled: enabledLegendItems.archaeological_finds !== false
  });

  return items;
};

export const generateRouteItems = (
  selectedTimePeriod: string,
  enabledLegendItems: { [key: string]: boolean },
  isVikingMode: boolean,
  t: (key: string) => string
): LegendItem[] => {
  const items: LegendItem[] = [];

  // Viking waterways (show in Viking Age, Vendel Period, and all)
  if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'vendel_period' || selectedTimePeriod === 'medieval' || selectedTimePeriod === 'all') {
    items.push({
      id: 'water_routes',
      label: '🌊 ' + t('vikingWaterways'),
      color: '#0891b2',
      count: 23, // Total from database
      enabled: enabledLegendItems.water_routes !== false,
      type: 'category',
      children: [
        {
          id: 'swedish_rivers',
          label: t('swedishRivers'),
          color: '#0891b2',
          count: 11,
          enabled: enabledLegendItems.swedish_rivers !== false
        },
        {
          id: 'european_rivers',
          label: t('europeanRivers'),
          color: '#0369a1',
          count: 8,
          enabled: enabledLegendItems.european_rivers !== false
        },
        {
          id: 'trade_routes',
          label: '⛵ ' + t('tradeRoutes'),
          color: '#dc2626',
          count: 4,
          enabled: enabledLegendItems.trade_routes !== false
        }
      ]
    });
  }

  // Valdemar's sailing route (Viking Age specific) - ✅ PROMINENT WATERWAY
  if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'vendel_period' || selectedTimePeriod === 'medieval' || selectedTimePeriod === 'all') {
    items.push({
      id: 'valdemar_route',
      label: '⚔️ ' + t('valdemarsRoute') + ' (1230-talet)',
      color: isVikingMode ? '#1e3a8a' : '#3b82f6', // ✅ Consistent colors
      count: 95, // ✅ All route coordinates
      enabled: enabledLegendItems.valdemar_route ?? true, // ✅ Default enabled for prominence
      type: 'primary' as const // ✅ Make it prominent in legend
    });
  }

  // 🔧 FIX: Lägg till landvägar som egen kategori FÖRE pilgrimsvägar
  if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'vendel_period' || selectedTimePeriod === 'medieval' || selectedTimePeriod === 'all') {
    items.push({
      id: 'land_routes',
      label: '🛣️ ' + t('importantWaterways'),
      color: '#8b5a2b',
      count: 65, // Uppskattning baserat på befintliga vägar
      enabled: enabledLegendItems.land_routes ?? true, // ✅ Default enabled
      type: 'primary' as const
    });
  }

  // Trade/Pilgrim routes - show as trade routes in Viking Age, pilgrim routes in Medieval
  if (selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'vendel_period' || selectedTimePeriod === 'medieval' || selectedTimePeriod === 'all') {
    const isVikingEra = selectedTimePeriod === 'viking_age' || selectedTimePeriod === 'vendel_period';
    const routeLabel = isVikingEra ? t('ancientTradeRoutes') : t('pilgrimRoutes');
    const routeIcon = isVikingEra ? '🛣️' : '⛪';
    
    items.push({
      id: 'pilgrim_routes',
      label: routeIcon + ' ' + routeLabel,
      color: '#7c3aed',
      count: 89, // Total waypoints across all routes
      enabled: enabledLegendItems.pilgrim_routes !== false,
      type: 'category',
      children: [
        {
          id: 'olavs_routes',
          label: isVikingEra ? t('northernTradeRoutes') : t('olavsRoutes'),
          color: '#7c3aed',
          count: 45, // Östleden + Romboleden + Västgötavägen + Bergslagsvägen
          enabled: enabledLegendItems.olavs_routes !== false
        },
        {
          id: 'erik_route',
          label: isVikingEra ? t('balticTradeRoute') : t('erikRoute'),
          color: '#8b5cf6',
          count: 20, // Uppsala-Åbo route
          enabled: enabledLegendItems.erik_route !== false
        },
        {
          id: 'sigfrid_route',
          label: isVikingEra ? t('southernTradeRoute') : t('sigfridRoute'),
          color: '#a855f7',
          count: 12, // Växjö and Värend route
          enabled: enabledLegendItems.sigfrid_route !== false
        },
        {
          id: 'james_route',
          label: isVikingEra ? t('westernTradeRoute') : t('jamesRoute'),
          color: '#c084fc',
          count: 12, // Swedish part of Santiago route
          enabled: enabledLegendItems.james_route !== false
        }
      ]
    });
  }

  // Royal routes (Medieval only)
  if (selectedTimePeriod === 'medieval' || selectedTimePeriod === 'all') {
    items.push({
      id: 'land_routes',
      label: '👑 ' + t('royalRoutes'),
      color: '#d97706',
      count: 13, // Eriksgatan waypoints
      enabled: enabledLegendItems.land_routes !== false,
      type: 'category',
      children: [
        {
          id: 'eriksgatan',
          label: t('eriksgatan'),
          color: '#d97706',
          count: 13,
          enabled: enabledLegendItems.eriksgatan !== false
        }
      ]
    });
  }

  return items;
};

export const generateVikingSpecificItems = (
  isVikingMode: boolean,
  selectedTimePeriod: string,
  enabledLegendItems: { [key: string]: boolean },
  t: (key: string) => string
): LegendItem[] => {
  const items: LegendItem[] = [];

  if (!isVikingMode || selectedTimePeriod !== 'viking_age') {
    return items;
  }

  // Viking fortress types - RESTORED
  const fortressItems = [
    { id: 'ring_fortress', label: t('ringFortresses'), color: '#dc2626', count: 7 },
    { id: 'hillfort', label: t('hillforts'), color: '#ea580c', count: 21 },
    { id: 'longphort', label: t('longphorts'), color: '#ca8a04', count: 6 },
    { id: 'royal_center', label: t('royalCenters'), color: '#16a34a', count: 3 },
    { id: 'coastal_defense', label: t('coastalDefense'), color: '#0891b2', count: 1 },
    { id: 'trading_post', label: t('tradingPosts'), color: '#10b981', count: 5 }
  ];

  fortressItems.forEach(item => {
    items.push({
      ...item,
      enabled: enabledLegendItems[item.id] !== false
    });
  });

  // Viking cities - RESTORED
  const cityItems = [
    { id: 'religious_center', label: t('religiousCenters'), color: '#fbbf24', count: 8 },
    { id: 'trading_post_city', label: t('tradingPlaces'), color: '#10b981', count: 12 },
    { id: 'koping', label: t('koping'), color: '#06b6d4', count: 15 },
    { id: 'established_city', label: t('establishedCities'), color: '#8b5cf6', count: 6 },
    { id: 'gotlandic_center', label: t('gotlandicCenters'), color: '#f59e0b', count: 4 }
  ];

  cityItems.forEach(item => {
    items.push({
      ...item,
      enabled: enabledLegendItems[item.id] !== false
    });
  });

  return items;
};
