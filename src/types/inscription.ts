
import { Coordinates } from './common';

// Centralized inscription types
export interface BaseInscription {
  id: string;
  signum: string;
  name?: string;
  location?: string;
  coordinates?: Coordinates;
  latitude?: number;
  longitude?: number;
  country?: string;
  landscape?: string;
  period?: string;
  status?: string;
  object_type?: string;
  coord_confidence?: string | null;
  coord_source?: string | null;
  virtual_inscription?: boolean;
}

export interface RunicInscription extends BaseInscription {
  name?: string;
  name_en?: string;
  also_known_as?: string[];
  alternative_signum?: string[];
  transliteration?: string;
  normalization?: string;
  translation_en?: string;
  translation_sv?: string;
  dating_text?: string;
  parish?: string;
  province?: string;
  material?: string;
  current_location?: string;
  period_start?: number;
  period_end?: number;
  dating_confidence?: number;
  uncertainty_level?: string;
  condition_notes?: string;
  raa_number?: string;
  lamningsnumber?: string;
  cultural_classification?: string;
  data_source?: string;
  inscription_group?: string;
  municipality?: string;
  county?: string;
  k_samsok_uri?: string;
  rundata_signum?: string;
  complexity_level?: string;
  scholarly_notes?: string;
  paleographic_notes?: string;
  historical_context?: string;
  style_group?: string;
  meter?: string | null;
  rune_type?: string;
  rune_variant?: string;
  dimensions?: string;
  additional_latitude?: number | null;
  additional_longitude?: number | null;
  original_coordinates?: string | null; // PostgreSQL point type as string
  created_at?: string;
  updated_at?: string;
  bibliography?: any;
  text_segments?: any;
}
