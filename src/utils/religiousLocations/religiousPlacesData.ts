export interface ReligiousPlace {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  deity: 'thor' | 'odin' | 'frey' | 'ull' | 'njord' | 'frigg' | 'other' | 'christian';
  type: 'temple' | 'sacred_grove' | 'offering_spring' | 'royal_center' | 'cult_site' | 'rock_carving' | 
        'archbishop_seat' | 'bishop_seat' | 'monastery' | 'mission_site' | 'franciscan' | 'dominican' | 
        'cistercian' | 'birgittine' | 'carmelite' | 'augustinian';
  evidence: ('runestone' | 'archaeological' | 'place_name' | 'church_foundation' | 'historical_record' | 'cathedral')[];
  description: string;
  historicalPeriods: string[]; // Nu en array av perioder
  establishedPeriod: string; // När platsen först etablerades
  pairedWith?: string;
  isMultiple?: boolean;
  region: string;
  sources: string[];
}

// ✅ KEEP ALL EXISTING HELPER FUNCTIONS
export const getPlacesForPeriod = (period: string): ReligiousPlace[] => {
  return RELIGIOUS_PLACES.filter(place => place.historicalPeriods.includes(period));
};

export const getPlacesForTimePeriod = (selectedTimePeriod: string): ReligiousPlace[] => {
  const activePeriods = getActivePeriods(selectedTimePeriod);
  return RELIGIOUS_PLACES.filter(place => 
    place.historicalPeriods.some(period => activePeriods.includes(period))
  );
};

export const getDeityPlaces = (deity: string, selectedTimePeriod?: string) => {
  const places = selectedTimePeriod ? 
    getPlacesForTimePeriod(selectedTimePeriod) : 
    RELIGIOUS_PLACES;
  return places.filter(place => place.deity === deity);
};

export const getPairedPlaces = () => {
  const pairs: { [key: string]: ReligiousPlace[] } = {};
  RELIGIOUS_PLACES.forEach(place => {
    if (place.pairedWith) {
      const pairKey = [place.id, place.pairedWith].sort().join('-');
      if (!pairs[pairKey]) {
        pairs[pairKey] = [];
      }
      pairs[pairKey].push(place);
      const pairedPlace = RELIGIOUS_PLACES.find(p => p.id === place.pairedWith);
      if (pairedPlace && !pairs[pairKey].includes(pairedPlace)) {
        pairs[pairKey].push(pairedPlace);
      }
    }
  });
  return pairs;
};

export const getMultiplePlaces = () => {
  const groups: { [key: string]: ReligiousPlace[] } = {};
  RELIGIOUS_PLACES.forEach(place => {
    if (place.isMultiple) {
      const baseName = place.name.split(' (')[0];
      if (!groups[baseName]) {
        groups[baseName] = [];
      }
      groups[baseName].push(place);
    }
  });
  return groups;
};

export const getRegionalConcentration = () => {
  const regions: { [key: string]: number } = {};
  RELIGIOUS_PLACES.forEach(place => {
    regions[place.region] = (regions[place.region] || 0) + 1;
  });
  return regions;
};

// Import function from chronology
import { getActivePeriods } from './chronology';
import { OFFERING_SPRINGS } from './offeringSprings';

