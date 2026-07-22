
export interface DbStats {
  totalInscriptions: number;
  totalCoordinates: number;
  totalCarvers: number;
  totalArtefacts: number;
  totalCities: number;
  totalFortresses: number;
  totalVikingNames: number;
  totalHundreds: number;
  totalParishes: number;
  totalFolkGroups: number;
  totalGeneticEvents: number;
  totalRoyalChronicles: number;
  totalRivers: number;
  // Verkliga antal per kartlager (för legendens siffror – ersätter hårdkodade tal).
  layerCounts?: {
    churches?: number;         // ecclesiastical_sites
    coins?: number;            // coins
    spolia?: number;           // picture_stone_reuse
    species?: number;          // species_introductions
    adnaSites?: number;        // distinkta platser med genetiska individer
    heritageTotal?: number;    // heritage_sites (alla typer)
  };
}

export interface UseRunicDataProps {
  searchQuery?: string;
  selectedLandscape?: string;
  selectedCountry?: string;
  selectedPeriod?: string;
  selectedStatus?: string;
  selectedObjectType?: string;
  selectedTimePeriod?: string;
  godNameSearch?: string;
  isVikingMode?: boolean;
  selectedVikingCategory?: string;
}

export interface Inscription {
  id: string;
  signum: string;
  transliteration?: string;
  normalization?: string;
  translation_en?: string;
  translation_sv?: string;
  dating_text?: string;
  location?: string;
  parish?: string;
  province?: string;
  country?: string;
  object_type?: string;
  material?: string;
  dimensions?: string;
  current_location?: string;
  rune_type?: string;
  rune_variant?: string;
  style_group?: string;
  uncertainty_level?: string;
  condition_notes?: string;
  k_samsok_uri?: string;
  rundata_signum?: string;
  complexity_level?: string;
  scholarly_notes?: string;
  paleographic_notes?: string;
  raa_number?: string;
  lamningsnumber?: string;
  cultural_classification?: string;
  data_source?: string;
  inscription_group?: string;
  municipality?: string;
  county?: string;
  landscape?: string;
  period_start?: number;
  period_end?: number;
  dating_confidence?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  latitude?: number | null;
  longitude?: number | null;
  additional_latitude?: number | null;
  additional_longitude?: number | null;
  created_at?: string;
  updated_at?: string;
  bibliography?: string;
  text_segments?: any;
  historical_context?: string;
}

export interface RunicInscription {
  id: string;
  signum: string;
  transliteration?: string;
  translation_en?: string;
  description?: string;
  period?: string;
  dating?: string;
  location?: string;
  parish?: string;
  province?: string;
  country?: string;
  municipality?: string;
  landscape?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  additional_latitude?: number | null;
  additional_longitude?: number | null;
  material?: string;
  object_type?: string;
  carver?: string;
  image_urls?: string[];
  reading_order?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Carver {
  id: string;
  name: string;
  description?: string;
  period_start?: number;
  period_end?: number;
  region?: string;
  country?: string;
}

export interface VikingName {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unknown';
  meaning?: string;
  origin?: string;
  frequency?: number;
  time_period?: string;
  notable_bearers?: string[];
  linguistic_notes?: string;
}

export interface Hundred {
  id: string;
  name: string;
  external_id: string;
  division_external_id?: string;
  province_external_id?: string;
}

export interface Parish {
  id: string;
  name: string;
  external_id: string;
  code?: string;
}

export interface FolkGroup {
  id: string;
  name: string;
  name_en: string;
  main_category: string;
  sub_category: string;
  description?: string;
  description_en?: string;
  language_family?: string;
  language_subfamily?: string;
  historical_significance?: string;
  active_period_start?: number;
  active_period_end?: number;
  coordinates?: {
    x: number;
    y: number;
  };
  dna_profile?: Record<string, any>;
}

export interface GeneticEvent {
  id: string;
  sample_id: string;
  site_id?: string;
  age?: string;
  archaeological_sex?: string;
  genetic_sex?: string;
  mt_haplogroup?: string;
  y_haplogroup?: string;
  ancestry?: Record<string, any>;
  isotopes?: Record<string, any>;
  radiocarbon?: string;
  burial_context?: string;
  grave_number?: string;
  grave_goods?: string[];
  museums_inventory?: string;
}
