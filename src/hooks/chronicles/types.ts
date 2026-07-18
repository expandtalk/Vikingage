
// Types for Royal Chronicles functionality
export interface RoyalDynasty {
  id: string;
  name: string;
  name_en: string;
  description?: string;
  period_start?: number;
  period_end?: number;
  region: string;
  created_at: string;
  updated_at: string;
}

export interface HistoricalSource {
  id: string;
  title: string;
  title_en: string;
  author: string;
  written_year?: number;
  covers_period_start?: number;
  covers_period_end?: number;
  reliability: 'primary' | 'secondary' | 'tertiary' | 'legendary';
  language: string;
  description?: string;
  bias_types: string[];
  created_at: string;
  updated_at: string;
}

export interface HistoricalKing {
  id: string;
  name: string;
  name_variations?: string[];
  dynasty_id?: string;
  reign_start?: number;
  reign_end?: number;
  birth_year?: number;
  death_year?: number;
  status: 'historical' | 'semi_legendary' | 'legendary' | 'disputed';
  region: string;
  gender: 'male' | 'female' | 'unknown';
  description?: string;
  archaeological_evidence: boolean;
  runestone_mentions: boolean;
  // Tillagda 2026-07-18 (migration 20260718200000)
  role?: string | null;
  de_facto_ruler?: boolean;
  external_attestation?: string[] | null;
  sources?: string | null;
  node_control?: string | null;
  created_at: string;
  updated_at: string;
  dynasty?: RoyalDynasty;
}

export interface RoyalRelation {
  id: string;
  person_a: string;
  person_b: string;
  relation_type: string;
  period?: string | null;
  comment?: string | null;
  source?: string | null;
  king_a_id?: string | null;
  king_b_id?: string | null;
  created_at: string;
}

export interface KingSourceMention {
  id: string;
  king_id: string;
  source_id: string;
  mentioned_name: string;
  context?: string;
  reliability_note?: string;
  page_reference?: string;
  quote_original?: string;
  quote_translation?: string;
  created_at: string;
  king?: HistoricalKing;
  source?: HistoricalSource;
}

export interface KingInscriptionLink {
  id: string;
  king_id: string;
  inscription_id: string;
  connection_type: string;
  evidence_strength: string;
  analysis_notes?: string;
  created_at: string;
}