export const RELIGIOUS_PLACES: ReligiousPlace[] = [
  // ✅ UTÖKADE OFFERKÄLLOR - yngre stenåldern och framåt
  {
    id: 'trefaldighetskällan_svinnegarn',
    name: 'Trefaldighetskällan Svinnegarn',
    coordinates: { lat: 59.6667, lng: 17.3833 },
    deity: 'thor',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'En av Sveriges äldsta offerkällor, från yngre stenåldern',
    historicalPeriods: ['neolithic', 'bronze_age', 'early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'neolithic',
    region: 'Uppland',
    sources: ['Den heliga källan I: Trefaldighetskällan - Humanism & Kunskap']
  },
  // ✅ NYA OFFERKÄLLOR OCH KULTPLATSER FRÅN ANVÄNDAREN
  {
    id: 'ljungbyan_nybro',
    name: 'Ljungbyån/Ljungby källa',
    coordinates: { lat: 56.7444, lng: 15.9072 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Offerfynd från järnåldern med vapen och metallföremål nära gamla vadstället',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Småland',
    sources: ['Lokalhistoriska källor']
  },
  {
    id: 'algsjokällan_nybro',
    name: 'Älgsjökällan',
    coordinates: { lat: 56.6833, lng: 15.8667 },
    deity: 'frey',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'Lokal offertradition kopplad till fruktbarhet',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Småland',
    sources: ['Lokalhistoria']
  },
  {
    id: 'svartingsmala_källa',
    name: 'Svartingsmåla källa',
    coordinates: { lat: 56.7000, lng: 15.9500 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['historical_record'],
    description: 'Äldre offertradition enligt lokalhistorien, använd som hälsokälla in på 1900-talet',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age', 'medieval', 'early_modern'],
    establishedPeriod: 'early_iron_age',
    region: 'Småland',
    sources: ['Lokalhistoria']
  },
  {
    id: 'sollero_heliga_kallor',
    name: 'Sollerö heliga källor',
    coordinates: { lat: 61.0000, lng: 14.5833 },
    deity: 'thor',
    type: 'offering_spring',
    evidence: ['place_name', 'historical_record'],
    description: 'Flera heliga källor på ön med stark hednisk tradition och motstånd mot kristnande',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Dalarna',
    sources: ['Dalarnas kulturtraditioner']
  },
  {
    id: 'mjolnarens_kallan_landsnora',
    name: 'Mjölnarens källa, Landsnora',
    coordinates: { lat: 59.4500, lng: 17.9167 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Vid kvarn och såg med lång kontinuitet från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Sollentuna hembygdsförening']
  },
  {
    id: 'onskällan_halleberg',
    name: 'Onskällan, Halleberg',
    coordinates: { lat: 58.3333, lng: 12.4000 },
    deity: 'odin',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'Vid bergets fot, "Odens källa" med koppling till krigsguden',
    historicalPeriods: ['migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'Västergötland',
    sources: ['Västergötlands ortnamn']
  },
  {
    id: 'sanga_kyrka_kallan',
    name: 'Källan i Sånga kyrka',
    coordinates: { lat: 59.2667, lng: 16.9500 },
    deity: 'christian',
    type: 'offering_spring',
    evidence: ['church_foundation'],
    description: 'Källa under kyrkan med kristen kontinuitet från hednisk offerkälla',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Södermanland',
    sources: ['Kyrkliga källor']
  },
  {
    id: 'husaby_kallan_vastergotland',
    name: 'Husaby källa, Västergötland',
    coordinates: { lat: 58.3000, lng: 13.3833 },
    deity: 'christian',
    type: 'offering_spring',
    evidence: ['church_foundation', 'historical_record'],
    description: 'Sveriges första dopkälla, tidigare hednisk offerkälla',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age', 'transition_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Västergötland',
    sources: ['Kyrkliga källor', 'Adam av Bremen']
  },
  {
    id: 'rockebro_offerkallan',
    name: 'Rockebro offerkälla',
    coordinates: { lat: 56.7167, lng: 15.2833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Järnåldersoffer med metallfynd',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Småland',
    sources: ['Smålands museum']
  },
  {
    id: 'stavgard_offerkallan',
    name: 'Stavgard offerkälla',
    coordinates: { lat: 58.7500, lng: 17.0833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Offerkälla med vapenfynd från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Södermanland',
    sources: ['Arkeologiska rapporter']
  },
  {
    id: 'sankt_olofs_kallan_sjalevad',
    name: 'Sankt Olofs källa, Själevad',
    coordinates: { lat: 63.1500, lng: 18.5667 },
    deity: 'christian',
    type: 'offering_spring',
    evidence: ['church_foundation'],
    description: 'Kristnad hednisk offerkälla helgad åt Sankt Olof',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Ångermanland',
    sources: ['Kyrkliga källor']
  },
  {
    id: 'sankt_olofs_kallan_skokloster',
    name: 'Sankt Olofs källa, Skokloster',
    coordinates: { lat: 59.7333, lng: 17.6333 },
    deity: 'christian',
    type: 'offering_spring',
    evidence: ['church_foundation'],
    description: 'Kristnad hednisk offerkälla helgad åt Sankt Olof',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Kyrkliga källor']
  },
  {
    id: 'aggarps_offerkallan',
    name: 'Aggarps offerkälla',
    coordinates: { lat: 56.0333, lng: 13.5500 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Järnåldersoffer med metallfynd',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Skåne',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'ingemo_kallan',
    name: 'Ingemo källa',
    coordinates: { lat: 61.5833, lng: 16.5000 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['historical_record'],
    description: 'Offertradition dokumenterad från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Hälsingland',
    sources: ['Hälsinglands kulturtraditioner']
  },
  // ✅ OFFERMOSSAR SVERIGE
  {
    id: 'dyestads_offermosse',
    name: 'Dyestads offermosse',
    coordinates: { lat: 58.4667, lng: 11.4833 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Vapenfynd från järnåldern i offermosse',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Bohuslän',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'finnestorp_vastergotland',
    name: 'Finnestorp',
    coordinates: { lat: 58.1833, lng: 13.2167 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Stora vapendepåer från 300-500 e.Kr.',
    historicalPeriods: ['migration_period'],
    establishedPeriod: 'migration_period',
    region: 'Västergötland',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'ullentuna_offermosse',
    name: 'Ullentuna offermosse',
    coordinates: { lat: 59.8500, lng: 17.6667 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Järnåldersoffer i mossområde',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'karingsjön_halland',
    name: 'Käringsjön',
    coordinates: { lat: 56.8833, lng: 12.5333 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Sjöoffer med vapen och smycken från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Halland',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'hassle_bosarp',
    name: 'Hassle Bösarp',
    coordinates: { lat: 55.4833, lng: 14.0833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological', 'historical_record'],
    description: 'Källa med kontinuerlig offertradition från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Skåne',
    sources: ['Lokalhistoria']
  },
  {
    id: 'lillsjön_uppland',
    name: 'Lillsjön',
    coordinates: { lat: 59.8667, lng: 17.6333 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Offerfynd från järnåldern i sjöområde',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'sorby_kallan',
    name: 'Sörby källa',
    coordinates: { lat: 58.4167, lng: 15.7500 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Vapenoffer och personliga föremål från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Östergötland',
    sources: ['Arkeologiska fynd']
  },
  // ✅ OFFERMOSSAR DANMARK
  {
    id: 'borremose_jylland',
    name: 'Borremose',
    coordinates: { lat: 56.7500, lng: 9.4167 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Moslik och offerfynd från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Danske arkeologiska fynd']
  },
  {
    id: 'hjortspring_mose',
    name: 'Hjortspring Mose',
    coordinates: { lat: 54.9333, lng: 9.8833 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Båtoffer från 300 f.Kr., äldsta fyndet av sitt slag',
    historicalPeriods: ['early_iron_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Danske arkeologiska fynd']
  },
  {
    id: 'huldremose_jylland',
    name: 'Huldremose',
    coordinates: { lat: 56.0667, lng: 9.0833 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Moslik ("Huldremosekvinnan") och andra offerfynd',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Danske arkeologiska fynd']
  },
  // ✅ OFFERKÄLLOR NORGE
  {
    id: 'lysakerelven_kallor',
    name: 'Lysakerelven källor',
    coordinates: { lat: 59.9167, lng: 10.6333 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Offerfynd vid källområdet från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Norge',
    sources: ['Norska arkeologiska fynd']
  },
  {
    id: 'levangerkallan',
    name: 'Levangerkällan',
    coordinates: { lat: 63.7500, lng: 11.3000 },
    deity: 'frey',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Fruktbarhetskult och järnåldersoffer i Trøndelag',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Norge',
    sources: ['Norska arkeologiska fynd']
  },
  {
    id: 'vaernes_kallan',
    name: 'Værnes källa',
    coordinates: { lat: 63.4500, lng: 10.9333 },
    deity: 'frey',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Fruktbarhetskult och järnåldersoffer i Trøndelag',
    historicalPeriods: ['early_iron_age', 'migration_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Norge',
    sources: ['Norska arkeologiska fynd']
  },
  {
    id: 'offerkallan_sollero',
    name: 'Offerkällan Sollerö',
    coordinates: { lat: 60.8333, lng: 14.7500 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['place_name', 'archaeological'],
    description: 'Bronsålderns soldyrkan och kontinuerlig användning',
    historicalPeriods: ['bronze_age', 'early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'bronze_age',
    region: 'Dalarna',
    sources: ['Offerkällan - Sollerö hembygdsförening']
  },
  // ✅ LÄGG TILL FLER OFFERKÄLLOR
  {
    id: 'helga_kallan_varberg',
    name: 'Helga källan Varberg',
    coordinates: { lat: 57.1057, lng: 12.2504 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['place_name', 'archaeological'],
    description: 'Helig källa i Varberg med forntida offertradition',
    historicalPeriods: ['bronze_age', 'early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'bronze_age',
    region: 'Halland',
    sources: ['Varbergs hembygdsförening']
  },
  {
    id: 'froding_kallan',
    name: 'Fröding källan Värmland',
    coordinates: { lat: 59.3793, lng: 13.5066 },
    deity: 'frey',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'Offerkälla kopplad till Frej/fruktbarhetskult',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Värmland',
    sources: ['Värmlands kulturtraditioner']
  },
  {
    id: 'thor_kallan_blekinge',
    name: 'Thorskällan Blekinge',
    coordinates: { lat: 56.1612, lng: 14.8058 },
    deity: 'thor',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'Thorskälla med blixtoffer och järnålderstradition',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Blekinge',
    sources: ['Blekinge kulturtraditioner']
  },

  // ✅ HÄLLRISTNINGAR - bronsåldern (~1 800–500 f.Kr.)
  {
    id: 'ullevi_sormland',
    name: 'Ullevi hällristningar (Sörmland)',
    coordinates: { lat: 58.7667, lng: 16.5500 },
    deity: 'ull',
    type: 'rock_carving',
    evidence: ['archaeological'],
    description: 'Hällristningar från ca 1300-1100 f.Kr., 448 figurer',
    historicalPeriods: ['bronze_age', 'early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'bronze_age',
    isMultiple: true,
    region: 'Sörmland',
    sources: ['Ullevi under bronsåldern - Sörmlands museum']
  },

  // ✅ TEMPELPLATSER - äldre järnålder och framåt
  {
    id: 'uppakra_temple',
    name: 'Uppåkra tempel',
    coordinates: { lat: 55.7167, lng: 13.1000 },
    deity: 'other',
    type: 'royal_center',
    evidence: ['archaeological'],
    description: 'Äldsta tempelbyggnaden, viktigt religiöst och politiskt centrum',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Skåne',
    sources: ['Vikingatida tempelbyggnader – Wikipedia']
  },

  // ✅ GUDANAMN I ORTNAMN - ODIN/ODEN KULTPLATSER
  {
    id: 'odensvi_example',
    name: 'Odensvi (exempel)',
    coordinates: { lat: 59.5000, lng: 16.0000 },
    deity: 'odin',
    type: 'royal_center',
    evidence: ['place_name'],
    description: 'Viktigt Odin-centrum med gudanamn från järnåldern',
    historicalPeriods: ['migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'Västmanland',
    sources: ['Fornnordiska och västmanländska ortnamn | Kulturarv Västmanland']
  },
  {
    id: 'odin_odensala',
    name: 'Odensala',
    coordinates: { lat: 59.6, lng: 17.7833 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name'],
    description: 'Ursprungligen "Othinsharg" (Odens kultplats/stenröse). Ligger nära Gamla Uppsala och Sigtuna.',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Uppland',
    sources: ['Ortnamn', 'Historiska källor']
  },
  {
    id: 'odin_hellvi',
    name: 'Hellvi socken',
    coordinates: { lat: 57.8667, lng: 18.95 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: '2000 år gammal romersk bronsmask med ett tillsatt öga - tolkad som Oden-symbol. Möjligen Nordens äldsta Oden-representation.',
    historicalPeriods: ['early_iron_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Gotland',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'odin_gudingsakrarna',
    name: 'Gudingsåkrarna',
    coordinates: { lat: 57.1, lng: 18.2833 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: '463 spjutspetsar offrade här - spjutet var Odens vapen. Massivt vapenofferfynd från järnåldern.',
    historicalPeriods: ['early_iron_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Gotland',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'odin_odensvi',
    name: 'Odensvi',
    coordinates: { lat: 57.5, lng: 15.4 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name'],
    description: '"Odens heliga plats" - vi-namn indikerar kultplats.',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Småland',
    sources: ['Ortnamn']
  },
  {
    id: 'odin_odensjo',
    name: 'Odensjö',
    coordinates: { lat: 56.75, lng: 14.55 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name'],
    description: 'Naturnamn kopplat till Oden, möjlig kultplats vid sjö.',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Småland',
    sources: ['Ortnamn']
  },
  {
    id: 'odin_onsala',
    name: 'Onsala',
    coordinates: { lat: 57.4167, lng: 11.9167 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name'],
    description: 'Strategiskt läge på halvö vid Kattegatt. Sal-namn antyder storgård/kultsal.',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Halland',
    sources: ['Ortnamn']
  },
  {
    id: 'odin_odensbacken',
    name: 'Odensbacken',
    coordinates: { lat: 59.2667, lng: 15.2 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name', 'archaeological'],
    description: 'Fynd från vikingatid och folkvandringstid. Namn känt sedan 1700-talet.',
    historicalPeriods: ['migration_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'Närke',
    sources: ['Arkeologiska fynd', 'Historiska källor']
  },
  {
    id: 'odin_vindelev',
    name: 'Vindelev',
    coordinates: { lat: 55.75, lng: 9.3333 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Världens äldsta Oden-inskription från 400-talet hittades här 2020. Flyttar tillbaka nordisk mytologi 150 år.',
    historicalPeriods: ['migration_period'],
    establishedPeriod: 'migration_period',
    region: 'Danmark',
    sources: ['Arkeologiska fynd', 'Runinskrifter']
  },
  {
    id: 'odin_odense',
    name: 'Odense',
    coordinates: { lat: 55.4, lng: 10.3833 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name'],
    description: 'Danmarks tredje största stad. Namnet betyder "Odens vi" (helgedom).',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Danmark',
    sources: ['Ortnamn']
  },
  {
    id: 'odin_bolbro',
    name: 'Bolbro',
    coordinates: { lat: 55.3833, lng: 10.3667 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Brakteatfynd från 1852 med Oden-inskription, tvilling till Vindelev-fyndet.',
    historicalPeriods: ['migration_period'],
    establishedPeriod: 'migration_period',
    region: 'Danmark',
    sources: ['Arkeologiska fynd']
  },
  {
    id: 'odin_onoy',
    name: 'Onøy',
    coordinates: { lat: 59.3167, lng: 10.75 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name'],
    description: '"Odens ö" - strategiskt läge i Oslofjorden, viktigt sjöfartsområde.',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Norge',
    sources: ['Ortnamn']
  },
  {
    id: 'odin_wednesbury',
    name: 'Wednesbury',
    coordinates: { lat: 52.55, lng: -2.0167 },
    deity: 'odin',
    type: 'cult_site',
    evidence: ['place_name'],
    description: '"Woden\'s burgh" (Odens borg). Visar anglosaxisk Oden-dyrkan. Nämns i Beda Venerabilis skrifter.',
    historicalPeriods: ['migration_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'England',
    sources: ['Beda Venerabilis', 'Anglosaxiska källor']
  },

  // ✅ VENDELTID
  {
    id: 'odensholm_estonia',
    name: 'Odensholm (Estland)',
    coordinates: { lat: 59.2167, lng: 23.3833 },
    deity: 'odin',
    type: 'royal_center',
    evidence: ['place_name'],
    description: 'Viktigt Odin-centrum, strategisk position i Östersjön',
    historicalPeriods: ['vendel_period', 'viking_age'],
    establishedPeriod: 'vendel_period',
    region: 'Estland',
    sources: ['Odensholm – Wikipedia']
  },

  // ✅ VIKINGATIDEN - systematisering
  // (Torshälla-dubbletten borttagen — normaliserad till den enda posten 'torshalla_detailed' nedan.)
  {
    id: 'froson_jamtland',
    name: 'Frösön (Jämtland)',
    coordinates: { lat: 63.1833, lng: 14.5167 },
    deity: 'frey',
    type: 'royal_center',
    evidence: ['runestone', 'archaeological', 'place_name', 'church_foundation'],
    description: 'Freyrs ö med offerplats under kyrkan - regionalt maktcentrum',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    pairedWith: 'norderon_jamtland',
    region: 'Jämtland',
    sources: ['Frösön - Wikipedia']
  },
  {
    id: 'norderon_jamtland',
    name: 'Norderön (Jämtland)',
    coordinates: { lat: 63.1667, lng: 14.4833 },
    deity: 'njord',
    type: 'royal_center',
    evidence: ['place_name'],
    description: 'Njärds ö - gudapar med Frösön, viktigt handelcentrum',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    pairedWith: 'froson_jamtland',
    region: 'Jämtland',
    sources: ['Ortnamn: Ortnamn kring hednisk tro och kult – LT']
  },

  // ✅ HUSABY-SYSTEMET - vikingatid
  {
    id: 'husaby_vastergotland',
    name: 'Husaby (Västergötland)',
    coordinates: { lat: 58.5667, lng: 13.2833 },
    deity: 'other',
    type: 'royal_center',
    evidence: ['church_foundation', 'place_name'],
    description: 'Husaby-system, kunglig och religiös maktbas 900-1200-talet',
    historicalPeriods: ['viking_age', 'transition_period'],
    establishedPeriod: 'viking_age',
    isMultiple: true,
    region: 'Västergötland',
    sources: ['En bok om Husbyar - Nättidningen Svensk Historia']
  },
  {
    id: 'birgittakallan_husaby',
    name: 'Birgittakällan Husaby',
    coordinates: { lat: 58.5667, lng: 13.2833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['place_name', 'church_foundation'],
    description: 'Dopkälla från övergångsperioden (ca 1008-1028)',
    historicalPeriods: ['transition_period', 'medieval'],
    establishedPeriod: 'transition_period',
    region: 'Västergötland',
    sources: ['Husaby socken – Wikipedia']
  },

  // ✅ ULLEVI KULTPLATSER - vikingatid
  {
    id: 'ullevi_ostergotland',
    name: 'Ullevi (Östergötland)',
    coordinates: { lat: 58.4000, lng: 15.6167 },
    deity: 'ull',
    type: 'royal_center',
    evidence: ['place_name'],
    description: 'Ulls vi - systematiserad kultplats och regionalt centrum',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    pairedWith: 'mjardevi_ostergotland',
    isMultiple: true,
    region: 'Östergötland',
    sources: ['Vikingatid – Linköpings historia']
  },
  {
    id: 'mjardevi_ostergotland',
    name: 'Mjärdevi (Östergötland)',
    coordinates: { lat: 58.4167, lng: 15.6333 },
    deity: 'njord',
    type: 'royal_center',
    evidence: ['place_name'],
    description: 'Njärds devi - gudapar med Ullevi, administrativt centrum',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    pairedWith: 'ullevi_ostergotland',
    region: 'Östergötland',
    sources: ['Vikingatid – Linköpings historia']
  },

  // ✅ TOR-KULTPLATSER (nya tillägg från användarens lista)
  {
    id: 'gamla_uppsala_thor',
    name: 'Gamla Uppsala (Tor-aspekt)',
    coordinates: { lat: 59.8978, lng: 17.5917 },
    deity: 'thor',
    type: 'temple',
    evidence: ['archaeological', 'historical_record'],
    description: 'Sveriges främsta hednatempel där Tor dyrkades tillsammans med Oden och Frej enligt Adam av Bremen',
    historicalPeriods: ['migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'Uppland',
    sources: ['Adam av Bremen', 'Snorre Sturlason']
  },
  {
    id: 'torslunda_oland',
    name: 'Torslunda',
    coordinates: { lat: 56.6333, lng: 16.4833 },
    deity: 'thor',
    type: 'cult_site',
    evidence: ['place_name', 'archaeological'],
    description: 'Järnåldersboplatser och runstenar. Ortnamnet betyder "Tors lund"',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Öland',
    sources: ['Ortnamn', 'Arkeologiska fynd']
  },
  {
    id: 'torsaker_angermanland',
    name: 'Torsåker',
    coordinates: { lat: 62.4833, lng: 16.5667 },
    deity: 'thor',
    type: 'sacred_grove',
    evidence: ['place_name', 'archaeological'],
    description: 'Gammal tingsplats och offerlund enligt tradition',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Ångermanland',
    sources: ['Traditionella källor', 'Tingsplatsarkeologi']
  },
  {
    id: 'torshalla',
    name: 'Torshälla',
    coordinates: { lat: 59.4197, lng: 16.4747 },
    deity: 'thor',
    type: 'cult_site',
    evidence: ['place_name', 'archaeological'],
    description: '"Tors häll" - kultplats vid Eskilstunaån, viktig handelsplats',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Södermanland',
    sources: ['Ortnamn', 'Handelsstadsarkeologi']
  },

  // ✅ FREJ-KULTPLATSER (nya tillägg)
  {
    id: 'skedemosse_oland',
    name: 'Skedemosse',
    coordinates: { lat: 56.5500, lng: 16.4833 },
    deity: 'frey',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Sveriges största offermyr med tusentals vapen och guldföremål offrade 200-500 e.Kr. Kopplad till både krigs- och fruktbarhetskult.',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Öland',
    sources: ['Arkeologiska utgrävningar 1959-1964', 'Offerforskning']
  },
  {
    id: 'gamla_uppsala_frey',
    name: 'Gamla Uppsala (Frej-aspekt)',
    coordinates: { lat: 59.8978, lng: 17.5917 },
    deity: 'frey',
    type: 'temple',
    evidence: ['historical_record'],
    description: 'Frej med stor fallos enligt Adam av Bremen, fruktbarhetskult',
    historicalPeriods: ['migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'Uppland',
    sources: ['Adam av Bremen']
  },
  {
    id: 'huseby_kronoberg',
    name: 'Huseby (Kronoberg)',
    coordinates: { lat: 56.9333, lng: 14.5500 },
    deity: 'frey',
    type: 'royal_center',
    evidence: ['place_name', 'archaeological'],
    description: 'Kungsgård kopplad till Frej-kult och kungamakt',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Småland',
    sources: ['Kungsgårdsarkeologi', 'Ortnamn']
  },

  // ✅ FREJA-KULTPLATSER (nya tillägg)
  {
    id: 'frojel_gotland',
    name: 'Fröjel',
    coordinates: { lat: 57.3333, lng: 18.1833 },
    deity: 'frigg',
    type: 'cult_site',
    evidence: ['place_name', 'archaeological'],
    description: '"Frejas heliga plats", viktig handelsplats under vikingatid',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Gotland',
    sources: ['Ortnamn', 'Handelsarkeologi']
  },
  {
    id: 'hov_ostergotland',
    name: 'Hov (Östergötland)',
    coordinates: { lat: 58.3167, lng: 15.9167 },
    deity: 'frigg',
    type: 'temple',
    evidence: ['place_name', 'archaeological'],
    description: 'Kultbyggnad för vanadyrkan (Freja, Frej, Njord)',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Östergötland',
    sources: ['Tempelarkeologi', 'Vanakult-forskning']
  },

  // ✅ ANDRA GUDAR OCH STORA OFFERPLATSER
  {
    id: 'tissoe_sjaelland',
    name: 'Tissø (Själland)',
    coordinates: { lat: 55.5667, lng: 11.2833 },
    deity: 'other', // Tyr
    type: 'cult_site',
    evidence: ['place_name', 'archaeological'],
    description: '"Tyrs sjö" med stora hallbyggnader och massiva offerfynd',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Danmarkshistorie.dk', 'Arkeologiska fynd']
  },
  {
    id: 'gudme_fyn',
    name: 'Gudme (Fyn)',
    coordinates: { lat: 55.0833, lng: 10.7167 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['place_name', 'archaeological'],
    description: '"Gudarnas hem", enormt kultkomplex från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Arkeologiska utgrävningar', 'Kultplatsarkeologi']
  },
  {
    id: 'uppakra_detailed',
    name: 'Uppåkra (detaljerad)',
    coordinates: { lat: 55.6683, lng: 13.1883 },
    deity: 'other',
    type: 'temple',
    evidence: ['archaeological'],
    description: 'Kultbyggnad med guldgubbar, vapnoffer, kontinuitet 100-1000 e.Kr',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Skåne',
    sources: ['Arkeologiska utgrävningar', 'Guldgubbeforskning']
  },

  // ✅ OFFERKÄLLOR (nya tillägg)
  {
    id: 'roekallorna_bohuslan',
    name: 'Röekällorna',
    coordinates: { lat: 58.1500, lng: 11.5667 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Rika metallfynd från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Bohuslän',
    sources: ['Metallofferforskning', 'Arkeologiska fynd']
  },

  // ✅ UTÖKADE OFFERKÄLLOR I SVERIGE (nya tillägg från användaren)
  {
    id: 'hargs_kalla_uppland',
    name: 'Hargs källa',
    coordinates: { lat: 60.1667, lng: 18.0833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['place_name', 'archaeological'],
    description: 'Nära Hargs bro, kultplats från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Järnåldersarkeologi', 'Kultplatsregistrering']
  },
  {
    id: 'lagga_kalla_uppland',
    name: 'Lagga källa',
    coordinates: { lat: 59.8500, lng: 17.8333 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Järnåldersoffer, metallföremål',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Metallofferforskning', 'Arkeologiska fynd']
  },
  {
    id: 'satraskogen_medelpad',
    name: 'Sätraskogen källa',
    coordinates: { lat: 62.3833, lng: 17.0167 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'Helig källa med lång offertradition',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Medelpad',
    sources: ['Traditionella källor', 'Kultplatsregistrering']
  },
  {
    id: 'skallerudskallas_vastergotland',
    name: 'Skållerudskällan',
    coordinates: { lat: 58.2667, lng: 12.5500 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Medeltida offerkälla, mynt och metallföremål',
    historicalPeriods: ['viking_age', 'medieval'],
    establishedPeriod: 'viking_age',
    region: 'Västergötland',
    sources: ['Medeltidasarkeologi', 'Myntfynd']
  },
  {
    id: 'ballsta_kalla_vallentuna',
    name: 'Bällsta källa/S:t Olofskällan',
    coordinates: { lat: 59.5333, lng: 18.0833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological', 'church_foundation'],
    description: 'Järnåldersoffer, senare helgonkälla',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Kristianiseringsforskning', 'Helgonkultforskning']
  },
  {
    id: 'ryningskallas_smaland',
    name: 'Ryningskällan',
    coordinates: { lat: 57.7500, lng: 14.8000 },
    deity: 'frey',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'Offerkälla med fruktbarhetstradition',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Småland',
    sources: ['Fruktbarhetskult-forskning', 'Traditionella källor']
  },

  // ✅ OFFERKÄLLOR I DANMARK (nya tillägg)
  {
    id: 'thorsberg_mosse',
    name: 'Thorsberg mosse',
    coordinates: { lat: 54.5167, lng: 9.5667 },
    deity: 'thor',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Vapen, textilier, praktföremål',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Mossarkeologi', 'Tekstilforskning']
  },
  {
    id: 'vimose_fyn',
    name: 'Vimose',
    coordinates: { lat: 55.2333, lng: 10.2500 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Vapenoffer från romersk järnålder',
    historicalPeriods: ['early_iron_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Romersk järnåldersforskning', 'Vapnofferstudier']
  },

  // ✅ OFFERKÄLLOR I NORGE (nya tillägg)
  {
    id: 'lysakerelven_källor',
    name: 'Lysakerelven källor',
    coordinates: { lat: 59.9167, lng: 10.6333 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Offerfynd vid källområdet',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Norge',
    sources: ['Norsk offerforskning', 'Vattenofferstudier']
  },
  {
    id: 'levangerkallas_trondelag',
    name: 'Levangerkällan',
    coordinates: { lat: 63.7500, lng: 11.3000 },
    deity: 'frey',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Fruktbarhetskult, järnåldersoffer',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Norge',
    sources: ['Norsk fruktbarhetskult', 'Trøndelag arkeologi']
  },
  {
    id: 'vaernes_kalla_trondelag',
    name: 'Værnes källa',
    coordinates: { lat: 63.4500, lng: 10.9333 },
    deity: 'frey',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Fruktbarhetskult, järnåldersoffer',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Norge',
    sources: ['Norsk fruktbarhetskult', 'Trøndelag arkeologi']
  },

  // ✅ ANDRA VATTENOFFERPLATSER (nya tillägg)
  {
    id: 'karingsjoen_halland',
    name: 'Käringsjön',
    coordinates: { lat: 56.8833, lng: 12.5333 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Sjöoffer, vapen och smycken',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Halland',
    sources: ['Sjöofferforskning', 'Våtmarksarkeologi']
  },
  {
    id: 'hassle_bosarp_skane',
    name: 'Hassle Bösarp källa',
    coordinates: { lat: 55.4833, lng: 14.0833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Källa med kontinuerlig offertradition',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Skåne',
    sources: ['Kontinuitetsforkning', 'Offerkällestudier']
  },
  {
    id: 'lillsjoen_uppland',
    name: 'Lillsjön',
    coordinates: { lat: 59.8667, lng: 17.6333 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Offerfynd från järnåldern',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Uppland',
    sources: ['Sjöofferforskning', 'Upplandsstudier']
  },
  {
    id: 'sorby_kalla_ostergotland',
    name: 'Sörby källa',
    coordinates: { lat: 58.4167, lng: 15.7500 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['archaeological'],
    description: 'Vapenoffer och personliga föremål',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'early_iron_age',
    region: 'Östergötland',
    sources: ['Vapnofferforskning', 'Personföremålsstudier']
  },

  // ✅ STORA OFFERPLATSER (ursprungliga)
  {
    id: 'illerup_adal',
    name: 'Illerup Ådal',
    coordinates: { lat: 56.0833, lng: 9.8333 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Enorma vapendepåer, hela arméutrustningar offrade 200-500 e.Kr',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Vapnofferforskning', 'Krigsarkeologi']
  },
  {
    id: 'nydam_mosse',
    name: 'Nydam mosse',
    coordinates: { lat: 54.9833, lng: 9.7167 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Båtar, vapen, personlig utrustning offrad',
    historicalPeriods: ['early_iron_age', 'migration_period'],
    establishedPeriod: 'early_iron_age',
    region: 'Danmark',
    sources: ['Båtofferforskning', 'Mossarkeologi']
  },
  {
    id: 'vindelsjoen_lappland',
    name: 'Vindelsjön',
    coordinates: { lat: 67.0000, lng: 17.1667 },
    deity: 'other',
    type: 'cult_site',
    evidence: ['archaeological'],
    description: 'Samisk offerplats (seita) med kontinuitet in i sen tid',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Lappland',
    sources: ['Samisk religionsforskning', 'Seitastudier']
  },

  // ✅ VIKTIGA RELIGIOUS CENTERS (ursprungliga)
  {
    id: 'gamla_uppsala',
    name: 'Gamla Uppsala',
    coordinates: { lat: 59.8986, lng: 17.6338 },
    deity: 'other',
    type: 'royal_center',
    evidence: ['archaeological', 'place_name', 'church_foundation'],
    description: 'Sveriges viktigaste hedniska tempelplats med tre gudar',
    historicalPeriods: ['migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'Uppland',
    sources: ['Adam av Bremen', 'Snorre Sturlason']
  },

  {
    id: 'lund_religious_center',
    name: 'Lund (hedniskt centrum)',
    coordinates: { lat: 55.7047, lng: 13.1910 },
    deity: 'other',
    type: 'royal_center',
    evidence: ['archaeological', 'place_name'],
    description: 'Viktigt religöst och politiskt centrum före kristnandet',
    historicalPeriods: ['viking_age', 'transition_period'],
    establishedPeriod: 'viking_age',
    region: 'Skåne',
    sources: ['Lunds historia']
  },

  {
    id: 'lejre_religious_center',
    name: 'Lejre',
    coordinates: { lat: 55.6086, lng: 11.9736 },
    deity: 'odin',
    type: 'royal_center',
    evidence: ['archaeological', 'place_name'],
    description: 'Danskt kungligt och religöst centrum, Skjoldungernas säte',
    historicalPeriods: ['migration_period', 'vendel_period', 'viking_age'],
    establishedPeriod: 'migration_period',
    region: 'Danmark',
    sources: ['Beowulf', 'Saxo Grammaticus']
  },

  {
    id: 'sigtuna_religious_center',
    name: 'Sigtuna (hedniskt centrum)',
    coordinates: { lat: 59.6195, lng: 17.7221 },
    deity: 'other',
    type: 'royal_center',
    evidence: ['archaeological', 'place_name'],
    description: 'Religöst och handelsmässigt centrum före kristnandet',
    historicalPeriods: ['viking_age', 'transition_period'],
    establishedPeriod: 'viking_age',
    region: 'Uppland',
    sources: ['Sigtuna Museum']
  },

  // Add the new offering springs converted to religious places format
  {
    id: 'edestad_offering_spring',
    name: 'Edestad kyrka offerkälla',
    coordinates: { lat: 56.2833, lng: 15.0833 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['church_foundation', 'place_name'],
    description: 'Offerkälla med magiska krafter vid midsommartid. "Kornguden" fördes i procession för årsväxten.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'neolithic',
    region: 'Blekinge',
    sources: ['Visit Blekinge', 'Blekinge släktforskarförening']
  },
  {
    id: 'kalla_gamla_kyrka_spring',
    name: 'Källa gamla kyrka',
    // 57°6′41″N 16°59′11″Ö (norra Öland, Källa socken). Konsoliderad post — ersätter
    // även tidigare dubblett "Källa Ödekyrka".
    coordinates: { lat: 57.1114, lng: 16.9864 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['place_name', 'church_foundation', 'archaeological'],
    description: 'Hednisk offerkälla vid Källa hamn — under forntid/medeltid en av Ölands viktigaste hamnar och en knutpunkt i Östersjötrafiken (myntfynd från Gotland, fastlandet och nordtyska hamnar). Källan kristnades och helgades åt S:t Olof, sjöfararnas helgon, och gav socknen dess namn. 1960 påträffades en igenrasad brunn på kyrkogården — trolig ursprunglig offerkälla. Kristendomen infördes under 1000-talets senare hälft (kristna runstenar); en träkyrka (spår funna 1971 under stenkyrkan) följdes på 1100-talet av en försvarskyrka i kalksten. Idag ödekyrka, sedan 1928 förvaltad av Riksantikvarieämbetet.',
    historicalPeriods: ['early_iron_age', 'migration_period', 'vendel_period', 'viking_age', 'transition_period', 'medieval'],
    establishedPeriod: 'early_iron_age',
    region: 'Öland',
    sources: ['Ragnhild Boström, Källa gamla kyrka (Riksantikvarieämbetet)', 'Nils Sjöstrand, Öländsk Bygd 1960', 'Wikipedia']
  },
  {
    id: 'sankt_mans_spring',
    name: 'Sankt Måns offerkälla',
    coordinates: { lat: 56.1167, lng: 15.8500 },
    deity: 'other',
    type: 'offering_spring',
    evidence: ['place_name'],
    description: 'Undergörande källa för barn och havande kvinnor. Sankt Måns som barnens skyddshelgon.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Blekinge',
    sources: ['PRO']
  },

  // ✅ KRISTNA CENTRUM - SVERIGE
  // Ärkebiskopssäte
  {
    id: 'uppsala_cathedral',
    name: 'Uppsala domkyrka (ärkebiskopssäte)',
    coordinates: { lat: 59.8586, lng: 17.6389 },
    deity: 'christian',
    type: 'archbishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Ärkebiskopssäte från 1164. Gamla Uppsala kultplats kristnades.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Uppland',
    sources: ['Uppsala domkyrka - Wikipedia']
  },

  // Svenska biskopssäten
  {
    id: 'skara_cathedral',
    name: 'Skara domkyrka',
    coordinates: { lat: 58.3867, lng: 13.4400 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Sveriges äldsta stift, ca 1000. Första biskopssätet.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Västergötland',
    sources: ['Skara domkyrka - Wikipedia']
  },
  {
    id: 'linkoping_cathedral',
    name: 'Linköpings domkyrka',
    coordinates: { lat: 58.4100, lng: 15.6218 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Biskopssäte från ca 1100. Viktig medeltida maktbas.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Östergötland',
    sources: ['Linköpings domkyrka - Wikipedia']
  },
  {
    id: 'strangnas_cathedral',
    name: 'Strängnäs domkyrka',
    coordinates: { lat: 59.3739, lng: 17.0317 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Biskopssäte från ca 1120. Viktigt i Eriksgatan.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Södermanland',
    sources: ['Strängnäs domkyrka - Wikipedia']
  },
  {
    id: 'vasteras_cathedral',
    name: 'Västerås domkyrka',
    coordinates: { lat: 59.6099, lng: 16.5448 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Biskopssäte från ca 1170. Viktigt i Eriksgatan.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Västmanland',
    sources: ['Västerås domkyrka - Wikipedia']
  },
  {
    id: 'vaxjo_cathedral',
    name: 'Växjö domkyrka',
    coordinates: { lat: 56.8770, lng: 14.8058 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Biskopssäte från 1170. S:t Sigfrids säte.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Småland',
    sources: ['Växjö domkyrka - Wikipedia']
  },

  // Viktiga missionsplatser
  {
    id: 'birka_mission',
    name: 'Birka (Ansgars mission)',
    coordinates: { lat: 59.3300, lng: 17.5500 },
    deity: 'christian',
    type: 'mission_site',
    evidence: ['historical_record'],
    description: 'Ansgars mission 830. Första kristna mission i Sverige.',
    historicalPeriods: ['viking_age'],
    establishedPeriod: 'viking_age',
    region: 'Uppland',
    sources: ['Birka - Wikipedia']
  },
  {
    id: 'husaby_baptism',
    name: 'Husaby (Olof Skötkonungs dop)',
    coordinates: { lat: 58.5667, lng: 13.2833 },
    deity: 'christian',
    type: 'mission_site',
    evidence: ['historical_record'],
    description: 'Olof Skötkonungs dopplats ca 1000. Första kristne kungen.',
    historicalPeriods: ['transition_period'],
    establishedPeriod: 'transition_period',
    region: 'Västergötland',
    sources: ['Husaby socken - Wikipedia']
  },
  {
    id: 'sigtuna_christian',
    name: 'Sigtuna (kristen stad)',
    coordinates: { lat: 59.6195, lng: 17.7221 },
    deity: 'christian',
    type: 'mission_site',
    evidence: ['historical_record', 'cathedral'],
    description: 'Kristen stad från ca 980. Första planerade kristna staden.',
    historicalPeriods: ['transition_period', 'medieval'],
    establishedPeriod: 'transition_period',
    region: 'Uppland',
    sources: ['Sigtuna - Wikipedia']
  },

  // ✅ KLOSTER - SVERIGE
  // Franciskanerkloster
  {
    id: 'stockholm_franciscan',
    name: 'Franciskanerkloster Stockholm',
    coordinates: { lat: 59.3248, lng: 18.0628 },
    deity: 'christian',
    type: 'franciscan',
    evidence: ['historical_record'],
    description: 'Grundat ca 1270 på Riddarholmen. Gråbrödrakloster.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Uppland',
    sources: ['Franciskanerkloster - Wikipedia']
  },
  {
    id: 'visby_franciscan',
    name: 'Franciskanerkloster Visby',
    coordinates: { lat: 57.6348, lng: 18.2948 },
    deity: 'christian',
    type: 'franciscan',
    evidence: ['archaeological'],
    description: 'Grundat 1233. Ruiner finns bevarade i Visby.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Gotland',
    sources: ['Visby - Wikipedia']
  },
  {
    id: 'skara_franciscan',
    name: 'Franciskanerkloster Skara',
    coordinates: { lat: 58.3867, lng: 13.4400 },
    deity: 'christian',
    type: 'franciscan',
    evidence: ['historical_record'],
    description: 'Grundat ca 1242. Gråbrödrakloster vid domkyrkan.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Västergötland',
    sources: ['Skara - Wikipedia']
  },

  // Dominikanerkloster  
  {
    id: 'lund_dominican',
    name: 'Dominikanerkloster Lund',
    coordinates: { lat: 55.7047, lng: 13.1910 },
    deity: 'christian',
    type: 'dominican',
    evidence: ['historical_record'],
    description: 'Grundat 1223. Nordens första dominikanerkloster.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Skåne',
    sources: ['Lund - Wikipedia']
  },
  {
    id: 'sigtuna_dominican',
    name: 'Dominikanerkloster Sigtuna',
    coordinates: { lat: 59.6195, lng: 17.7221 },
    deity: 'christian',
    type: 'dominican',
    evidence: ['historical_record'],
    description: 'Grundat 1237. Svartbrödrakloster.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Uppland',
    sources: ['Sigtuna - Wikipedia']
  },
  {
    id: 'skanninge_dominican',
    name: 'Dominikanerkloster Skänninge',
    coordinates: { lat: 58.3931, lng: 15.0864 },
    deity: 'christian',
    type: 'dominican',
    evidence: ['historical_record'],
    description: 'Grundat 1237. Viktigt kloster i Östergötland.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Östergötland',
    sources: ['Skänninge - Wikipedia']
  },

  // Birgittinerkloster
  {
    id: 'vadstena_monastery',
    name: 'Vadstena kloster',
    coordinates: { lat: 58.4500, lng: 14.8900 },
    deity: 'christian',
    type: 'birgittine',
    evidence: ['historical_record'],
    description: 'Grundat 1384. Heliga Birgittas huvudkloster.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Östergötland',
    sources: ['Vadstena kloster - Wikipedia']
  },

  // ✅ KRISTNA CENTRUM - DANMARK
  {
    id: 'lund_archbishop',
    name: 'Lunds domkyrka (ärkebiskopssäte)',
    coordinates: { lat: 55.7047, lng: 13.1910 },
    deity: 'christian',
    type: 'archbishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Ärkebiskopssäte 1103/1104. Styrde svenska kyrkan till 1164.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Skåne',
    sources: ['Lunds domkyrka - Wikipedia']
  },
  {
    id: 'ribe_cathedral',
    name: 'Ribe domkyrka',
    coordinates: { lat: 55.3281, lng: 8.7616 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Danmarks äldsta stift, 948. Viktig missionscentral.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Danmark',
    sources: ['Ribe domkyrka - Wikipedia']
  },
  {
    id: 'roskilde_cathedral',
    name: 'Roskilde domkyrka',
    coordinates: { lat: 55.6415, lng: 12.0803 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Biskopssäte ca 1020. Kunglig gravkyrka.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Danmark',
    sources: ['Roskilde domkyrka - Wikipedia']
  },
  {
    id: 'jelling_christianization',
    name: 'Jelling (Harald Blåtands dop)',
    coordinates: { lat: 55.7558, lng: 9.4186 },
    deity: 'christian',
    type: 'mission_site',
    evidence: ['historical_record', 'runestone'],
    description: 'Harald Blåtands dopplats ca 965. Jellingstenarna.',
    historicalPeriods: ['transition_period'],
    establishedPeriod: 'transition_period',
    region: 'Danmark',
    sources: ['Jelling - Wikipedia']
  },

  // ✅ KRISTNA CENTRUM - NORGE
  {
    id: 'nidaros_cathedral',
    name: 'Nidaros domkyrka (ärkebiskopssäte)',
    coordinates: { lat: 63.4269, lng: 10.3969 },
    deity: 'christian',
    type: 'archbishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Ärkebiskopssäte från 1152/1153. Olav den heliges gravkyrka.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Norge',
    sources: ['Nidaros domkyrka - Wikipedia']
  },
  {
    id: 'bergen_cathedral',
    name: 'Bergen domkyrka',
    coordinates: { lat: 60.3894, lng: 5.3242 },
    deity: 'christian',
    type: 'bishop_seat',
    evidence: ['historical_record', 'cathedral'],
    description: 'Biskopssäte från ca 1070. Viktigt handelscentrum.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Norge',
    sources: ['Bergen domkyrka - Wikipedia']
  },
  {
    id: 'moster_assembly',
    name: 'Moster (kristet lagting)',
    coordinates: { lat: 59.7000, lng: 5.3833 },
    deity: 'christian',
    type: 'mission_site',
    evidence: ['historical_record'],
    description: 'Platsen för Norges första kristna lagting 1024.',
    historicalPeriods: ['medieval'],
    establishedPeriod: 'medieval',
    region: 'Norge',
    sources: ['Moster - Wikipedia']
  }
];

// ✅ HELPER FUNCTIONS FOR CHRISTIAN CENTERS
export const getChristianCenters = (selectedTimePeriod?: string) => {
  const places = selectedTimePeriod ? 
    getPlacesForTimePeriod(selectedTimePeriod) : 
    RELIGIOUS_PLACES;
  return places.filter(place => place.deity === 'christian');
};

export const getChristianCentersByType = (type: string, selectedTimePeriod?: string) => {
  const christianPlaces = getChristianCenters(selectedTimePeriod);
  return christianPlaces.filter(place => place.type === type);
};
