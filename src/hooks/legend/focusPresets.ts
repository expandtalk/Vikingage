
import { LegendPreset } from '@/types/legend';

export const getFocusLegendPresets = (focus: string | null): LegendPreset => {
  console.log(`🎯 CLEAN: Getting ultra-clean legend presets for focus: ${focus}`);
  
  // ULTRA-REN KARTA: Endast runstenar som standard - inget annat
  const basePresets: LegendPreset = {
    runic_inscriptions: true, // ENDAST runstenar
    archaeological_sites: false,
    viking_fortresses: false,
    viking_cities: false,
    viking_regions: false,
    germanic_groups: false,
    stake_barriers: false,
    valdemar_route: false,
    river_routes: false,
    carvers: false,
    gods: false,
    hundreds: false,
    parishes: false,
    // Avaktivera alla andra legend items som kan visas
    religious_places: false,
    folk_groups: false,
    archaeological_finds: false,
    germanic_timeline: false,
    trade_routes: false,
    battle_sites: false,
    // Religious subcategories
    religious_odin: false,
    religious_thor: false,
    religious_frey: false,
    religious_freyja: false,
    religious_frigg: false,
    religious_ull: false,
    religious_njord: false,
    religious_other: false,
    // Status categories
    well_preserved: false,
    damaged: false,
    fragmentary: false,
    underwater: false,
    // Countries/regions
    finland: false,
    norway: false,
    denmark: false,
    sweden: false,
    // Viking fortress subtypes
    royal_center: false,
    ring_fortress: false,
    fortress: false,
    hillfort: false,
    longphort: false,
    coastal_defense: false
  };

  switch (focus) {
    case 'rivers':
      console.log('🌊 Rivers focus: ENDAST Rivers, trade routes, Danvirke, Götavirke and cities - no runestones, religious places or fortresses');
      return {
        ...basePresets,
        runic_inscriptions: false, // Avaktivera runstenar för rivers focus
        religious_places: false, // Avaktivera religiösa platser (källorna etc)
        viking_fortresses: false, // Avaktivera försvarsborgar för rivers focus
        water_routes: true, // Aktivera alla vattenvägar
        river_routes: true,
        swedish_rivers: true, // Svenska floder
        european_rivers: true, // Europeiska floder
        trade_routes: true, // Handelsrutter
        valdemar_route: true,
        eriksgatan: true, // Kungavalets riksrunda ritas i farleds-/ruttvyn
        land_routes: true,
        viking_cities: true, // Aktivera städer för handelskontexten
        stake_barriers: true // Aktivera Danvirke/Götavirke
      };
      
    case 'eriksgatan':
      console.log('👑 Eriksgata focus: den kungliga riksrundan + vägar/städer, inget brus');
      return {
        ...basePresets,
        runic_inscriptions: false,
        religious_places: false,
        viking_fortresses: false,
        eriksgatan: true,
        land_routes: true,
        viking_cities: true
      };

    case 'fortresses':
      console.log('🏰 Fortresses focus: Only fortresses and runestones');
      return {
        ...basePresets,
        viking_fortresses: true
      };
      
    case 'coordinates':
      console.log('📍 Coordinates focus: Only runestones');
      return basePresets;
      
    case 'carvers':
      console.log('🔨 Carvers focus: Only carvers and runestones');
      return {
        ...basePresets,
        runic_inscriptions: true,   // Visa runstenar så man ser vad runristarna har gjort
        carvers: true
      };
      
    case 'gods':
      console.log('⚡ Gods focus: ENDAST kultplatser och gud-specifika kultplatser');
      return {
        ...basePresets,
        runic_inscriptions: false,    // Avaktivera runstenar
        religious_places: true,       // Huvudkategori kultplatser
        // Aktivera ALLA gud-specifika kultplatser
        religious_odin: true,
        religious_thor: true,
        religious_frey: true,
        religious_freyja: true,
        religious_frigg: true,
        religious_ull: true,
        religious_njord: true,
        religious_other: true,        // Andra gudar/kultplatser
        gods: false                   // Avaktivera gods legend item
      };
      
    case 'hundreds':
      console.log('📊 Hundreds focus: Only hundreds and runestones');
      return {
        ...basePresets,
        hundreds: true
      };
      
    case 'parishes':
      console.log('⛪ Parishes focus: bara socknen — tänd kulturlager själv');
      return {
        ...basePresets,
        parishes: true,
        runic_inscriptions: false // tom utom socknen; kulturlagren tänds via legenden
      };

    case 'churches':
      console.log('⛪ Churches focus: rikt kyrkolager (stift & bild) — zooma in för att se kyrkor');
      return {
        ...basePresets,
        runic_inscriptions: false,
        ecclesiastical_churches: true // rika kyrkolagret tänt; viewport-laddat vid zoom ≥8
      };
      
    case 'folkGroups':
      console.log('👥 Folk Groups focus: Only folk groups and runestones');
      return {
        ...basePresets,
        folk_groups: true
      };
      
    case 'names':
      console.log('👤 Names focus: Only runestones');
      return basePresets;
      
    case 'geneticEvents':
      console.log('🧬 Genetic Events focus: Only runestones');
      return basePresets;
      
    case 'inscriptions':
    default:
      console.log('📿 Inscriptions focus: ENDAST runstenar - ultra-ren karta');
      return {
        ...basePresets,
        // Inaktivera ALLT förutom runstenar för att få en ren karta
        religious_places: false,
        germanic_groups: false,
        archaeological_sites: false
      };
  }
};
