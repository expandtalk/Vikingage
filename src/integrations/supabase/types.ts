export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _retired_carver_inscription: {
        Row: {
          attribution: Database["public"]["Enums"]["attribution_type"]
          carverid: string
          carverinscriptionid: string
          certainty: boolean
          created_at: string | null
          inscriptionid: string
          lang: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          attribution?: Database["public"]["Enums"]["attribution_type"]
          carverid: string
          carverinscriptionid: string
          certainty?: boolean
          created_at?: string | null
          inscriptionid: string
          lang?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          attribution?: Database["public"]["Enums"]["attribution_type"]
          carverid?: string
          carverinscriptionid?: string
          certainty?: boolean
          created_at?: string | null
          inscriptionid?: string
          lang?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _retired_king_inscription_links: {
        Row: {
          analysis_notes: string | null
          connection_type: string
          created_at: string
          evidence_strength: string
          id: string
          inscription_id: string
          king_id: string
        }
        Insert: {
          analysis_notes?: string | null
          connection_type: string
          created_at?: string
          evidence_strength?: string
          id?: string
          inscription_id: string
          king_id: string
        }
        Update: {
          analysis_notes?: string | null
          connection_type?: string
          created_at?: string
          evidence_strength?: string
          id?: string
          inscription_id?: string
          king_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "king_inscription_links_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "king_inscription_links_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "king_inscription_links_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "king_inscription_links_king_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
        ]
      }
      _retired_source_inscription_links: {
        Row: {
          created_at: string
          id: string
          inscription_id: string
          notes: string | null
          relation: string
          source_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inscription_id: string
          notes?: string | null
          relation?: string
          source_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inscription_id?: string
          notes?: string | null
          relation?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_inscription_links_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_inscription_links_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_inscription_links_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_inscription_links_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      _retired_theme_links: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          theme_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          theme_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_links_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      additional_coordinates: {
        Row: {
          confidence: string | null
          created_at: string | null
          id: number
          inscription_id: string | null
          latitude: number
          longitude: number
          notes: string | null
          signum: string
          source: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          id?: number
          inscription_id?: string | null
          latitude: number
          longitude: number
          notes?: string | null
          signum: string
          source?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          id?: number
          inscription_id?: string | null
          latitude?: number
          longitude?: number
          notes?: string | null
          signum?: string
          source?: string | null
        }
        Relationships: []
      }
      admixture_analysis: {
        Row: {
          analysis_date: string | null
          analysis_type: string | null
          ceu_ancestry: number | null
          chb_ancestry: number | null
          created_at: string | null
          depth_coverage: number | null
          id: string
          individual_id: string | null
          itu_ancestry: number | null
          notes: string | null
          pel_ancestry: number | null
          variants_used: number | null
          yri_ancestry: number | null
        }
        Insert: {
          analysis_date?: string | null
          analysis_type?: string | null
          ceu_ancestry?: number | null
          chb_ancestry?: number | null
          created_at?: string | null
          depth_coverage?: number | null
          id?: string
          individual_id?: string | null
          itu_ancestry?: number | null
          notes?: string | null
          pel_ancestry?: number | null
          variants_used?: number | null
          yri_ancestry?: number | null
        }
        Update: {
          analysis_date?: string | null
          analysis_type?: string | null
          ceu_ancestry?: number | null
          chb_ancestry?: number | null
          created_at?: string | null
          depth_coverage?: number | null
          id?: string
          individual_id?: string | null
          itu_ancestry?: number | null
          notes?: string | null
          pel_ancestry?: number | null
          variants_used?: number | null
          yri_ancestry?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "admixture_analysis_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "genetic_individuals"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analyses: {
        Row: {
          analysis_type: string
          confidence: number
          created_at: string | null
          explanation: string | null
          id: string
          inscription_id: string | null
          linguistic_features: Json | null
          model_name: string
          model_version: string | null
          prediction: Json
          processing_time_ms: number | null
        }
        Insert: {
          analysis_type: string
          confidence: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          inscription_id?: string | null
          linguistic_features?: Json | null
          model_name: string
          model_version?: string | null
          prediction: Json
          processing_time_ms?: number | null
        }
        Update: {
          analysis_type?: string
          confidence?: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          inscription_id?: string | null
          linguistic_features?: Json | null
          model_name?: string
          model_version?: string | null
          prediction?: Json
          processing_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analyses_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analyses_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      aliases_canonical: {
        Row: {
          alias_signum1: string
          alias_signum2: string
          alias_signumid: string
          created_at: string | null
          id: string
          signum1: string
          signum2: string
          signumid: string
          updated_at: string | null
        }
        Insert: {
          alias_signum1: string
          alias_signum2: string
          alias_signumid: string
          created_at?: string | null
          id?: string
          signum1: string
          signum2: string
          signumid: string
          updated_at?: string | null
        }
        Update: {
          alias_signum1?: string
          alias_signum2?: string
          alias_signumid?: string
          created_at?: string | null
          id?: string
          signum1?: string
          signum2?: string
          signumid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      alts_canonical: {
        Row: {
          alt_signum1: string
          alt_signum2: string
          alt_signumid: string
          created_at: string | null
          id: string
          signum1: string
          signum2: string
          signumid: string
          updated_at: string | null
        }
        Insert: {
          alt_signum1: string
          alt_signum2: string
          alt_signumid: string
          created_at?: string | null
          id?: string
          signum1: string
          signum2: string
          signumid: string
          updated_at?: string | null
        }
        Update: {
          alt_signum1?: string
          alt_signum2?: string
          alt_signumid?: string
          created_at?: string | null
          id?: string
          signum1?: string
          signum2?: string
          signumid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      archaeological_finds: {
        Row: {
          country: string | null
          created_at: string | null
          culture: string | null
          description: string | null
          end_year: number | null
          find_type: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          name_en: string | null
          period: string | null
          significance: string | null
          start_year: number | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          culture?: string | null
          description?: string | null
          end_year?: number | null
          find_type?: string | null
          id: string
          lat?: number | null
          lng?: number | null
          name: string
          name_en?: string | null
          period?: string | null
          significance?: string | null
          start_year?: number | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          culture?: string | null
          description?: string | null
          end_year?: number | null
          find_type?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          name_en?: string | null
          period?: string | null
          significance?: string | null
          start_year?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      archaeological_investigations: {
        Row: {
          county: string | null
          created_at: string | null
          finds_summary: string | null
          geo_precision: string | null
          geom: unknown
          id: string
          investigation_type: string | null
          keywords: string[] | null
          landscape: string | null
          lat: number | null
          license: string | null
          lng: number | null
          municipality: string | null
          parish: string | null
          period: string | null
          report_url: string | null
          source_institution: string | null
          source_uri: string
          title: string
          updated_at: string | null
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          county?: string | null
          created_at?: string | null
          finds_summary?: string | null
          geo_precision?: string | null
          geom?: unknown
          id?: string
          investigation_type?: string | null
          keywords?: string[] | null
          landscape?: string | null
          lat?: number | null
          license?: string | null
          lng?: number | null
          municipality?: string | null
          parish?: string | null
          period?: string | null
          report_url?: string | null
          source_institution?: string | null
          source_uri: string
          title: string
          updated_at?: string | null
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          county?: string | null
          created_at?: string | null
          finds_summary?: string | null
          geo_precision?: string | null
          geom?: unknown
          id?: string
          investigation_type?: string | null
          keywords?: string[] | null
          landscape?: string | null
          lat?: number | null
          license?: string | null
          lng?: number | null
          municipality?: string | null
          parish?: string | null
          period?: string | null
          report_url?: string | null
          source_institution?: string | null
          source_uri?: string
          title?: string
          updated_at?: string | null
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: []
      }
      archaeological_sites: {
        Row: {
          burial_type: string | null
          coordinates: unknown
          country: string
          county: string | null
          created_at: string | null
          dating: string | null
          description: string | null
          geom: unknown
          id: string
          location: string
          name: string
          parish: string | null
          period: string
          updated_at: string | null
        }
        Insert: {
          burial_type?: string | null
          coordinates?: unknown
          country: string
          county?: string | null
          created_at?: string | null
          dating?: string | null
          description?: string | null
          geom?: unknown
          id?: string
          location: string
          name: string
          parish?: string | null
          period: string
          updated_at?: string | null
        }
        Update: {
          burial_type?: string | null
          coordinates?: unknown
          country?: string
          county?: string | null
          created_at?: string | null
          dating?: string | null
          description?: string | null
          geom?: unknown
          id?: string
          location?: string
          name?: string
          parish?: string | null
          period?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      armorial_bearers: {
        Row: {
          arms_id: string
          bearer_id: string | null
          bearer_kind: Database["public"]["Enums"]["bearer_kind"]
          bearer_name: string | null
          evidence: Database["public"]["Enums"]["heraldic_evidence"]
          id: string
          notes: string | null
          period_end: number | null
          period_start: number | null
          source_id: string
        }
        Insert: {
          arms_id: string
          bearer_id?: string | null
          bearer_kind: Database["public"]["Enums"]["bearer_kind"]
          bearer_name?: string | null
          evidence?: Database["public"]["Enums"]["heraldic_evidence"]
          id?: string
          notes?: string | null
          period_end?: number | null
          period_start?: number | null
          source_id: string
        }
        Update: {
          arms_id?: string
          bearer_id?: string | null
          bearer_kind?: Database["public"]["Enums"]["bearer_kind"]
          bearer_name?: string | null
          evidence?: Database["public"]["Enums"]["heraldic_evidence"]
          id?: string
          notes?: string | null
          period_end?: number | null
          period_start?: number | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "armorial_bearers_arms_id_fkey"
            columns: ["arms_id"]
            isOneToOne: false
            referencedRelation: "coats_of_arms"
            referencedColumns: ["arms_id"]
          },
          {
            foreignKeyName: "armorial_bearers_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      artefacts: {
        Row: {
          artefact: string
          artefactid: string
          created_at: string | null
          id: string | null
          lang: string
          updated_at: string | null
        }
        Insert: {
          artefact: string
          artefactid: string
          created_at?: string | null
          id?: string | null
          lang?: string
          updated_at?: string | null
        }
        Update: {
          artefact?: string
          artefactid?: string
          created_at?: string | null
          id?: string | null
          lang?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audio_files: {
        Row: {
          avatar_image_id: string | null
          bit_rate: number | null
          channels: number | null
          content_id: string | null
          content_type: string
          content_type_category: string
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          duration_seconds: number | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          language_code: string | null
          narrator: string | null
          original_filename: string
          production_date: string | null
          sample_rate: number | null
          status: string | null
          thumbnail_image_id: string | null
          title: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          avatar_image_id?: string | null
          bit_rate?: number | null
          channels?: number | null
          content_id?: string | null
          content_type: string
          content_type_category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          duration_seconds?: number | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          language_code?: string | null
          narrator?: string | null
          original_filename: string
          production_date?: string | null
          sample_rate?: number | null
          status?: string | null
          thumbnail_image_id?: string | null
          title: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          avatar_image_id?: string | null
          bit_rate?: number | null
          channels?: number | null
          content_id?: string | null
          content_type?: string
          content_type_category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          duration_seconds?: number | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          language_code?: string | null
          narrator?: string | null
          original_filename?: string
          production_date?: string | null
          sample_rate?: number | null
          status?: string | null
          thumbnail_image_id?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_avatar_image_id_fkey"
            columns: ["avatar_image_id"]
            isOneToOne: false
            referencedRelation: "media_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_files_thumbnail_image_id_fkey"
            columns: ["thumbnail_image_id"]
            isOneToOne: false
            referencedRelation: "media_images"
            referencedColumns: ["id"]
          },
        ]
      }
      beacon_sites: {
        Row: {
          created_at: string
          id: string
          landscape: string | null
          lat: number
          lng: number
          municipality: string | null
          name: string
          parish: string | null
          source_uri: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          landscape?: string | null
          lat: number
          lng: number
          municipality?: string | null
          name: string
          parish?: string | null
          source_uri?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          landscape?: string | null
          lat?: number
          lng?: number
          municipality?: string | null
          name?: string
          parish?: string | null
          source_uri?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bracteatetypes: {
        Row: {
          bracteatetype: string
          bracteatetypeid: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          bracteatetype: string
          bracteatetypeid: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          bracteatetype?: string
          bracteatetypeid?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      carver_attributes: {
        Row: {
          attribute_type: string
          carver_id: string
          created_at: string | null
          id: string
          source_ref: string | null
          updated_at: string | null
          value_en: string | null
          value_sv: string | null
        }
        Insert: {
          attribute_type: string
          carver_id: string
          created_at?: string | null
          id?: string
          source_ref?: string | null
          updated_at?: string | null
          value_en?: string | null
          value_sv?: string | null
        }
        Update: {
          attribute_type?: string
          carver_id?: string
          created_at?: string | null
          id?: string
          source_ref?: string | null
          updated_at?: string | null
          value_en?: string | null
          value_sv?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carver_attributes_carver_id_fkey"
            columns: ["carver_id"]
            isOneToOne: false
            referencedRelation: "carvers"
            referencedColumns: ["id"]
          },
        ]
      }
      carver_source: {
        Row: {
          carverinscriptionid: string
          created_at: string
          sourceid: string
          updated_at: string
        }
        Insert: {
          carverinscriptionid: string
          created_at?: string
          sourceid: string
          updated_at?: string
        }
        Update: {
          carverinscriptionid?: string
          created_at?: string
          sourceid?: string
          updated_at?: string
        }
        Relationships: []
      }
      carvers: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          gender: string | null
          home_farm: string | null
          id: string
          is_anonymous: boolean
          is_professional: boolean | null
          language_code: string
          name: string
          period_active_end: number | null
          period_active_start: number | null
          region: string | null
          rundata_carverid: string | null
          source_ref: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          home_farm?: string | null
          id?: string
          is_anonymous?: boolean
          is_professional?: boolean | null
          language_code?: string
          name: string
          period_active_end?: number | null
          period_active_start?: number | null
          region?: string | null
          rundata_carverid?: string | null
          source_ref?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          home_farm?: string | null
          id?: string
          is_anonymous?: boolean
          is_professional?: boolean | null
          language_code?: string
          name?: string
          period_active_end?: number | null
          period_active_start?: number | null
          region?: string | null
          rundata_carverid?: string | null
          source_ref?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      central_place_names: {
        Row: {
          attested_form: string | null
          attested_year: number | null
          category: string | null
          central_place_id: string
          confidence: string | null
          created_at: string
          element_keys: string[] | null
          evidence_tier: string | null
          fnction: string | null
          geom: unknown
          id: string
          interpretation: string | null
          lat: number | null
          lng: number | null
          name: string
          note: string | null
          project_id: string | null
          source: string | null
        }
        Insert: {
          attested_form?: string | null
          attested_year?: number | null
          category?: string | null
          central_place_id: string
          confidence?: string | null
          created_at?: string
          element_keys?: string[] | null
          evidence_tier?: string | null
          fnction?: string | null
          geom?: unknown
          id?: string
          interpretation?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          note?: string | null
          project_id?: string | null
          source?: string | null
        }
        Update: {
          attested_form?: string | null
          attested_year?: number | null
          category?: string | null
          central_place_id?: string
          confidence?: string | null
          created_at?: string
          element_keys?: string[] | null
          evidence_tier?: string | null
          fnction?: string | null
          geom?: unknown
          id?: string
          interpretation?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          note?: string | null
          project_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "central_place_names_central_place_id_fkey"
            columns: ["central_place_id"]
            isOneToOne: false
            referencedRelation: "central_places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "central_place_names_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      central_places: {
        Row: {
          confidence: string | null
          created_at: string
          description: string | null
          geom: unknown
          id: string
          lat: number | null
          lng: number | null
          name: string
          project_id: string | null
          region: string | null
          source: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          description?: string | null
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          project_id?: string | null
          region?: string | null
          source?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string
          description?: string | null
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          project_id?: string | null
          region?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "central_places_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      christian_sites: {
        Row: {
          coordinates: unknown
          county: string | null
          created_at: string | null
          current_condition: string | null
          description: string | null
          description_en: string | null
          dissolved_year: number | null
          founded_year: number | null
          historical_notes: string | null
          id: string
          name: string
          name_en: string | null
          period: string
          province: string | null
          region: string | null
          religious_order: string | null
          significance_level: string | null
          site_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          coordinates: unknown
          county?: string | null
          created_at?: string | null
          current_condition?: string | null
          description?: string | null
          description_en?: string | null
          dissolved_year?: number | null
          founded_year?: number | null
          historical_notes?: string | null
          id?: string
          name: string
          name_en?: string | null
          period: string
          province?: string | null
          region?: string | null
          religious_order?: string | null
          significance_level?: string | null
          site_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: unknown
          county?: string | null
          created_at?: string | null
          current_condition?: string | null
          description?: string | null
          description_en?: string | null
          dissolved_year?: number | null
          founded_year?: number | null
          historical_notes?: string | null
          id?: string
          name?: string
          name_en?: string | null
          period?: string
          province?: string | null
          region?: string | null
          religious_order?: string | null
          significance_level?: string | null
          site_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      church_diocese_history: {
        Row: {
          church_id: string
          created_at: string
          diocese_id: string
          from_year: number | null
          id: string
          note: string | null
          source: string | null
          to_year: number | null
        }
        Insert: {
          church_id: string
          created_at?: string
          diocese_id: string
          from_year?: number | null
          id?: string
          note?: string | null
          source?: string | null
          to_year?: number | null
        }
        Update: {
          church_id?: string
          created_at?: string
          diocese_id?: string
          from_year?: number | null
          id?: string
          note?: string | null
          source?: string | null
          to_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "church_diocese_history_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "ecclesiastical_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_diocese_history_diocese_id_fkey"
            columns: ["diocese_id"]
            isOneToOne: false
            referencedRelation: "dioceses"
            referencedColumns: ["id"]
          },
        ]
      }
      coat_charges: {
        Row: {
          arms_id: string
          field_tincture: string | null
          id: string
          motif_id: string
          ordinary: string | null
          position_note: string | null
          source_id: string | null
          tincture: string | null
        }
        Insert: {
          arms_id: string
          field_tincture?: string | null
          id?: string
          motif_id: string
          ordinary?: string | null
          position_note?: string | null
          source_id?: string | null
          tincture?: string | null
        }
        Update: {
          arms_id?: string
          field_tincture?: string | null
          id?: string
          motif_id?: string
          ordinary?: string | null
          position_note?: string | null
          source_id?: string | null
          tincture?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coat_charges_arms_id_fkey"
            columns: ["arms_id"]
            isOneToOne: false
            referencedRelation: "coats_of_arms"
            referencedColumns: ["arms_id"]
          },
          {
            foreignKeyName: "coat_charges_motif_id_fkey"
            columns: ["motif_id"]
            isOneToOne: false
            referencedRelation: "iconographic_motifs"
            referencedColumns: ["motif_id"]
          },
          {
            foreignKeyName: "coat_charges_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      coats_of_arms: {
        Row: {
          arms_id: string
          blazon: string | null
          blazon_en: string | null
          created_at: string
          earliest_year: number | null
          field_division: string | null
          is_attributed: boolean
          marshalling: string | null
          name: string
          name_en: string | null
          notes: string | null
          origin_theories: string[] | null
          updated_at: string
        }
        Insert: {
          arms_id?: string
          blazon?: string | null
          blazon_en?: string | null
          created_at?: string
          earliest_year?: number | null
          field_division?: string | null
          is_attributed?: boolean
          marshalling?: string | null
          name: string
          name_en?: string | null
          notes?: string | null
          origin_theories?: string[] | null
          updated_at?: string
        }
        Update: {
          arms_id?: string
          blazon?: string | null
          blazon_en?: string | null
          created_at?: string
          earliest_year?: number | null
          field_division?: string | null
          is_attributed?: boolean
          marshalling?: string | null
          name?: string
          name_en?: string | null
          notes?: string | null
          origin_theories?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      coins: {
        Row: {
          category: string
          coordinates: unknown
          created_at: string
          denomination: string | null
          description: string | null
          description_en: string | null
          find_place: string | null
          id: string
          image_url: string | null
          issuer: string | null
          issuer_king_id: string | null
          metal: string | null
          mint: string | null
          name: string
          name_en: string | null
          obverse: string | null
          period_end: number | null
          period_start: number | null
          reverse: string | null
          significance: string | null
          sources: string | null
          updated_at: string
        }
        Insert: {
          category: string
          coordinates?: unknown
          created_at?: string
          denomination?: string | null
          description?: string | null
          description_en?: string | null
          find_place?: string | null
          id?: string
          image_url?: string | null
          issuer?: string | null
          issuer_king_id?: string | null
          metal?: string | null
          mint?: string | null
          name: string
          name_en?: string | null
          obverse?: string | null
          period_end?: number | null
          period_start?: number | null
          reverse?: string | null
          significance?: string | null
          sources?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          coordinates?: unknown
          created_at?: string
          denomination?: string | null
          description?: string | null
          description_en?: string | null
          find_place?: string | null
          id?: string
          image_url?: string | null
          issuer?: string | null
          issuer_king_id?: string | null
          metal?: string | null
          mint?: string | null
          name?: string
          name_en?: string | null
          obverse?: string | null
          period_end?: number | null
          period_start?: number | null
          reverse?: string | null
          significance?: string | null
          sources?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coins_issuer_king_id_fkey"
            columns: ["issuer_king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
        ]
      }
      coordinates: {
        Row: {
          coordinate_id: string
          created_at: string
          current_flag: number
          id: string
          latitude: number
          longitude: number
          object_id: string
          point_coordinates: unknown
          updated_at: string
        }
        Insert: {
          coordinate_id: string
          created_at?: string
          current_flag?: number
          id?: string
          latitude: number
          longitude: number
          object_id: string
          point_coordinates?: unknown
          updated_at?: string
        }
        Update: {
          coordinate_id?: string
          created_at?: string
          current_flag?: number
          id?: string
          latitude?: number
          longitude?: number
          object_id?: string
          point_coordinates?: unknown
          updated_at?: string
        }
        Relationships: []
      }
      counties: {
        Row: {
          countryid: string
          county: string
          countyid: string
          created_at: string
          id: string
          letter: string | null
          number: string | null
          updated_at: string
        }
        Insert: {
          countryid: string
          county: string
          countyid: string
          created_at?: string
          id?: string
          letter?: string | null
          number?: string | null
          updated_at?: string
        }
        Update: {
          countryid?: string
          county?: string
          countyid?: string
          created_at?: string
          id?: string
          letter?: string | null
          number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "county_country"
            columns: ["countryid"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["countryid"]
          },
        ]
      }
      countries: {
        Row: {
          country: string
          countryid: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          country: string
          countryid: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          country?: string
          countryid?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cross_crossform: {
        Row: {
          certainty: boolean
          created_at: string
          crosscrossformid: string
          crossformid: string
          crossid: string
          updated_at: string
        }
        Insert: {
          certainty?: boolean
          created_at?: string
          crosscrossformid?: string
          crossformid: string
          crossid: string
          updated_at?: string
        }
        Update: {
          certainty?: boolean
          created_at?: string
          crosscrossformid?: string
          crossformid?: string
          crossid?: string
          updated_at?: string
        }
        Relationships: []
      }
      crossdescs: {
        Row: {
          created_at: string
          crossdesc: string
          id: string
          lang: string
          objectid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          crossdesc: string
          id?: string
          lang?: string
          objectid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          crossdesc?: string
          id?: string
          lang?: string
          objectid?: string
          updated_at?: string
        }
        Relationships: []
      }
      crosses: {
        Row: {
          created_at: string
          cross_number: number
          crossid: string
          objectid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cross_number: number
          crossid?: string
          objectid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cross_number?: number
          crossid?: string
          objectid?: string
          updated_at?: string
        }
        Relationships: []
      }
      crossforms: {
        Row: {
          aspect: string
          created_at: string
          crossformid: string
          form: number
          updated_at: string
        }
        Insert: {
          aspect: string
          created_at?: string
          crossformid?: string
          form: number
          updated_at?: string
        }
        Update: {
          aspect?: string
          created_at?: string
          crossformid?: string
          form?: number
          updated_at?: string
        }
        Relationships: []
      }
      cult_sites: {
        Row: {
          created_at: string | null
          deity: string | null
          description: string | null
          established_period: string | null
          evidence: string[] | null
          historical_periods: string[] | null
          id: string
          is_multiple: boolean | null
          lat: number | null
          lng: number | null
          name: string
          paired_with: string | null
          region: string | null
          sources: string[] | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deity?: string | null
          description?: string | null
          established_period?: string | null
          evidence?: string[] | null
          historical_periods?: string[] | null
          id: string
          is_multiple?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          paired_with?: string | null
          region?: string | null
          sources?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deity?: string | null
          description?: string | null
          established_period?: string | null
          evidence?: string[] | null
          historical_periods?: string[] | null
          id?: string
          is_multiple?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          paired_with?: string | null
          region?: string | null
          sources?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      danish_parishes: {
        Row: {
          created_at: string
          external_id: string
          fofm_parish: string | null
          id: string
          locality: number | null
          parish_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id: string
          fofm_parish?: string | null
          id?: string
          locality?: number | null
          parish_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string
          fofm_parish?: string | null
          id?: string
          locality?: number | null
          parish_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      dataset_items: {
        Row: {
          added_at: string | null
          dataset_id: string | null
          entity_id: string
          entity_type: string
          id: string
          item_role: string | null
          note: string | null
        }
        Insert: {
          added_at?: string | null
          dataset_id?: string | null
          entity_id: string
          entity_type: string
          id?: string
          item_role?: string | null
          note?: string | null
        }
        Update: {
          added_at?: string | null
          dataset_id?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          item_role?: string | null
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataset_items_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_revisions: {
        Row: {
          change_summary: string | null
          changed_at: string | null
          changed_by: string | null
          dataset_id: string | null
          id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          dataset_id?: string | null
          id?: string
          version: number
        }
        Update: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          dataset_id?: string | null
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "dataset_revisions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dating: {
        Row: {
          created_at: string
          dating: string
          datingid: string
          lang: string
          objectid: string
          parsed_period: string | null
          parsing_confidence: number | null
          parsing_notes: string | null
          period_end: number | null
          period_start: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dating: string
          datingid?: string
          lang?: string
          objectid: string
          parsed_period?: string | null
          parsing_confidence?: number | null
          parsing_notes?: string | null
          period_end?: number | null
          period_start?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dating?: string
          datingid?: string
          lang?: string
          objectid?: string
          parsed_period?: string | null
          parsing_confidence?: number | null
          parsing_notes?: string | null
          period_end?: number | null
          period_start?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      dating_argument: {
        Row: {
          calibration: string | null
          dated_material: Database["public"]["Enums"]["dated_material"] | null
          dating_id: string
          end_year: number | null
          figure_id: string | null
          interval_kind: Database["public"]["Enums"]["interval_kind"]
          lab_code: string | null
          lamning_id: string | null
          method: Database["public"]["Enums"]["dating_method"]
          notes: string | null
          offset_risk: string[] | null
          plateau_affected: boolean
          provenance_reviewed: boolean
          sigma: string | null
          source_id: string
          start_year: number | null
          target_event: Database["public"]["Enums"]["target_event"]
          uncal_bp: number | null
          uncal_sd: number | null
        }
        Insert: {
          calibration?: string | null
          dated_material?: Database["public"]["Enums"]["dated_material"] | null
          dating_id?: string
          end_year?: number | null
          figure_id?: string | null
          interval_kind: Database["public"]["Enums"]["interval_kind"]
          lab_code?: string | null
          lamning_id?: string | null
          method: Database["public"]["Enums"]["dating_method"]
          notes?: string | null
          offset_risk?: string[] | null
          plateau_affected?: boolean
          provenance_reviewed?: boolean
          sigma?: string | null
          source_id: string
          start_year?: number | null
          target_event: Database["public"]["Enums"]["target_event"]
          uncal_bp?: number | null
          uncal_sd?: number | null
        }
        Update: {
          calibration?: string | null
          dated_material?: Database["public"]["Enums"]["dated_material"] | null
          dating_id?: string
          end_year?: number | null
          figure_id?: string | null
          interval_kind?: Database["public"]["Enums"]["interval_kind"]
          lab_code?: string | null
          lamning_id?: string | null
          method?: Database["public"]["Enums"]["dating_method"]
          notes?: string | null
          offset_risk?: string[] | null
          plateau_affected?: boolean
          provenance_reviewed?: boolean
          sigma?: string | null
          source_id?: string
          start_year?: number | null
          target_event?: Database["public"]["Enums"]["target_event"]
          uncal_bp?: number | null
          uncal_sd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_argument_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "figure"
            referencedColumns: ["figure_id"]
          },
          {
            foreignKeyName: "dating_argument_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "v_earliest_primary_evidence"
            referencedColumns: ["figure_id"]
          },
          {
            foreignKeyName: "dating_argument_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "v_late_appearing_figures"
            referencedColumns: ["figure_id"]
          },
          {
            foreignKeyName: "dating_argument_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_argument_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_methods: {
        Row: {
          code: string
          description: string | null
          gives_absolute: boolean | null
          label_en: string | null
          label_sv: string
          resolution: string | null
        }
        Insert: {
          code: string
          description?: string | null
          gives_absolute?: boolean | null
          label_en?: string | null
          label_sv: string
          resolution?: string | null
        }
        Update: {
          code?: string
          description?: string | null
          gives_absolute?: boolean | null
          label_en?: string | null
          label_sv?: string
          resolution?: string | null
        }
        Relationships: []
      }
      dating_source: {
        Row: {
          created_at: string
          dating_id: string
          id: string
          source_id: string
        }
        Insert: {
          created_at?: string
          dating_id: string
          id?: string
          source_id: string
        }
        Update: {
          created_at?: string
          dating_id?: string
          id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dating_source_dating_id_fkey"
            columns: ["dating_id"]
            isOneToOne: false
            referencedRelation: "dating"
            referencedColumns: ["datingid"]
          },
        ]
      }
      dioceses: {
        Row: {
          archdiocese_from_year: number | null
          cathedral: string | null
          code: string
          created_at: string
          dissolved_year: number | null
          founded_year: number | null
          id: string
          is_current: boolean
          metropolitan_of: string | null
          name: string
          name_en: string | null
          realm: string | null
          seat: string | null
          source: string | null
          stift_code: string | null
          territory: string | null
        }
        Insert: {
          archdiocese_from_year?: number | null
          cathedral?: string | null
          code: string
          created_at?: string
          dissolved_year?: number | null
          founded_year?: number | null
          id?: string
          is_current?: boolean
          metropolitan_of?: string | null
          name: string
          name_en?: string | null
          realm?: string | null
          seat?: string | null
          source?: string | null
          stift_code?: string | null
          territory?: string | null
        }
        Update: {
          archdiocese_from_year?: number | null
          cathedral?: string | null
          code?: string
          created_at?: string
          dissolved_year?: number | null
          founded_year?: number | null
          id?: string
          is_current?: boolean
          metropolitan_of?: string | null
          name?: string
          name_en?: string | null
          realm?: string | null
          seat?: string | null
          source?: string | null
          stift_code?: string | null
          territory?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dioceses_metropolitan_of_fkey"
            columns: ["metropolitan_of"]
            isOneToOne: false
            referencedRelation: "dioceses"
            referencedColumns: ["id"]
          },
        ]
      }
      ecclesiastical_leadership: {
        Row: {
          church_id: string | null
          created_at: string
          diocese_id: string | null
          from_year: number | null
          id: string
          king_id: string | null
          person_name: string | null
          role: string
          source: string | null
          to_year: number | null
          wikipedia_url: string | null
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          diocese_id?: string | null
          from_year?: number | null
          id?: string
          king_id?: string | null
          person_name?: string | null
          role: string
          source?: string | null
          to_year?: number | null
          wikipedia_url?: string | null
        }
        Update: {
          church_id?: string | null
          created_at?: string
          diocese_id?: string | null
          from_year?: number | null
          id?: string
          king_id?: string | null
          person_name?: string | null
          role?: string
          source?: string | null
          to_year?: number | null
          wikipedia_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "church_leadership_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "ecclesiastical_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_leadership_king_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecclesiastical_leadership_diocese_id_fkey"
            columns: ["diocese_id"]
            isOneToOne: false
            referencedRelation: "dioceses"
            referencedColumns: ["id"]
          },
        ]
      }
      ecclesiastical_sites: {
        Row: {
          built_from: number | null
          built_to: number | null
          county: string | null
          created_at: string
          current_building_year: number | null
          dating_class: string | null
          dating_source: string | null
          dedication_era: string | null
          dedication_source: string | null
          description: string | null
          description_en: string | null
          diocese_id: string | null
          dissolved_year: number | null
          external_id: string | null
          founded_year: number | null
          geom: unknown
          heritage_site_id: string | null
          historical_notes: string | null
          hundred_id: string | null
          id: string
          image_attribution: string | null
          image_url: string | null
          kind: string
          landscape: string | null
          lat: number | null
          legacy_id: string | null
          legacy_table: string | null
          license: string | null
          lng: number | null
          municipality: string | null
          name: string
          name_en: string | null
          parish: string | null
          parish_id: string | null
          patron_saint: string | null
          raa_object_id: string | null
          register_url: string | null
          religious_order: string | null
          saint_code: string | null
          significance_level: string | null
          source: string | null
          status: string | null
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          built_from?: number | null
          built_to?: number | null
          county?: string | null
          created_at?: string
          current_building_year?: number | null
          dating_class?: string | null
          dating_source?: string | null
          dedication_era?: string | null
          dedication_source?: string | null
          description?: string | null
          description_en?: string | null
          diocese_id?: string | null
          dissolved_year?: number | null
          external_id?: string | null
          founded_year?: number | null
          geom?: unknown
          heritage_site_id?: string | null
          historical_notes?: string | null
          hundred_id?: string | null
          id?: string
          image_attribution?: string | null
          image_url?: string | null
          kind?: string
          landscape?: string | null
          lat?: number | null
          legacy_id?: string | null
          legacy_table?: string | null
          license?: string | null
          lng?: number | null
          municipality?: string | null
          name: string
          name_en?: string | null
          parish?: string | null
          parish_id?: string | null
          patron_saint?: string | null
          raa_object_id?: string | null
          register_url?: string | null
          religious_order?: string | null
          saint_code?: string | null
          significance_level?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          built_from?: number | null
          built_to?: number | null
          county?: string | null
          created_at?: string
          current_building_year?: number | null
          dating_class?: string | null
          dating_source?: string | null
          dedication_era?: string | null
          dedication_source?: string | null
          description?: string | null
          description_en?: string | null
          diocese_id?: string | null
          dissolved_year?: number | null
          external_id?: string | null
          founded_year?: number | null
          geom?: unknown
          heritage_site_id?: string | null
          historical_notes?: string | null
          hundred_id?: string | null
          id?: string
          image_attribution?: string | null
          image_url?: string | null
          kind?: string
          landscape?: string | null
          lat?: number | null
          legacy_id?: string | null
          legacy_table?: string | null
          license?: string | null
          lng?: number | null
          municipality?: string | null
          name?: string
          name_en?: string | null
          parish?: string | null
          parish_id?: string | null
          patron_saint?: string | null
          raa_object_id?: string | null
          register_url?: string | null
          religious_order?: string | null
          saint_code?: string | null
          significance_level?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecclesiastical_sites_diocese_id_fkey"
            columns: ["diocese_id"]
            isOneToOne: false
            referencedRelation: "dioceses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecclesiastical_sites_heritage_site_id_fkey"
            columns: ["heritage_site_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecclesiastical_sites_hundred_id_fkey"
            columns: ["hundred_id"]
            isOneToOne: false
            referencedRelation: "hundreds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecclesiastical_sites_parish_id_fkey"
            columns: ["parish_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_registry: {
        Row: {
          entity_type: string
          id: string
          label: string | null
          updated_at: string
        }
        Insert: {
          entity_type: string
          id: string
          label?: string | null
          updated_at?: string
        }
        Update: {
          entity_type?: string
          id?: string
          label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      estate_holdings: {
        Row: {
          acquired_via: string | null
          confidence: string
          created_at: string
          dynasty_id: string | null
          estate_id: string
          fiscal_system: string | null
          from_dynasty_id: string | null
          from_holder: string | null
          from_holder_kind: string | null
          from_king_id: string | null
          holder_kind: string
          holder_name: string | null
          id: string
          jordnatur: string | null
          king_id: string | null
          note: string | null
          period_end: number | null
          period_start: number | null
          role: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          acquired_via?: string | null
          confidence?: string
          created_at?: string
          dynasty_id?: string | null
          estate_id: string
          fiscal_system?: string | null
          from_dynasty_id?: string | null
          from_holder?: string | null
          from_holder_kind?: string | null
          from_king_id?: string | null
          holder_kind: string
          holder_name?: string | null
          id?: string
          jordnatur?: string | null
          king_id?: string | null
          note?: string | null
          period_end?: number | null
          period_start?: number | null
          role?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          acquired_via?: string | null
          confidence?: string
          created_at?: string
          dynasty_id?: string | null
          estate_id?: string
          fiscal_system?: string | null
          from_dynasty_id?: string | null
          from_holder?: string | null
          from_holder_kind?: string | null
          from_king_id?: string | null
          holder_kind?: string
          holder_name?: string | null
          id?: string
          jordnatur?: string | null
          king_id?: string | null
          note?: string | null
          period_end?: number | null
          period_start?: number | null
          role?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_holdings_dynasty_id_fkey"
            columns: ["dynasty_id"]
            isOneToOne: false
            referencedRelation: "royal_dynasties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_holdings_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_holdings_from_dynasty_id_fkey"
            columns: ["from_dynasty_id"]
            isOneToOne: false
            referencedRelation: "royal_dynasties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_holdings_from_king_id_fkey"
            columns: ["from_king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_holdings_king_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_valuations: {
        Row: {
          cameral_units: string | null
          confidence: string | null
          created_at: string | null
          estate_id: string
          id: string
          jordetal_notation: string | null
          jordetal_penningland: number | null
          note: string | null
          source: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          cameral_units?: string | null
          confidence?: string | null
          created_at?: string | null
          estate_id: string
          id?: string
          jordetal_notation?: string | null
          jordetal_penningland?: number | null
          note?: string | null
          source?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          cameral_units?: string | null
          confidence?: string | null
          created_at?: string | null
          estate_id?: string
          id?: string
          jordetal_notation?: string | null
          jordetal_penningland?: number | null
          note?: string | null
          source?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "estate_valuations_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estates: {
        Row: {
          confidence: string
          created_at: string
          description: string | null
          estate_type: string
          first_attested: number | null
          geom: unknown
          id: string
          lat: number
          lng: number
          name: string
          source: string | null
          updated_at: string
        }
        Insert: {
          confidence?: string
          created_at?: string
          description?: string | null
          estate_type: string
          first_attested?: number | null
          geom?: unknown
          id?: string
          lat: number
          lng: number
          name: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          confidence?: string
          created_at?: string
          description?: string | null
          estate_type?: string
          first_attested?: number | null
          geom?: unknown
          id?: string
          lat?: number
          lng?: number
          name?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_location_candidates: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          proponent: string | null
          source: string | null
          supporting_finds: string | null
          theory: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          proponent?: string | null
          source?: string | null
          supporting_finds?: string | null
          theory?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          proponent?: string | null
          source?: string | null
          supporting_finds?: string | null
          theory?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_location_candidates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "historical_events"
            referencedColumns: ["id"]
          },
        ]
      }
      excursions: {
        Row: {
          coordinates: unknown
          created_at: string
          description_en: string | null
          description_sv: string | null
          grp: string | null
          id: string
          name: string
          period: string | null
          region: string | null
          signum: string | null
          updated_at: string
        }
        Insert: {
          coordinates?: unknown
          created_at?: string
          description_en?: string | null
          description_sv?: string | null
          grp?: string | null
          id: string
          name: string
          period?: string | null
          region?: string | null
          signum?: string | null
          updated_at?: string
        }
        Update: {
          coordinates?: unknown
          created_at?: string
          description_en?: string | null
          description_sv?: string | null
          grp?: string | null
          id?: string
          name?: string
          period?: string | null
          region?: string | null
          signum?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      explore_profiles: {
        Row: {
          config: Json
          created_at: string
          description: Json
          id: string
          is_active: boolean
          label: Json
          owner_id: string | null
          review_status: string
          reviewed_by: string | null
          sort_order: number
          submitted_by: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          config: Json
          created_at?: string
          description?: Json
          id: string
          is_active?: boolean
          label: Json
          owner_id?: string | null
          review_status?: string
          reviewed_by?: string | null
          sort_order?: number
          submitted_by?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: Json
          id?: string
          is_active?: boolean
          label?: Json
          owner_id?: string | null
          review_status?: string
          reviewed_by?: string | null
          sort_order?: number
          submitted_by?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      eye_color_genetics: {
        Row: {
          allele_variants: string[] | null
          created_at: string
          discovery_date: string | null
          eye_color_id: string | null
          gene_function: string | null
          gene_name: string
          id: string
          mutation_type: string | null
          research_notes: string | null
        }
        Insert: {
          allele_variants?: string[] | null
          created_at?: string
          discovery_date?: string | null
          eye_color_id?: string | null
          gene_function?: string | null
          gene_name: string
          id?: string
          mutation_type?: string | null
          research_notes?: string | null
        }
        Update: {
          allele_variants?: string[] | null
          created_at?: string
          discovery_date?: string | null
          eye_color_id?: string | null
          gene_function?: string | null
          gene_name?: string
          id?: string
          mutation_type?: string | null
          research_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eye_color_genetics_eye_color_id_fkey"
            columns: ["eye_color_id"]
            isOneToOne: false
            referencedRelation: "eye_colors"
            referencedColumns: ["id"]
          },
        ]
      }
      eye_color_regions: {
        Row: {
          country: string | null
          created_at: string
          eye_color_id: string | null
          frequency_percent: number
          genetic_significance: string | null
          id: string
          population_notes: string | null
          region_name: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          eye_color_id?: string | null
          frequency_percent: number
          genetic_significance?: string | null
          id?: string
          population_notes?: string | null
          region_name: string
        }
        Update: {
          country?: string | null
          created_at?: string
          eye_color_id?: string | null
          frequency_percent?: number
          genetic_significance?: string | null
          id?: string
          population_notes?: string | null
          region_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "eye_color_regions_eye_color_id_fkey"
            columns: ["eye_color_id"]
            isOneToOne: false
            referencedRelation: "eye_colors"
            referencedColumns: ["id"]
          },
        ]
      }
      eye_colors: {
        Row: {
          color_name: string
          color_name_en: string
          created_at: string
          cultural_associations: string | null
          evolutionary_advantage: string | null
          genetic_complexity: string
          global_frequency_percent: number
          health_protection_level: string | null
          historical_origin: string | null
          id: string
          light_sensitivity_level: string | null
          main_genes: string[] | null
          rarity_rank: number
          updated_at: string
        }
        Insert: {
          color_name: string
          color_name_en: string
          created_at?: string
          cultural_associations?: string | null
          evolutionary_advantage?: string | null
          genetic_complexity: string
          global_frequency_percent: number
          health_protection_level?: string | null
          historical_origin?: string | null
          id?: string
          light_sensitivity_level?: string | null
          main_genes?: string[] | null
          rarity_rank: number
          updated_at?: string
        }
        Update: {
          color_name?: string
          color_name_en?: string
          created_at?: string
          cultural_associations?: string | null
          evolutionary_advantage?: string | null
          genetic_complexity?: string
          global_frequency_percent?: number
          health_protection_level?: string | null
          historical_origin?: string | null
          id?: string
          light_sensitivity_level?: string | null
          main_genes?: string[] | null
          rarity_rank?: number
          updated_at?: string
        }
        Relationships: []
      }
      figure: {
        Row: {
          authenticity: Database["public"]["Enums"]["authenticity_state"]
          authenticity_note: string | null
          authenticity_source_id: string | null
          figure_id: string
          geom: unknown
          lamning_id: string
          local_label: string | null
        }
        Insert: {
          authenticity?: Database["public"]["Enums"]["authenticity_state"]
          authenticity_note?: string | null
          authenticity_source_id?: string | null
          figure_id?: string
          geom?: unknown
          lamning_id: string
          local_label?: string | null
        }
        Update: {
          authenticity?: Database["public"]["Enums"]["authenticity_state"]
          authenticity_note?: string | null
          authenticity_source_id?: string | null
          figure_id?: string
          geom?: unknown
          lamning_id?: string
          local_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "figure_authenticity_source_id_fkey"
            columns: ["authenticity_source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "figure_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      figure_record: {
        Row: {
          crew_stroke_count: number | null
          depicted_object_note: string | null
          depicted_object_type: string | null
          figure_id: string
          figure_record_id: string
          hull_line_doubled: boolean | null
          motif_class: string | null
          observation_id: string
          present: boolean
          ship_asymmetry_idx: number | null
          ship_type_label: string | null
          stem_horn_ratio: number | null
          stern_horn_ratio: number | null
        }
        Insert: {
          crew_stroke_count?: number | null
          depicted_object_note?: string | null
          depicted_object_type?: string | null
          figure_id: string
          figure_record_id?: string
          hull_line_doubled?: boolean | null
          motif_class?: string | null
          observation_id: string
          present: boolean
          ship_asymmetry_idx?: number | null
          ship_type_label?: string | null
          stem_horn_ratio?: number | null
          stern_horn_ratio?: number | null
        }
        Update: {
          crew_stroke_count?: number | null
          depicted_object_note?: string | null
          depicted_object_type?: string | null
          figure_id?: string
          figure_record_id?: string
          hull_line_doubled?: boolean | null
          motif_class?: string | null
          observation_id?: string
          present?: boolean
          ship_asymmetry_idx?: number | null
          ship_type_label?: string | null
          stem_horn_ratio?: number | null
          stern_horn_ratio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "figure_record_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "figure"
            referencedColumns: ["figure_id"]
          },
          {
            foreignKeyName: "figure_record_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "v_earliest_primary_evidence"
            referencedColumns: ["figure_id"]
          },
          {
            foreignKeyName: "figure_record_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "v_late_appearing_figures"
            referencedColumns: ["figure_id"]
          },
          {
            foreignKeyName: "figure_record_observation_id_fkey"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "observation"
            referencedColumns: ["observation_id"]
          },
        ]
      }
      findnumbers: {
        Row: {
          created_at: string
          findnumber: string
          objectid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          findnumber: string
          objectid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          findnumber?: string
          objectid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_object"
            columns: ["objectid"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["objectid"]
          },
        ]
      }
      finds: {
        Row: {
          coordinates: unknown
          created_at: string | null
          data_source: string | null
          dating_text: string | null
          description: string | null
          find_place: string | null
          find_type: string | null
          id: string
          landscape: string | null
          material: string | null
          name: string
          object_count: number | null
          parish: string | null
          raa_number: string | null
          updated_at: string | null
        }
        Insert: {
          coordinates?: unknown
          created_at?: string | null
          data_source?: string | null
          dating_text?: string | null
          description?: string | null
          find_place?: string | null
          find_type?: string | null
          id?: string
          landscape?: string | null
          material?: string | null
          name: string
          object_count?: number | null
          parish?: string | null
          raa_number?: string | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: unknown
          created_at?: string | null
          data_source?: string | null
          dating_text?: string | null
          description?: string | null
          find_place?: string | null
          find_type?: string | null
          id?: string
          landscape?: string | null
          material?: string | null
          name?: string
          object_count?: number | null
          parish?: string | null
          raa_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      folk_group_cities: {
        Row: {
          city_id: string | null
          created_at: string | null
          folk_group_id: string | null
          id: string
          notes: string | null
          period_end: number | null
          period_start: number | null
          relationship_type: string | null
          significance_level: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          folk_group_id?: string | null
          id?: string
          notes?: string | null
          period_end?: number | null
          period_start?: number | null
          relationship_type?: string | null
          significance_level?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          folk_group_id?: string | null
          id?: string
          notes?: string | null
          period_end?: number | null
          period_start?: number | null
          relationship_type?: string | null
          significance_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folk_group_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "viking_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folk_group_cities_folk_group_id_fkey"
            columns: ["folk_group_id"]
            isOneToOne: false
            referencedRelation: "folk_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      folk_groups: {
        Row: {
          active_period_end: number | null
          active_period_start: number | null
          coordinates: unknown
          created_at: string | null
          description: string | null
          description_en: string | null
          dna_profile: Json | null
          geo_precision: string | null
          historical_significance: string | null
          id: string
          language_family: string | null
          language_subfamily: string | null
          main_category: Database["public"]["Enums"]["folk_group_category"]
          name: string
          name_en: string
          sub_category: string
          updated_at: string | null
        }
        Insert: {
          active_period_end?: number | null
          active_period_start?: number | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          dna_profile?: Json | null
          geo_precision?: string | null
          historical_significance?: string | null
          id?: string
          language_family?: string | null
          language_subfamily?: string | null
          main_category: Database["public"]["Enums"]["folk_group_category"]
          name: string
          name_en: string
          sub_category: string
          updated_at?: string | null
        }
        Update: {
          active_period_end?: number | null
          active_period_start?: number | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          dna_profile?: Json | null
          geo_precision?: string | null
          historical_significance?: string | null
          id?: string
          language_family?: string | null
          language_subfamily?: string | null
          main_category?: Database["public"]["Enums"]["folk_group_category"]
          name?: string
          name_en?: string
          sub_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fort_element: {
        Row: {
          created_at: string | null
          element_type: string
          end_earliest: number | null
          end_latest: number | null
          evidence: string
          evidence_class: string | null
          geom: unknown
          halo_geom: unknown
          hypothesis_id: number | null
          id: number
          name: string | null
          pos_accuracy_m: number | null
          pos_uncertainty_m: number | null
          published: boolean
          site: string
          start_earliest: number | null
          start_latest: number | null
        }
        Insert: {
          created_at?: string | null
          element_type: string
          end_earliest?: number | null
          end_latest?: number | null
          evidence: string
          evidence_class?: string | null
          geom: unknown
          halo_geom?: unknown
          hypothesis_id?: number | null
          id?: number
          name?: string | null
          pos_accuracy_m?: number | null
          pos_uncertainty_m?: number | null
          published?: boolean
          site: string
          start_earliest?: number | null
          start_latest?: number | null
        }
        Update: {
          created_at?: string | null
          element_type?: string
          end_earliest?: number | null
          end_latest?: number | null
          evidence?: string
          evidence_class?: string | null
          geom?: unknown
          halo_geom?: unknown
          hypothesis_id?: number | null
          id?: number
          name?: string | null
          pos_accuracy_m?: number | null
          pos_uncertainty_m?: number | null
          published?: boolean
          site?: string
          start_earliest?: number | null
          start_latest?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fort_element_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "fort_hypothesis"
            referencedColumns: ["id"]
          },
        ]
      }
      fort_element_source: {
        Row: {
          element_id: number
          note: string | null
          source_id: number
        }
        Insert: {
          element_id: number
          note?: string | null
          source_id: number
        }
        Update: {
          element_id?: number
          note?: string | null
          source_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fort_element_source_element_id_fkey"
            columns: ["element_id"]
            isOneToOne: false
            referencedRelation: "fort_element"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fort_element_source_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "fort_source"
            referencedColumns: ["id"]
          },
        ]
      }
      fort_hypothesis: {
        Row: {
          author: string | null
          id: number
          name: string
          note: string | null
          site: string
          source_ref: string | null
          year: number | null
        }
        Insert: {
          author?: string | null
          id?: number
          name: string
          note?: string | null
          site: string
          source_ref?: string | null
          year?: number | null
        }
        Update: {
          author?: string | null
          id?: number
          name?: string
          note?: string | null
          site?: string
          source_ref?: string | null
          year?: number | null
        }
        Relationships: []
      }
      fort_source: {
        Row: {
          archive: string | null
          citation: string | null
          id: number
          signum: string | null
          source_type: string | null
          url: string | null
          year: number | null
        }
        Insert: {
          archive?: string | null
          citation?: string | null
          id?: number
          signum?: string | null
          source_type?: string | null
          url?: string | null
          year?: number | null
        }
        Update: {
          archive?: string | null
          citation?: string | null
          id?: number
          signum?: string | null
          source_type?: string | null
          url?: string | null
          year?: number | null
        }
        Relationships: []
      }
      fragments: {
        Row: {
          belongsto: string
          created_at: string
          objectid: string
          updated_at: string
        }
        Insert: {
          belongsto: string
          created_at?: string
          objectid: string
          updated_at?: string
        }
        Update: {
          belongsto?: string
          created_at?: string
          objectid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "belongs_object"
            columns: ["belongsto"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["objectid"]
          },
          {
            foreignKeyName: "fragment_object"
            columns: ["objectid"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["objectid"]
          },
        ]
      }
      genetic_individuals: {
        Row: {
          age: string | null
          ancestry: Json | null
          archaeological_sex: string | null
          burial_context: string | null
          created_at: string | null
          dental_status: string | null
          genetic_sex: string | null
          grave_goods: string[] | null
          grave_number: string | null
          id: string
          individual_label: string | null
          isotopes: Json | null
          king_id: string | null
          mt_haplogroup: string | null
          museums_inventory: string | null
          pathology: string | null
          period_from: number | null
          period_to: number | null
          radiocarbon: string | null
          sample_id: string
          site_id: string | null
          source: string | null
          stature_cm: number | null
          status_grade: string | null
          status_markers: string[] | null
          updated_at: string | null
          y_haplogroup: string | null
        }
        Insert: {
          age?: string | null
          ancestry?: Json | null
          archaeological_sex?: string | null
          burial_context?: string | null
          created_at?: string | null
          dental_status?: string | null
          genetic_sex?: string | null
          grave_goods?: string[] | null
          grave_number?: string | null
          id?: string
          individual_label?: string | null
          isotopes?: Json | null
          king_id?: string | null
          mt_haplogroup?: string | null
          museums_inventory?: string | null
          pathology?: string | null
          period_from?: number | null
          period_to?: number | null
          radiocarbon?: string | null
          sample_id: string
          site_id?: string | null
          source?: string | null
          stature_cm?: number | null
          status_grade?: string | null
          status_markers?: string[] | null
          updated_at?: string | null
          y_haplogroup?: string | null
        }
        Update: {
          age?: string | null
          ancestry?: Json | null
          archaeological_sex?: string | null
          burial_context?: string | null
          created_at?: string | null
          dental_status?: string | null
          genetic_sex?: string | null
          grave_goods?: string[] | null
          grave_number?: string | null
          id?: string
          individual_label?: string | null
          isotopes?: Json | null
          king_id?: string | null
          mt_haplogroup?: string | null
          museums_inventory?: string | null
          pathology?: string | null
          period_from?: number | null
          period_to?: number | null
          radiocarbon?: string | null
          sample_id?: string
          site_id?: string | null
          source?: string | null
          stature_cm?: number | null
          status_grade?: string | null
          status_markers?: string[] | null
          updated_at?: string | null
          y_haplogroup?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genetic_individuals_king_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "genetic_individuals_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "archaeological_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      genetic_markers: {
        Row: {
          created_at: string | null
          description: string | null
          frequency: number | null
          gene: string | null
          geographic_spread: string | null
          haplogroup: string | null
          id: string
          marker_type: string
          modern_distribution: string | null
          origin: string
          significance: string | null
          study_evidence: string | null
          time_introduction: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          frequency?: number | null
          gene?: string | null
          geographic_spread?: string | null
          haplogroup?: string | null
          id?: string
          marker_type: string
          modern_distribution?: string | null
          origin: string
          significance?: string | null
          study_evidence?: string | null
          time_introduction?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          frequency?: number | null
          gene?: string | null
          geographic_spread?: string | null
          haplogroup?: string | null
          id?: string
          marker_type?: string
          modern_distribution?: string | null
          origin?: string
          significance?: string | null
          study_evidence?: string | null
          time_introduction?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      germanic_periods: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          description_en: string | null
          detail: Json | null
          end_year: number | null
          id: string
          name: string
          name_en: string | null
          start_year: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          detail?: Json | null
          end_year?: number | null
          id: string
          name: string
          name_en?: string | null
          start_year?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          detail?: Json | null
          end_year?: number | null
          id?: string
          name?: string
          name_en?: string | null
          start_year?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gods: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          domain: string[] | null
          id: string
          name: string
          name_old_norse: string | null
          symbols: string[] | null
          updated_at: string | null
          wikidata_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string[] | null
          id?: string
          name: string
          name_old_norse?: string | null
          symbols?: string[] | null
          updated_at?: string | null
          wikidata_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string[] | null
          id?: string
          name?: string
          name_old_norse?: string | null
          symbols?: string[] | null
          updated_at?: string | null
          wikidata_id?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          groupid: string
          lang: string
          notes: string | null
          type: Database["public"]["Enums"]["group_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          groupid: string
          lang?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["group_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          groupid?: string
          lang?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["group_type"]
          updated_at?: string
        }
        Relationships: []
      }
      harbors: {
        Row: {
          approx_extent: string | null
          created_at: string | null
          current_status: string | null
          description: string | null
          description_en: string | null
          geom: unknown
          harbor_type: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          name_en: string | null
          period_end: number | null
          period_start: number | null
          shoreline_note: string | null
          sources: string | null
        }
        Insert: {
          approx_extent?: string | null
          created_at?: string | null
          current_status?: string | null
          description?: string | null
          description_en?: string | null
          geom?: unknown
          harbor_type?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          name_en?: string | null
          period_end?: number | null
          period_start?: number | null
          shoreline_note?: string | null
          sources?: string | null
        }
        Update: {
          approx_extent?: string | null
          created_at?: string | null
          current_status?: string | null
          description?: string | null
          description_en?: string | null
          geom?: unknown
          harbor_type?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          name_en?: string | null
          period_end?: number | null
          period_start?: number | null
          shoreline_note?: string | null
          sources?: string | null
        }
        Relationships: []
      }
      her_dk_notes: {
        Row: {
          created_at: string
          external_id: string
          her_dk_id: string
          id: string
          lang: string
          notes: string
          object_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id: string
          her_dk_id: string
          id?: string
          lang?: string
          notes: string
          object_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string
          her_dk_id?: string
          id?: string
          lang?: string
          notes?: string
          object_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_her_dk_notes_lang"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["language_code"]
          },
          {
            foreignKeyName: "fk_her_dk_notes_parish"
            columns: ["her_dk_id"]
            isOneToOne: false
            referencedRelation: "danish_parishes"
            referencedColumns: ["external_id"]
          },
        ]
      }
      her_SE: {
        Row: {
          fmisid: number | null
          her_SEid: string
          her_SEparishid: string
          kmrid: string | null
          raänr: string | null
        }
        Insert: {
          fmisid?: number | null
          her_SEid: string
          her_SEparishid: string
          kmrid?: string | null
          raänr?: string | null
        }
        Update: {
          fmisid?: number | null
          her_SEid?: string
          her_SEparishid?: string
          kmrid?: string | null
          raänr?: string | null
        }
        Relationships: []
      }
      heraldic_attestations: {
        Row: {
          arms_id: string | null
          attestation_id: string
          created_at: string
          end_year: number | null
          evidence_class: Database["public"]["Enums"]["heraldic_evidence"]
          motif_id: string | null
          notes: string | null
          side: string | null
          source_id: string
          start_year: number | null
          target: Database["public"]["Enums"]["heraldic_target"]
          target_id: string | null
          target_ref: string | null
        }
        Insert: {
          arms_id?: string | null
          attestation_id?: string
          created_at?: string
          end_year?: number | null
          evidence_class?: Database["public"]["Enums"]["heraldic_evidence"]
          motif_id?: string | null
          notes?: string | null
          side?: string | null
          source_id: string
          start_year?: number | null
          target: Database["public"]["Enums"]["heraldic_target"]
          target_id?: string | null
          target_ref?: string | null
        }
        Update: {
          arms_id?: string | null
          attestation_id?: string
          created_at?: string
          end_year?: number | null
          evidence_class?: Database["public"]["Enums"]["heraldic_evidence"]
          motif_id?: string | null
          notes?: string | null
          side?: string | null
          source_id?: string
          start_year?: number | null
          target?: Database["public"]["Enums"]["heraldic_target"]
          target_id?: string | null
          target_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heraldic_attestations_arms_id_fkey"
            columns: ["arms_id"]
            isOneToOne: false
            referencedRelation: "coats_of_arms"
            referencedColumns: ["arms_id"]
          },
          {
            foreignKeyName: "heraldic_attestations_motif_id_fkey"
            columns: ["motif_id"]
            isOneToOne: false
            referencedRelation: "iconographic_motifs"
            referencedColumns: ["motif_id"]
          },
          {
            foreignKeyName: "heraldic_attestations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      heritage_sites: {
        Row: {
          context_ref: string | null
          context_state: Database["public"]["Enums"]["context_state"]
          created_at: string
          description: string | null
          existence: Database["public"]["Enums"]["existence_state"]
          geom: unknown
          id: string
          landscape: string | null
          lat: number
          lng: number
          municipality: string | null
          name: string
          parish: string | null
          period: string | null
          raa_type: string
          register_id: string | null
          register_system: string | null
          source_uri: string | null
          updated_at: string
        }
        Insert: {
          context_ref?: string | null
          context_state?: Database["public"]["Enums"]["context_state"]
          created_at?: string
          description?: string | null
          existence?: Database["public"]["Enums"]["existence_state"]
          geom?: unknown
          id?: string
          landscape?: string | null
          lat: number
          lng: number
          municipality?: string | null
          name: string
          parish?: string | null
          period?: string | null
          raa_type: string
          register_id?: string | null
          register_system?: string | null
          source_uri?: string | null
          updated_at?: string
        }
        Update: {
          context_ref?: string | null
          context_state?: Database["public"]["Enums"]["context_state"]
          created_at?: string
          description?: string | null
          existence?: Database["public"]["Enums"]["existence_state"]
          geom?: unknown
          id?: string
          landscape?: string | null
          lat?: number
          lng?: number
          municipality?: string | null
          name?: string
          parish?: string | null
          period?: string | null
          raa_type?: string
          register_id?: string | null
          register_system?: string | null
          source_uri?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      historical_events: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          event_name: string
          event_name_en: string
          event_type: string
          geom: unknown
          id: string
          lat: number | null
          lng: number | null
          location_note: string | null
          location_status: string | null
          region_affected: string[] | null
          significance_level: string
          sources: string[] | null
          updated_at: string | null
          year_end: number | null
          year_start: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          event_name: string
          event_name_en: string
          event_type?: string
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          location_note?: string | null
          location_status?: string | null
          region_affected?: string[] | null
          significance_level?: string
          sources?: string[] | null
          updated_at?: string | null
          year_end?: number | null
          year_start: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          event_name?: string
          event_name_en?: string
          event_type?: string
          geom?: unknown
          id?: string
          lat?: number | null
          lng?: number | null
          location_note?: string | null
          location_status?: string | null
          region_affected?: string[] | null
          significance_level?: string
          sources?: string[] | null
          updated_at?: string | null
          year_end?: number | null
          year_start?: number
        }
        Relationships: []
      }
      historical_kings: {
        Row: {
          archaeological_evidence: boolean | null
          birth_year: number | null
          created_at: string
          de_facto_ruler: boolean
          death_year: number | null
          description: string | null
          dynasty_id: string | null
          external_attestation: string[]
          gender: string
          id: string
          image_caption: string | null
          image_credit: string | null
          image_url: string | null
          name: string
          name_variations: string[] | null
          node_control: string | null
          region: string
          reign_end: number | null
          reign_start: number | null
          role: string | null
          runestone_mentions: boolean | null
          sources: string | null
          status: Database["public"]["Enums"]["king_status"]
          updated_at: string
        }
        Insert: {
          archaeological_evidence?: boolean | null
          birth_year?: number | null
          created_at?: string
          de_facto_ruler?: boolean
          death_year?: number | null
          description?: string | null
          dynasty_id?: string | null
          external_attestation?: string[]
          gender?: string
          id?: string
          image_caption?: string | null
          image_credit?: string | null
          image_url?: string | null
          name: string
          name_variations?: string[] | null
          node_control?: string | null
          region: string
          reign_end?: number | null
          reign_start?: number | null
          role?: string | null
          runestone_mentions?: boolean | null
          sources?: string | null
          status?: Database["public"]["Enums"]["king_status"]
          updated_at?: string
        }
        Update: {
          archaeological_evidence?: boolean | null
          birth_year?: number | null
          created_at?: string
          de_facto_ruler?: boolean
          death_year?: number | null
          description?: string | null
          dynasty_id?: string | null
          external_attestation?: string[]
          gender?: string
          id?: string
          image_caption?: string | null
          image_credit?: string | null
          image_url?: string | null
          name?: string
          name_variations?: string[] | null
          node_control?: string | null
          region?: string
          reign_end?: number | null
          reign_start?: number | null
          role?: string | null
          runestone_mentions?: boolean | null
          sources?: string | null
          status?: Database["public"]["Enums"]["king_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "historical_kings_dynasty_id_fkey"
            columns: ["dynasty_id"]
            isOneToOne: false
            referencedRelation: "royal_dynasties"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_periods: {
        Row: {
          created_at: string | null
          description: string | null
          genetic_characteristics: string | null
          id: string
          name: string
          name_en: string
          time_range: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          genetic_characteristics?: string | null
          id?: string
          name: string
          name_en: string
          time_range: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          genetic_characteristics?: string | null
          id?: string
          name?: string
          name_en?: string
          time_range?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      historical_sources: {
        Row: {
          api_endpoint: string | null
          api_query: string | null
          author: string | null
          bias_types: Database["public"]["Enums"]["bias_type"][] | null
          collection: string | null
          copyrighted_editions: string | null
          covers_period_end: number | null
          covers_period_start: number | null
          created_at: string
          description: string | null
          doi: string | null
          id: string
          kind: Database["public"]["Enums"]["source_kind"]
          language: string | null
          manuscript: string | null
          meter: string | null
          peer_reviewed: boolean | null
          reliability: Database["public"]["Enums"]["source_reliability"]
          repository: string | null
          repository_ref: string | null
          response_hash: string | null
          retrieved_at: string | null
          rights: Database["public"]["Enums"]["source_rights"]
          title: string
          title_en: string
          updated_at: string
          url: string | null
          work_type: string | null
          written_year: number | null
        }
        Insert: {
          api_endpoint?: string | null
          api_query?: string | null
          author?: string | null
          bias_types?: Database["public"]["Enums"]["bias_type"][] | null
          collection?: string | null
          copyrighted_editions?: string | null
          covers_period_end?: number | null
          covers_period_start?: number | null
          created_at?: string
          description?: string | null
          doi?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["source_kind"]
          language?: string | null
          manuscript?: string | null
          meter?: string | null
          peer_reviewed?: boolean | null
          reliability: Database["public"]["Enums"]["source_reliability"]
          repository?: string | null
          repository_ref?: string | null
          response_hash?: string | null
          retrieved_at?: string | null
          rights?: Database["public"]["Enums"]["source_rights"]
          title: string
          title_en: string
          updated_at?: string
          url?: string | null
          work_type?: string | null
          written_year?: number | null
        }
        Update: {
          api_endpoint?: string | null
          api_query?: string | null
          author?: string | null
          bias_types?: Database["public"]["Enums"]["bias_type"][] | null
          collection?: string | null
          copyrighted_editions?: string | null
          covers_period_end?: number | null
          covers_period_start?: number | null
          created_at?: string
          description?: string | null
          doi?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["source_kind"]
          language?: string | null
          manuscript?: string | null
          meter?: string | null
          peer_reviewed?: boolean | null
          reliability?: Database["public"]["Enums"]["source_reliability"]
          repository?: string | null
          repository_ref?: string | null
          response_hash?: string | null
          retrieved_at?: string | null
          rights?: Database["public"]["Enums"]["source_rights"]
          title?: string
          title_en?: string
          updated_at?: string
          url?: string | null
          work_type?: string | null
          written_year?: number | null
        }
        Relationships: []
      }
      hundreds: {
        Row: {
          created_at: string
          division_external_id: string | null
          external_id: string
          id: string
          name: string
          province_external_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          division_external_id?: string | null
          external_id: string
          id?: string
          name: string
          province_external_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          division_external_id?: string | null
          external_id?: string
          id?: string
          name?: string
          province_external_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hypothesis_areas: {
        Row: {
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          note: string | null
          radius_km: number
          shape: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          note?: string | null
          radius_km?: number
          shape?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          note?: string | null
          radius_km?: number
          shape?: string | null
          user_id?: string
        }
        Relationships: []
      }
      iconographic_motifs: {
        Row: {
          category: Database["public"]["Enums"]["motif_category"]
          created_at: string
          description: string | null
          heraldic_term: string | null
          motif_id: string
          name: string
          name_en: string | null
          notes: string | null
          origin_note: string | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["motif_category"]
          created_at?: string
          description?: string | null
          heraldic_term?: string | null
          motif_id?: string
          name: string
          name_en?: string | null
          notes?: string | null
          origin_note?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["motif_category"]
          created_at?: string
          description?: string | null
          heraldic_term?: string | null
          motif_id?: string
          name?: string
          name_en?: string | null
          notes?: string | null
          origin_note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      imagelinks: {
        Row: {
          created_at: string
          imagelink: string
          imagelinkid: string
          objectid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          imagelink: string
          imagelinkid: string
          objectid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          imagelink?: string
          imagelinkid?: string
          objectid?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_attribution_staging: {
        Row: {
          created_at: string
          id: string
          link_count: number
          note_text: string
          original_carver_name: string
          related_signa: string[] | null
          resolved: boolean
          tier: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link_count?: number
          note_text: string
          original_carver_name: string
          related_signa?: string[] | null
          resolved?: boolean
          tier?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link_count?: number
          note_text?: string
          original_carver_name?: string
          related_signa?: string[] | null
          resolved?: boolean
          tier?: string | null
        }
        Relationships: []
      }
      inscription_attributions: {
        Row: {
          certainty: boolean | null
          created_at: string
          id: string
          inscription_id: string
          kind: string
          note_sv: string
          related_signa: string[] | null
          source_ref: string | null
        }
        Insert: {
          certainty?: boolean | null
          created_at?: string
          id?: string
          inscription_id: string
          kind?: string
          note_sv: string
          related_signa?: string[] | null
          source_ref?: string | null
        }
        Update: {
          certainty?: boolean | null
          created_at?: string
          id?: string
          inscription_id?: string
          kind?: string
          note_sv?: string
          related_signa?: string[] | null
          source_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_attributions_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_attributions_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_attributions_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      inscription_comparisons: {
        Row: {
          comparison_type: string | null
          created_at: string | null
          findings: Json | null
          id: string
          inscription_a_id: string | null
          inscription_b_id: string | null
          notes: string | null
          similarity_score: number | null
          user_id: string | null
        }
        Insert: {
          comparison_type?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          inscription_a_id?: string | null
          inscription_b_id?: string | null
          notes?: string | null
          similarity_score?: number | null
          user_id?: string | null
        }
        Update: {
          comparison_type?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          inscription_a_id?: string | null
          inscription_b_id?: string | null
          notes?: string | null
          similarity_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_comparisons_inscription_a_id_fkey"
            columns: ["inscription_a_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_comparisons_inscription_a_id_fkey"
            columns: ["inscription_a_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_comparisons_inscription_a_id_fkey"
            columns: ["inscription_a_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_comparisons_inscription_b_id_fkey"
            columns: ["inscription_b_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_comparisons_inscription_b_id_fkey"
            columns: ["inscription_b_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_comparisons_inscription_b_id_fkey"
            columns: ["inscription_b_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      inscription_group: {
        Row: {
          created_at: string
          groupid: string
          inscriptionid: string
        }
        Insert: {
          created_at?: string
          groupid: string
          inscriptionid: string
        }
        Update: {
          created_at?: string
          groupid?: string
          inscriptionid?: string
        }
        Relationships: []
      }
      inscription_locations: {
        Row: {
          certainty: string | null
          created_at: string | null
          from_year: number | null
          id: string
          inscription_id: string | null
          lat: number | null
          lng: number | null
          moved_year: number | null
          note: string | null
          parish: string | null
          place_name: string | null
          role: string | null
          seq: number | null
          signum: string | null
          source: string | null
          to_year: number | null
        }
        Insert: {
          certainty?: string | null
          created_at?: string | null
          from_year?: number | null
          id?: string
          inscription_id?: string | null
          lat?: number | null
          lng?: number | null
          moved_year?: number | null
          note?: string | null
          parish?: string | null
          place_name?: string | null
          role?: string | null
          seq?: number | null
          signum?: string | null
          source?: string | null
          to_year?: number | null
        }
        Update: {
          certainty?: string | null
          created_at?: string | null
          from_year?: number | null
          id?: string
          inscription_id?: string | null
          lat?: number | null
          lng?: number | null
          moved_year?: number | null
          note?: string | null
          parish?: string | null
          place_name?: string | null
          role?: string | null
          seq?: number | null
          signum?: string | null
          source?: string | null
          to_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_locations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_locations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_locations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      inscription_material: {
        Row: {
          inscription_id: string
          material_code: string
          scheme: string
          source_ref: string
        }
        Insert: {
          inscription_id: string
          material_code: string
          scheme?: string
          source_ref?: string
        }
        Update: {
          inscription_id?: string
          material_code?: string
          scheme?: string
          source_ref?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscription_material_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_material_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_material_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_material_scheme_material_code_fkey"
            columns: ["scheme", "material_code"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["scheme", "code"]
          },
        ]
      }
      inscription_media: {
        Row: {
          copyright_info: string | null
          created_at: string | null
          description: string | null
          file_format: string | null
          id: string
          inscription_id: string | null
          media_type: string
          media_url: string
          photo_date: string | null
          photographer: string | null
          resolution: string | null
          source_institution: string | null
        }
        Insert: {
          copyright_info?: string | null
          created_at?: string | null
          description?: string | null
          file_format?: string | null
          id?: string
          inscription_id?: string | null
          media_type: string
          media_url: string
          photo_date?: string | null
          photographer?: string | null
          resolution?: string | null
          source_institution?: string | null
        }
        Update: {
          copyright_info?: string | null
          created_at?: string | null
          description?: string | null
          file_format?: string | null
          id?: string
          inscription_id?: string | null
          media_type?: string
          media_url?: string
          photo_date?: string | null
          photographer?: string | null
          resolution?: string | null
          source_institution?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscription_media_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_media_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_media_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      inscription_runetype: {
        Row: {
          inscription_id: string
          runetype_code: string
          scheme: string
          source_ref: string
        }
        Insert: {
          inscription_id: string
          runetype_code: string
          scheme?: string
          source_ref?: string
        }
        Update: {
          inscription_id?: string
          runetype_code?: string
          scheme?: string
          source_ref?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscription_runetype_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_runetype_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_runetype_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_runetype_scheme_runetype_code_fkey"
            columns: ["scheme", "runetype_code"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["scheme", "code"]
          },
        ]
      }
      inscription_style: {
        Row: {
          certainty: boolean | null
          inscription_id: string
          scheme: string
          source_ref: string
          style_code: string
        }
        Insert: {
          certainty?: boolean | null
          inscription_id: string
          scheme?: string
          source_ref?: string
          style_code: string
        }
        Update: {
          certainty?: boolean | null
          inscription_id?: string
          scheme?: string
          source_ref?: string
          style_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscription_style_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_style_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_style_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_style_scheme_style_code_fkey"
            columns: ["scheme", "style_code"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["scheme", "code"]
          },
        ]
      }
      inscription_titles: {
        Row: {
          category: string | null
          confidence: string | null
          created_at: string | null
          id: string
          inscription_id: string | null
          label_sv: string | null
          signum: string | null
          source: string | null
          title_code: string
        }
        Insert: {
          category?: string | null
          confidence?: string | null
          created_at?: string | null
          id?: string
          inscription_id?: string | null
          label_sv?: string | null
          signum?: string | null
          source?: string | null
          title_code: string
        }
        Update: {
          category?: string | null
          confidence?: string | null
          created_at?: string | null
          id?: string
          inscription_id?: string | null
          label_sv?: string | null
          signum?: string | null
          source?: string | null
          title_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscription_titles_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_titles_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_titles_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      inscription_uri: {
        Row: {
          created_at: string
          inscription_id: string
          source_ref: string
          uri: string
        }
        Insert: {
          created_at?: string
          inscription_id: string
          source_ref?: string
          uri: string
        }
        Update: {
          created_at?: string
          inscription_id?: string
          source_ref?: string
          uri?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscription_uri_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_uri_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscription_uri_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      interpretations: {
        Row: {
          created_at: string
          id: string
          inscription_id: string
          language: string | null
          source_ref: string
          tei_text: string | null
          text: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          id: string
          inscription_id: string
          language?: string | null
          source_ref?: string
          tei_text?: string | null
          text?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          inscription_id?: string
          language?: string | null
          source_ref?: string
          tei_text?: string | null
          text?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interpretations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpretations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpretations_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      intervention: {
        Row: {
          agent: string | null
          contaminates_interpretation: boolean
          event_date: unknown
          intervention_id: string
          kind: Database["public"]["Enums"]["intervention_kind"]
          lamning_id: string
          notes: string | null
          source_id: string
        }
        Insert: {
          agent?: string | null
          contaminates_interpretation?: boolean
          event_date?: unknown
          intervention_id?: string
          kind: Database["public"]["Enums"]["intervention_kind"]
          lamning_id: string
          notes?: string | null
          source_id: string
        }
        Update: {
          agent?: string | null
          contaminates_interpretation?: boolean
          event_date?: unknown
          intervention_id?: string
          kind?: Database["public"]["Enums"]["intervention_kind"]
          lamning_id?: string
          notes?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intervention_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intervention_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      isotope_measurements: {
        Row: {
          confidence: string | null
          created_at: string
          id: string
          individual_id: string
          is_local: boolean | null
          lab: string | null
          method: string | null
          note: string | null
          reference_baseline: string | null
          source: string | null
          system: string
          tissue: string | null
          uncertainty: number | null
          unit: string | null
          value: number
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          id?: string
          individual_id: string
          is_local?: boolean | null
          lab?: string | null
          method?: string | null
          note?: string | null
          reference_baseline?: string | null
          source?: string | null
          system: string
          tissue?: string | null
          uncertainty?: number | null
          unit?: string | null
          value: number
        }
        Update: {
          confidence?: string | null
          created_at?: string
          id?: string
          individual_id?: string
          is_local?: boolean | null
          lab?: string | null
          method?: string | null
          note?: string | null
          reference_baseline?: string | null
          source?: string | null
          system?: string
          tissue?: string | null
          uncertainty?: number | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "isotope_measurements_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "genetic_individuals"
            referencedColumns: ["id"]
          },
        ]
      }
      kalmar_place_names: {
        Row: {
          category: string
          coord_precision: string | null
          created_at: string | null
          element_reading: string | null
          framework: string | null
          gazetteer_match: boolean
          head_element: string | null
          id: string
          interpretation: string | null
          lat: number | null
          lng: number | null
          name: string
          period_stratum: string | null
          semantic_domain: string | null
          sol_headword: string | null
          sol_match: string
          sol_note: string | null
          source: string | null
        }
        Insert: {
          category: string
          coord_precision?: string | null
          created_at?: string | null
          element_reading?: string | null
          framework?: string | null
          gazetteer_match?: boolean
          head_element?: string | null
          id?: string
          interpretation?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          period_stratum?: string | null
          semantic_domain?: string | null
          sol_headword?: string | null
          sol_match?: string
          sol_note?: string | null
          source?: string | null
        }
        Update: {
          category?: string
          coord_precision?: string | null
          created_at?: string | null
          element_reading?: string | null
          framework?: string | null
          gazetteer_match?: boolean
          head_element?: string | null
          id?: string
          interpretation?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          period_stratum?: string | null
          semantic_domain?: string | null
          sol_headword?: string | null
          sol_match?: string
          sol_note?: string | null
          source?: string | null
        }
        Relationships: []
      }
      king_fortress_links: {
        Row: {
          confidence: string
          created_at: string
          fortress_id: string
          id: string
          king_id: string
          note: string | null
          relation: string
          source: string | null
        }
        Insert: {
          confidence?: string
          created_at?: string
          fortress_id: string
          id?: string
          king_id: string
          note?: string | null
          relation?: string
          source?: string | null
        }
        Update: {
          confidence?: string
          created_at?: string
          fortress_id?: string
          id?: string
          king_id?: string
          note?: string | null
          relation?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "king_fortress_links_fortress_id_fkey"
            columns: ["fortress_id"]
            isOneToOne: false
            referencedRelation: "viking_fortresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "king_fortress_links_king_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
        ]
      }
      king_site_links: {
        Row: {
          confidence: string
          created_at: string
          id: string
          king_id: string
          note: string | null
          relation: string
          site_id: string
          site_type: string
          source: string | null
        }
        Insert: {
          confidence?: string
          created_at?: string
          id?: string
          king_id: string
          note?: string | null
          relation: string
          site_id: string
          site_type: string
          source?: string | null
        }
        Update: {
          confidence?: string
          created_at?: string
          id?: string
          king_id?: string
          note?: string | null
          relation?: string
          site_id?: string
          site_type?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "king_site_links_king_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
        ]
      }
      king_source_mentions: {
        Row: {
          context: string | null
          created_at: string
          id: string
          king_id: string
          mentioned_name: string
          page_reference: string | null
          quote_original: string | null
          quote_translation: string | null
          reliability_note: string | null
          source_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          king_id: string
          mentioned_name: string
          page_reference?: string | null
          quote_original?: string | null
          quote_translation?: string | null
          reliability_note?: string | null
          source_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          king_id?: string
          mentioned_name?: string
          page_reference?: string | null
          quote_original?: string | null
          quote_translation?: string | null
          reliability_note?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "king_source_mentions_king_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "king_source_mentions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      lamning_geometry: {
        Row: {
          elevation_m_rh2000: number | null
          geom: unknown
          geometry_id: string
          horizontal_unc_m: number | null
          is_current: boolean
          lamning_id: string
          method: Database["public"]["Enums"]["position_method"]
          metric_srid: number
          recorded_at: string | null
          source_crs: string | null
          source_id: string
          stated_precision: string | null
          transform_note: string | null
          was_transformed: boolean
        }
        Insert: {
          elevation_m_rh2000?: number | null
          geom: unknown
          geometry_id?: string
          horizontal_unc_m?: number | null
          is_current?: boolean
          lamning_id: string
          method?: Database["public"]["Enums"]["position_method"]
          metric_srid?: number
          recorded_at?: string | null
          source_crs?: string | null
          source_id: string
          stated_precision?: string | null
          transform_note?: string | null
          was_transformed?: boolean
        }
        Update: {
          elevation_m_rh2000?: number | null
          geom?: unknown
          geometry_id?: string
          horizontal_unc_m?: number | null
          is_current?: boolean
          lamning_id?: string
          method?: Database["public"]["Enums"]["position_method"]
          metric_srid?: number
          recorded_at?: string | null
          source_crs?: string | null
          source_id?: string
          stated_precision?: string | null
          transform_note?: string | null
          was_transformed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lamning_geometry_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lamning_geometry_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      language_periods: {
        Row: {
          code: string
          id: string
          is_analysis_baseline: boolean | null
          name: string
          name_en: string | null
          note: string | null
          parent_code: string | null
          region_scope: string | null
          script: string | null
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          code: string
          id?: string
          is_analysis_baseline?: boolean | null
          name: string
          name_en?: string | null
          note?: string | null
          parent_code?: string | null
          region_scope?: string | null
          script?: string | null
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          code?: string
          id?: string
          is_analysis_baseline?: boolean | null
          name?: string
          name_en?: string | null
          note?: string | null
          parent_code?: string | null
          region_scope?: string | null
          script?: string | null
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string
          id: string
          language_code: string
          name_en: string
          name_sv: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_code: string
          name_en: string
          name_sv: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          name_en?: string
          name_sv?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_hypotheses: {
        Row: {
          confidence: string | null
          created_at: string | null
          feature_name: string
          feature_slug: string | null
          geom: unknown
          id: string
          kind: string
          label: string | null
          lat: number | null
          lng: number | null
          rationale: string | null
          source: string | null
          thing_site_id: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          feature_name: string
          feature_slug?: string | null
          geom?: unknown
          id?: string
          kind: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          rationale?: string | null
          source?: string | null
          thing_site_id?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          feature_name?: string
          feature_slug?: string | null
          geom?: unknown
          id?: string
          kind?: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          rationale?: string | null
          source?: string | null
          thing_site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_hypotheses_thing_site_id_fkey"
            columns: ["thing_site_id"]
            isOneToOne: false
            referencedRelation: "thing_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          id: string
          language_code: string
          location: string
          object_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_code?: string
          location: string
          object_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          location?: string
          object_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_locations_language"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["language_code"]
          },
        ]
      }
      material_analyses: {
        Row: {
          analysis_type: string | null
          confidence: string | null
          created_at: string | null
          find_ref: string | null
          id: string
          lab: string | null
          material: string | null
          method: string | null
          object_id: string | null
          object_type: string | null
          provenance_interpretation: string | null
          result: string | null
          source: string | null
        }
        Insert: {
          analysis_type?: string | null
          confidence?: string | null
          created_at?: string | null
          find_ref?: string | null
          id?: string
          lab?: string | null
          material?: string | null
          method?: string | null
          object_id?: string | null
          object_type?: string | null
          provenance_interpretation?: string | null
          result?: string | null
          source?: string | null
        }
        Update: {
          analysis_type?: string | null
          confidence?: string | null
          created_at?: string | null
          find_ref?: string | null
          id?: string
          lab?: string | null
          material?: string | null
          method?: string | null
          object_id?: string | null
          object_type?: string | null
          provenance_interpretation?: string | null
          result?: string | null
          source?: string | null
        }
        Relationships: []
      }
      material_materialsubtype: {
        Row: {
          created_at: string
          materialid: string
          subtypeid: string
        }
        Insert: {
          created_at?: string
          materialid: string
          subtypeid: string
        }
        Update: {
          created_at?: string
          materialid?: string
          subtypeid?: string
        }
        Relationships: []
      }
      materialtypes: {
        Row: {
          created_at: string
          lang: string
          materialtype: string
          materialtypeid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          lang?: string
          materialtype: string
          materialtypeid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          lang?: string
          materialtype?: string
          materialtypeid?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_images: {
        Row: {
          alt_text: string | null
          caption: string | null
          content_type: string
          created_at: string
          created_by: string | null
          file_path: string
          file_size: number | null
          filename: string
          height: number | null
          id: string
          image_type: string
          original_filename: string
          status: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          content_type: string
          created_at?: string
          created_by?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          height?: number | null
          id?: string
          image_type: string
          original_filename: string
          status?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          content_type?: string
          created_at?: string
          created_by?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          height?: number | null
          id?: string
          image_type?: string
          original_filename?: string
          status?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      metal_analyses: {
        Row: {
          confidence: string | null
          created_at: string
          id: string
          lab: string | null
          method: string | null
          note: string | null
          object_id: string
          object_type: string
          source: string
          system: string
          uncertainty: number | null
          unit: string | null
          value: number
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          id?: string
          lab?: string | null
          method?: string | null
          note?: string | null
          object_id: string
          object_type: string
          source: string
          system: string
          uncertainty?: number | null
          unit?: string | null
          value: number
        }
        Update: {
          confidence?: string | null
          created_at?: string
          id?: string
          lab?: string | null
          method?: string | null
          note?: string | null
          object_id?: string
          object_type?: string
          source?: string
          system?: string
          uncertainty?: number | null
          unit?: string | null
          value?: number
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          countyid: string
          created_at: string
          municipality: string
          municipalityid: string
          number: string | null
          updated_at: string
        }
        Insert: {
          countyid: string
          created_at?: string
          municipality: string
          municipalityid: string
          number?: string | null
          updated_at?: string
        }
        Update: {
          countyid?: string
          created_at?: string
          municipality?: string
          municipalityid?: string
          number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      name_datings: {
        Row: {
          created_at: string
          dating_basis: string | null
          dating_text: string | null
          id: string
          landscape: string | null
          name: string
          name_type: string | null
          note: string | null
          page: number | null
          place_name_id: string | null
          socken: string | null
          source: string
          uncertainty: string | null
        }
        Insert: {
          created_at?: string
          dating_basis?: string | null
          dating_text?: string | null
          id?: string
          landscape?: string | null
          name: string
          name_type?: string | null
          note?: string | null
          page?: number | null
          place_name_id?: string | null
          socken?: string | null
          source?: string
          uncertainty?: string | null
        }
        Update: {
          created_at?: string
          dating_basis?: string | null
          dating_text?: string | null
          id?: string
          landscape?: string | null
          name?: string
          name_type?: string | null
          note?: string | null
          page?: number | null
          place_name_id?: string | null
          socken?: string | null
          source?: string
          uncertainty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "name_datings_place_name_id_fkey"
            columns: ["place_name_id"]
            isOneToOne: false
            referencedRelation: "place_names"
            referencedColumns: ["id"]
          },
        ]
      }
      norwegian_localities: {
        Row: {
          created_at: string
          external_id: string
          id: string
          locality: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          locality?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          locality?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string | null
          id: string
          lang: string
          noteid: string
          notes: string
          objectid: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lang?: string
          noteid: string
          notes: string
          objectid: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lang?: string
          noteid?: string
          notes?: string
          objectid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      object_artefact: {
        Row: {
          artefactid: string
          created_at: string | null
          objectid: string
          updated_at: string | null
        }
        Insert: {
          artefactid: string
          created_at?: string | null
          objectid: string
          updated_at?: string | null
        }
        Update: {
          artefactid?: string
          created_at?: string | null
          objectid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      object_source: {
        Row: {
          created_at: string
          objectid: string
          sourceid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          objectid: string
          sourceid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          objectid?: string
          sourceid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_object"
            columns: ["objectid"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_object"
            columns: ["objectid"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_object"
            columns: ["objectid"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_source"
            columns: ["sourceid"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["sourceid"]
          },
        ]
      }
      objects: {
        Row: {
          artefact: string | null
          created_at: string
          extant: boolean
          material: string | null
          objectid: string
          originallocation: boolean | null
          placeid: string | null
          updated_at: string
        }
        Insert: {
          artefact?: string | null
          created_at?: string
          extant?: boolean
          material?: string | null
          objectid: string
          originallocation?: boolean | null
          placeid?: string | null
          updated_at?: string
        }
        Update: {
          artefact?: string | null
          created_at?: string
          extant?: boolean
          material?: string | null
          objectid?: string
          originallocation?: boolean | null
          placeid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_place"
            columns: ["placeid"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["placeid"]
          },
        ]
      }
      observation: {
        Row: {
          agent: string | null
          agent_note: string | null
          derived_from: string | null
          is_primary: boolean
          lamning_id: string
          lighting_note: string | null
          method: Database["public"]["Enums"]["obs_method"]
          notes: string | null
          obs_date: unknown
          observation_id: string
          paint_state: Database["public"]["Enums"]["paint_state"]
          source_id: string
          surface_condition: string | null
        }
        Insert: {
          agent?: string | null
          agent_note?: string | null
          derived_from?: string | null
          is_primary: boolean
          lamning_id: string
          lighting_note?: string | null
          method: Database["public"]["Enums"]["obs_method"]
          notes?: string | null
          obs_date?: unknown
          observation_id?: string
          paint_state?: Database["public"]["Enums"]["paint_state"]
          source_id: string
          surface_condition?: string | null
        }
        Update: {
          agent?: string | null
          agent_note?: string | null
          derived_from?: string | null
          is_primary?: boolean
          lamning_id?: string
          lighting_note?: string | null
          method?: Database["public"]["Enums"]["obs_method"]
          notes?: string | null
          obs_date?: unknown
          observation_id?: string
          paint_state?: Database["public"]["Enums"]["paint_state"]
          source_id?: string
          surface_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observation_derived_from_fkey"
            columns: ["derived_from"]
            isOneToOne: false
            referencedRelation: "observation"
            referencedColumns: ["observation_id"]
          },
          {
            foreignKeyName: "observation_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observation_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      ontology_entity_types: {
        Row: {
          code: string
          coord_kind: string | null
          description: string | null
          id_column: string | null
          label_en: string | null
          label_sv: string | null
          physical_table: string | null
          provenance_columns: string | null
          status: string
        }
        Insert: {
          code: string
          coord_kind?: string | null
          description?: string | null
          id_column?: string | null
          label_en?: string | null
          label_sv?: string | null
          physical_table?: string | null
          provenance_columns?: string | null
          status?: string
        }
        Update: {
          code?: string
          coord_kind?: string | null
          description?: string | null
          id_column?: string | null
          label_en?: string | null
          label_sv?: string | null
          physical_table?: string | null
          provenance_columns?: string | null
          status?: string
        }
        Relationships: []
      }
      ontology_measures: {
        Row: {
          applies_to: string[] | null
          code: string
          description: string | null
          inputs: string | null
          label_en: string | null
          label_sv: string | null
          output_unit: string | null
          rpc: string | null
          status: string
        }
        Insert: {
          applies_to?: string[] | null
          code: string
          description?: string | null
          inputs?: string | null
          label_en?: string | null
          label_sv?: string | null
          output_unit?: string | null
          rpc?: string | null
          status?: string
        }
        Update: {
          applies_to?: string[] | null
          code?: string
          description?: string | null
          inputs?: string | null
          label_en?: string | null
          label_sv?: string | null
          output_unit?: string | null
          rpc?: string | null
          status?: string
        }
        Relationships: []
      }
      ore_sources: {
        Row: {
          country: string | null
          created_at: string
          evidence: string | null
          geom: unknown
          id: string
          isotope_signature: Json | null
          lat: number | null
          lng: number | null
          metals: string[] | null
          name: string
          name_en: string | null
          note: string | null
          ore_type: string | null
          period_from: number | null
          period_text: string | null
          period_to: number | null
          region: string | null
          source: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          evidence?: string | null
          geom?: unknown
          id?: string
          isotope_signature?: Json | null
          lat?: number | null
          lng?: number | null
          metals?: string[] | null
          name: string
          name_en?: string | null
          note?: string | null
          ore_type?: string | null
          period_from?: number | null
          period_text?: string | null
          period_to?: number | null
          region?: string | null
          source: string
        }
        Update: {
          country?: string | null
          created_at?: string
          evidence?: string | null
          geom?: unknown
          id?: string
          isotope_signature?: Json | null
          lat?: number | null
          lng?: number | null
          metals?: string[] | null
          name?: string
          name_en?: string | null
          note?: string | null
          ore_type?: string | null
          period_from?: number | null
          period_text?: string | null
          period_to?: number | null
          region?: string | null
          source?: string
        }
        Relationships: []
      }
      ortnamn_element_config: {
        Row: {
          category: string | null
          element_key: string
          forms: string | null
          id: string
          include: boolean
          label: string | null
          note: string | null
          owner: string | null
          strength: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          element_key: string
          forms?: string | null
          id?: string
          include?: boolean
          label?: string | null
          note?: string | null
          owner?: string | null
          strength?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          element_key?: string
          forms?: string | null
          id?: string
          include?: boolean
          label?: string | null
          note?: string | null
          owner?: string | null
          strength?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ortnamn_element_hits: {
        Row: {
          created_at: string | null
          element_key: string
          id: string
          lat: number | null
          lng: number | null
          near_node: boolean | null
          note: string | null
          place_name: string
          region: string
          sol_note: string | null
          verdict: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          element_key: string
          id?: string
          lat?: number | null
          lng?: number | null
          near_node?: boolean | null
          note?: string | null
          place_name: string
          region: string
          sol_note?: string | null
          verdict?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          element_key?: string
          id?: string
          lat?: number | null
          lng?: number | null
          near_node?: boolean | null
          note?: string | null
          place_name?: string
          region?: string
          sol_note?: string | null
          verdict?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      ortnamn_element_interpretations: {
        Row: {
          created_at: string
          element_key: string | null
          id: string
          interpretation: string
          note: string | null
          proponent: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          element_key?: string | null
          id?: string
          interpretation: string
          note?: string | null
          proponent?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          element_key?: string | null
          id?: string
          interpretation?: string
          note?: string | null
          proponent?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ortnamn_element_interpretations_element_key_fkey"
            columns: ["element_key"]
            isOneToOne: false
            referencedRelation: "ortnamn_element_config"
            referencedColumns: ["element_key"]
          },
        ]
      }
      ortnamn_enrichment_results: {
        Row: {
          baseline_n: number | null
          caveat: string | null
          computed_at: string
          cult_core_n: number | null
          cult_enrichment: number | null
          cult_n: number | null
          included_elements: string | null
          near_pct: number | null
          neutral_enrichment: number | null
          owner_note: string | null
          per_element: Json | null
          radius_km: number | null
          ratio: number | null
          ratio_core: number | null
          region: string
        }
        Insert: {
          baseline_n?: number | null
          caveat?: string | null
          computed_at?: string
          cult_core_n?: number | null
          cult_enrichment?: number | null
          cult_n?: number | null
          included_elements?: string | null
          near_pct?: number | null
          neutral_enrichment?: number | null
          owner_note?: string | null
          per_element?: Json | null
          radius_km?: number | null
          ratio?: number | null
          ratio_core?: number | null
          region: string
        }
        Update: {
          baseline_n?: number | null
          caveat?: string | null
          computed_at?: string
          cult_core_n?: number | null
          cult_enrichment?: number | null
          cult_n?: number | null
          included_elements?: string | null
          near_pct?: number | null
          neutral_enrichment?: number | null
          owner_note?: string | null
          per_element?: Json | null
          radius_km?: number | null
          ratio?: number | null
          ratio_core?: number | null
          region?: string
        }
        Relationships: []
      }
      ortnamn_sol_comparison: {
        Row: {
          created_at: string
          diff: string | null
          id: string
          landscape: string | null
          name: string
          note: string | null
          our_reading: string | null
          our_source: string | null
          owner: string | null
          sol_entry: string | null
          sol_reading: string | null
        }
        Insert: {
          created_at?: string
          diff?: string | null
          id?: string
          landscape?: string | null
          name: string
          note?: string | null
          our_reading?: string | null
          our_source?: string | null
          owner?: string | null
          sol_entry?: string | null
          sol_reading?: string | null
        }
        Update: {
          created_at?: string
          diff?: string | null
          id?: string
          landscape?: string | null
          name?: string
          note?: string | null
          our_reading?: string | null
          our_source?: string | null
          owner?: string | null
          sol_entry?: string | null
          sol_reading?: string | null
        }
        Relationships: []
      }
      paleo_shorelines: {
        Row: {
          attribution: string
          created_at: string
          geom: unknown
          id: string
          license: string
          model_version: string
          period_label: string | null
          rsl_bound: string
          source: string
          water_body_type: string
          year_ce: number
        }
        Insert: {
          attribution?: string
          created_at?: string
          geom: unknown
          id?: string
          license?: string
          model_version?: string
          period_label?: string | null
          rsl_bound?: string
          source?: string
          water_body_type?: string
          year_ce: number
        }
        Update: {
          attribution?: string
          created_at?: string
          geom?: unknown
          id?: string
          license?: string
          model_version?: string
          period_label?: string | null
          rsl_bound?: string
          source?: string
          water_body_type?: string
          year_ce?: number
        }
        Relationships: []
      }
      parish_churches: {
        Row: {
          built_from: number | null
          built_to: number | null
          coordinate_method: string | null
          created_at: string
          dating_class: string | null
          geom: unknown
          id: string
          kommun: string | null
          lan: string | null
          landskap: string | null
          lat: number
          license: string
          lng: number
          name: string
          raa_object_id: string | null
          register_url: string | null
          source: string
          verified_by: string | null
        }
        Insert: {
          built_from?: number | null
          built_to?: number | null
          coordinate_method?: string | null
          created_at?: string
          dating_class?: string | null
          geom?: unknown
          id?: string
          kommun?: string | null
          lan?: string | null
          landskap?: string | null
          lat: number
          license?: string
          lng: number
          name: string
          raa_object_id?: string | null
          register_url?: string | null
          source?: string
          verified_by?: string | null
        }
        Update: {
          built_from?: number | null
          built_to?: number | null
          coordinate_method?: string | null
          created_at?: string
          dating_class?: string | null
          geom?: unknown
          id?: string
          kommun?: string | null
          lan?: string | null
          landskap?: string | null
          lat?: number
          license?: string
          lng?: number
          name?: string
          raa_object_id?: string | null
          register_url?: string | null
          source?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      parishes: {
        Row: {
          code: string | null
          country: string | null
          created_at: string
          external_id: string | null
          hundred_external_id: string | null
          id: string
          name: string
          parish_type: string | null
          rundata_name: string | null
          rundata_parishid: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          country?: string | null
          created_at?: string
          external_id?: string | null
          hundred_external_id?: string | null
          id?: string
          name: string
          parish_type?: string | null
          rundata_name?: string | null
          rundata_parishid?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          country?: string | null
          created_at?: string
          external_id?: string | null
          hundred_external_id?: string | null
          id?: string
          name?: string
          parish_type?: string | null
          rundata_name?: string | null
          rundata_parishid?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      picture_stone_reuse: {
        Row: {
          christian_site_id: string | null
          confidence: string | null
          created_at: string | null
          geom: unknown
          id: string
          interpretation: string[] | null
          is_gotland: boolean | null
          lamm_nylen_no: string | null
          lat: number | null
          lindqvist_period: string | null
          lng: number | null
          motif: string | null
          notes: string | null
          parish: string | null
          period_label: string | null
          reuse_context: string | null
          source: string | null
          stone_name: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          christian_site_id?: string | null
          confidence?: string | null
          created_at?: string | null
          geom?: unknown
          id?: string
          interpretation?: string[] | null
          is_gotland?: boolean | null
          lamm_nylen_no?: string | null
          lat?: number | null
          lindqvist_period?: string | null
          lng?: number | null
          motif?: string | null
          notes?: string | null
          parish?: string | null
          period_label?: string | null
          reuse_context?: string | null
          source?: string | null
          stone_name: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          christian_site_id?: string | null
          confidence?: string | null
          created_at?: string | null
          geom?: unknown
          id?: string
          interpretation?: string[] | null
          is_gotland?: boolean | null
          lamm_nylen_no?: string | null
          lat?: number | null
          lindqvist_period?: string | null
          lng?: number | null
          motif?: string | null
          notes?: string | null
          parish?: string | null
          period_label?: string | null
          reuse_context?: string | null
          source?: string | null
          stone_name?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "picture_stone_reuse_christian_site_id_fkey"
            columns: ["christian_site_id"]
            isOneToOne: false
            referencedRelation: "christian_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      place_name_attestations: {
        Row: {
          attested_form: string
          created_at: string
          id: string
          note: string | null
          place_label: string
          place_name_id: string | null
          source: string
          year: number
        }
        Insert: {
          attested_form: string
          created_at?: string
          id?: string
          note?: string | null
          place_label: string
          place_name_id?: string | null
          source: string
          year: number
        }
        Update: {
          attested_form?: string
          created_at?: string
          id?: string
          note?: string | null
          place_label?: string
          place_name_id?: string | null
          source?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_name_attestations_place_name_id_fkey"
            columns: ["place_name_id"]
            isOneToOne: false
            referencedRelation: "place_names"
            referencedColumns: ["id"]
          },
        ]
      }
      place_name_forms: {
        Row: {
          attested_form: string
          attested_year: number | null
          created_at: string | null
          dialect_note: string | null
          external_ref: string | null
          form_kind: string | null
          framework: string | null
          id: string
          language_layer: string | null
          place_id: string | null
          place_name: string
          source: string
          verified: boolean
          year_precision: string | null
        }
        Insert: {
          attested_form: string
          attested_year?: number | null
          created_at?: string | null
          dialect_note?: string | null
          external_ref?: string | null
          form_kind?: string | null
          framework?: string | null
          id?: string
          language_layer?: string | null
          place_id?: string | null
          place_name: string
          source: string
          verified?: boolean
          year_precision?: string | null
        }
        Update: {
          attested_form?: string
          attested_year?: number | null
          created_at?: string | null
          dialect_note?: string | null
          external_ref?: string | null
          form_kind?: string | null
          framework?: string | null
          id?: string
          language_layer?: string | null
          place_id?: string | null
          place_name?: string
          source?: string
          verified?: boolean
          year_precision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_name_forms_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "kalmar_place_names"
            referencedColumns: ["id"]
          },
        ]
      }
      place_names: {
        Row: {
          attestation_source: string | null
          attested_form: string | null
          attribution: string | null
          created_at: string
          earliest_attestation_year: number | null
          element_category: string | null
          element_keys: string[]
          external_id: string | null
          feature_type: string | null
          geom: unknown
          id: string
          imported_at: string
          lat: number
          lng: number
          name: string
          parish_id: string | null
          province: string | null
          source: string
          source_license: string
          updated_at: string
        }
        Insert: {
          attestation_source?: string | null
          attested_form?: string | null
          attribution?: string | null
          created_at?: string
          earliest_attestation_year?: number | null
          element_category?: string | null
          element_keys?: string[]
          external_id?: string | null
          feature_type?: string | null
          geom?: unknown
          id?: string
          imported_at?: string
          lat: number
          lng: number
          name: string
          parish_id?: string | null
          province?: string | null
          source?: string
          source_license?: string
          updated_at?: string
        }
        Update: {
          attestation_source?: string | null
          attested_form?: string | null
          attribution?: string | null
          created_at?: string
          earliest_attestation_year?: number | null
          element_category?: string | null
          element_keys?: string[]
          external_id?: string | null
          feature_type?: string | null
          geom?: unknown
          id?: string
          imported_at?: string
          lat?: number
          lng?: number
          name?: string
          parish_id?: string | null
          province?: string | null
          source?: string
          source_license?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_names_parish_id_fkey"
            columns: ["parish_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
        ]
      }
      place_parish_links: {
        Row: {
          created_at: string
          id: string
          is_current: boolean
          parish_external_id: string
          place_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean
          parish_external_id: string
          place_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean
          parish_external_id?: string
          place_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_place"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["placeid"]
          },
        ]
      }
      places: {
        Row: {
          created_at: string | null
          place: string
          placeid: string
          toraid: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          place: string
          placeid?: string
          toraid?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          place?: string
          placeid?: string
          toraid?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      qpadm_analysis: {
        Row: {
          analysis_date: string | null
          analysis_type: string | null
          ancestry_proportions: Json | null
          block_jackknife_size: string | null
          created_at: string | null
          id: string
          individual_id: string | null
          notes: string | null
          p_value: number | null
          plausible: boolean | null
          sources: Json | null
        }
        Insert: {
          analysis_date?: string | null
          analysis_type?: string | null
          ancestry_proportions?: Json | null
          block_jackknife_size?: string | null
          created_at?: string | null
          id?: string
          individual_id?: string | null
          notes?: string | null
          p_value?: number | null
          plausible?: boolean | null
          sources?: Json | null
        }
        Update: {
          analysis_date?: string | null
          analysis_type?: string | null
          ancestry_proportions?: Json | null
          block_jackknife_size?: string | null
          created_at?: string | null
          id?: string
          individual_id?: string | null
          notes?: string | null
          p_value?: number | null
          plausible?: boolean | null
          sources?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "qpadm_analysis_individual_id_fkey"
            columns: ["individual_id"]
            isOneToOne: false
            referencedRelation: "genetic_individuals"
            referencedColumns: ["id"]
          },
        ]
      }
      radiocarbon_dates: {
        Row: {
          cal_from: number | null
          cal_sigma: string | null
          cal_to: number | null
          calibration: string | null
          context: string | null
          created_at: string | null
          id: string
          lab_code: string | null
          material: string | null
          note: string | null
          object_id: string | null
          object_type: string | null
          site_name: string | null
          source: string | null
          target_event: string | null
          uncal_bp: number | null
          uncal_sd: number | null
        }
        Insert: {
          cal_from?: number | null
          cal_sigma?: string | null
          cal_to?: number | null
          calibration?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          lab_code?: string | null
          material?: string | null
          note?: string | null
          object_id?: string | null
          object_type?: string | null
          site_name?: string | null
          source?: string | null
          target_event?: string | null
          uncal_bp?: number | null
          uncal_sd?: number | null
        }
        Update: {
          cal_from?: number | null
          cal_sigma?: string | null
          cal_to?: number | null
          calibration?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          lab_code?: string | null
          material?: string | null
          note?: string | null
          object_id?: string | null
          object_type?: string | null
          site_name?: string | null
          source?: string | null
          target_event?: string | null
          uncal_bp?: number | null
          uncal_sd?: number | null
        }
        Relationships: []
      }
      reading_source: {
        Row: {
          created_at: string
          id: string
          reading_id: string
          sourceid: string
        }
        Insert: {
          created_at?: string
          id?: string
          reading_id: string
          sourceid: string
        }
        Update: {
          created_at?: string
          id?: string
          reading_id?: string
          sourceid?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_source_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "readings"
            referencedColumns: ["id"]
          },
        ]
      }
      readings: {
        Row: {
          created_at: string
          id: string
          inscription_id: string
          reading_type: string
          rundata_readingid: string | null
          tei_text: string | null
          text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inscription_id: string
          reading_type?: string
          rundata_readingid?: string | null
          tei_text?: string | null
          text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inscription_id?: string
          reading_type?: string
          rundata_readingid?: string | null
          tei_text?: string | null
          text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_readings_inscription"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_readings_inscription"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_readings_inscription"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_populations: {
        Row: {
          ancestry_group: string | null
          created_at: string | null
          data_source: string | null
          description: string | null
          id: string
          population_name: string
          region: string | null
          sample_size: number | null
        }
        Insert: {
          ancestry_group?: string | null
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          id?: string
          population_name: string
          region?: string | null
          sample_size?: number | null
        }
        Update: {
          ancestry_group?: string | null
          created_at?: string | null
          data_source?: string | null
          description?: string | null
          id?: string
          population_name?: string
          region?: string | null
          sample_size?: number | null
        }
        Relationships: []
      }
      reference_uri: {
        Row: {
          created_at: string
          reference_id: string
          uri_id: string
        }
        Insert: {
          created_at?: string
          reference_id: string
          uri_id: string
        }
        Update: {
          created_at?: string
          reference_id?: string
          uri_id?: string
        }
        Relationships: []
      }
      rel_predicates: {
        Row: {
          code: string
          description: string | null
          label_en: string
          label_sv: string
          object_type: string
          qualifier_schema: Json | null
          subject_type: string
        }
        Insert: {
          code: string
          description?: string | null
          label_en: string
          label_sv: string
          object_type: string
          qualifier_schema?: Json | null
          subject_type: string
        }
        Update: {
          code?: string
          description?: string | null
          label_en?: string
          label_sv?: string
          object_type?: string
          qualifier_schema?: Json | null
          subject_type?: string
        }
        Relationships: []
      }
      relationship: {
        Row: {
          confidence: string | null
          created_at: string
          created_by: string | null
          id: string
          object_id: string
          predicate: string
          qualifiers: Json | null
          source_ref: string | null
          subject_id: string
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          object_id: string
          predicate: string
          qualifiers?: Json | null
          source_ref?: string | null
          subject_id: string
        }
        Update: {
          confidence?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          object_id?: string
          predicate?: string
          qualifiers?: Json | null
          source_ref?: string | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_predicate_fkey"
            columns: ["predicate"]
            isOneToOne: false
            referencedRelation: "rel_predicates"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "relationship_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      research_datasets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          license: string | null
          provenance: Json | null
          scholar_id: string | null
          source_citation: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          license?: string | null
          provenance?: Json | null
          scholar_id?: string | null
          source_citation?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          license?: string | null
          provenance?: Json | null
          scholar_id?: string | null
          source_citation?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_datasets_scholar_id_fkey"
            columns: ["scholar_id"]
            isOneToOne: false
            referencedRelation: "research_scholars"
            referencedColumns: ["id"]
          },
        ]
      }
      research_notes: {
        Row: {
          academic_references: Json | null
          content: string
          created_at: string | null
          id: string
          inscription_id: string | null
          is_public: boolean | null
          is_verified: boolean | null
          methodology: string | null
          note_type: string
          peer_reviewed: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          academic_references?: Json | null
          content: string
          created_at?: string | null
          id?: string
          inscription_id?: string | null
          is_public?: boolean | null
          is_verified?: boolean | null
          methodology?: string | null
          note_type: string
          peer_reviewed?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          academic_references?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          inscription_id?: string | null
          is_public?: boolean | null
          is_verified?: boolean | null
          methodology?: string | null
          note_type?: string
          peer_reviewed?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_notes_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_notes_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_notes_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      research_projects: {
        Row: {
          body: string | null
          created_at: string
          id: string
          owner: string | null
          region: string | null
          slug: string
          source: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          owner?: string | null
          region?: string | null
          slug: string
          source?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          owner?: string | null
          region?: string | null
          slug?: string
          source?: string | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      research_scholar_links: {
        Row: {
          created_at: string | null
          from_scholar: string | null
          id: string
          note: string | null
          relation: string | null
          source: string | null
          to_scholar: string | null
          to_scholar_name: string | null
        }
        Insert: {
          created_at?: string | null
          from_scholar?: string | null
          id?: string
          note?: string | null
          relation?: string | null
          source?: string | null
          to_scholar?: string | null
          to_scholar_name?: string | null
        }
        Update: {
          created_at?: string | null
          from_scholar?: string | null
          id?: string
          note?: string | null
          relation?: string | null
          source?: string | null
          to_scholar?: string | null
          to_scholar_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_scholar_links_from_scholar_fkey"
            columns: ["from_scholar"]
            isOneToOne: false
            referencedRelation: "research_scholars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_scholar_links_to_scholar_fkey"
            columns: ["to_scholar"]
            isOneToOne: false
            referencedRelation: "research_scholars"
            referencedColumns: ["id"]
          },
        ]
      }
      research_scholars: {
        Row: {
          active_period: string | null
          affiliation: string | null
          biography: string | null
          created_at: string | null
          external_ref: string | null
          id: string
          life_status: string | null
          name: string
          role_title: string | null
          source: string | null
        }
        Insert: {
          active_period?: string | null
          affiliation?: string | null
          biography?: string | null
          created_at?: string | null
          external_ref?: string | null
          id?: string
          life_status?: string | null
          name: string
          role_title?: string | null
          source?: string | null
        }
        Update: {
          active_period?: string | null
          affiliation?: string | null
          biography?: string | null
          created_at?: string | null
          external_ref?: string | null
          id?: string
          life_status?: string | null
          name?: string
          role_title?: string | null
          source?: string | null
        }
        Relationships: []
      }
      researcher_profiles: {
        Row: {
          bio: string | null
          can_verify_notes: boolean | null
          created_at: string | null
          credentials: string | null
          display_name: string
          field_of_expertise: string | null
          id: string
          institution: string | null
          orcid_id: string | null
          updated_at: string | null
          user_id: string | null
          verification_level: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          can_verify_notes?: boolean | null
          created_at?: string | null
          credentials?: string | null
          display_name: string
          field_of_expertise?: string | null
          id?: string
          institution?: string | null
          orcid_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          can_verify_notes?: boolean | null
          created_at?: string | null
          credentials?: string | null
          display_name?: string
          field_of_expertise?: string | null
          id?: string
          institution?: string | null
          orcid_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_level?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      river_coordinates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_portage: boolean
          is_trading_post: boolean
          latitude: number
          longitude: number
          name: string | null
          name_en: string | null
          river_system_id: string
          sequence_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_portage?: boolean
          is_trading_post?: boolean
          latitude: number
          longitude: number
          name?: string | null
          name_en?: string | null
          river_system_id: string
          sequence_order: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_portage?: boolean
          is_trading_post?: boolean
          latitude?: number
          longitude?: number
          name?: string | null
          name_en?: string | null
          river_system_id?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "river_coordinates_river_system_id_fkey"
            columns: ["river_system_id"]
            isOneToOne: false
            referencedRelation: "river_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      river_systems: {
        Row: {
          color: string
          created_at: string
          description: string | null
          historical_significance: string | null
          id: string
          importance: string | null
          name: string
          name_en: string
          period: string
          significance: string | null
          total_length_km: number | null
          type: string | null
          updated_at: string
          width: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          historical_significance?: string | null
          id?: string
          importance?: string | null
          name: string
          name_en: string
          period?: string
          significance?: string | null
          total_length_km?: number | null
          type?: string | null
          updated_at?: string
          width?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          historical_significance?: string | null
          id?: string
          importance?: string | null
          name?: string
          name_en?: string
          period?: string
          significance?: string | null
          total_length_km?: number | null
          type?: string | null
          updated_at?: string
          width?: number
        }
        Relationships: []
      }
      road_landmarks: {
        Row: {
          coordinates: unknown
          created_at: string | null
          description: string | null
          description_en: string | null
          historical_significance: string | null
          id: string
          landmark_type: string
          name: string
          name_en: string | null
          road_id: string | null
          updated_at: string | null
        }
        Insert: {
          coordinates: unknown
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          historical_significance?: string | null
          id?: string
          landmark_type: string
          name: string
          name_en?: string | null
          road_id?: string | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          historical_significance?: string | null
          id?: string
          landmark_type?: string
          name?: string
          name_en?: string | null
          road_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_road_landmarks_road_id"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "viking_roads"
            referencedColumns: ["id"]
          },
        ]
      }
      road_waypoints: {
        Row: {
          coordinates: unknown
          created_at: string | null
          description: string | null
          id: string
          name: string | null
          road_id: string
          waypoint_order: number
          waypoint_type: string | null
        }
        Insert: {
          coordinates: unknown
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          road_id: string
          waypoint_order: number
          waypoint_type?: string | null
        }
        Update: {
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          road_id?: string
          waypoint_order?: number
          waypoint_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_road_waypoints_road_id"
            columns: ["road_id"]
            isOneToOne: false
            referencedRelation: "viking_roads"
            referencedColumns: ["id"]
          },
        ]
      }
      rock_art_dating: {
        Row: {
          confidence: string | null
          created_at: string | null
          date_basis: string | null
          date_from: number | null
          date_to: number | null
          evidence_refs: string[] | null
          heritage_source_uri: string | null
          id: string
          note: string | null
          site_name: string | null
          sources: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          date_basis?: string | null
          date_from?: number | null
          date_to?: number | null
          evidence_refs?: string[] | null
          heritage_source_uri?: string | null
          id?: string
          note?: string | null
          site_name?: string | null
          sources?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          date_basis?: string | null
          date_from?: number | null
          date_to?: number | null
          evidence_refs?: string[] | null
          heritage_source_uri?: string | null
          id?: string
          note?: string | null
          site_name?: string | null
          sources?: string | null
        }
        Relationships: []
      }
      royal_dynasties: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          name_en: string
          period_end: number | null
          period_start: number | null
          region: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_en: string
          period_end?: number | null
          period_start?: number | null
          region: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_en?: string
          period_end?: number | null
          period_start?: number | null
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      royal_relations: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          king_a_id: string | null
          king_b_id: string | null
          period: string | null
          person_a: string
          person_b: string
          relation_type: string
          source: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          king_a_id?: string | null
          king_b_id?: string | null
          period?: string | null
          person_a: string
          person_b: string
          relation_type: string
          source?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          king_a_id?: string | null
          king_b_id?: string | null
          period?: string | null
          person_a?: string
          person_b?: string
          relation_type?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royal_relations_king_a_id_fkey"
            columns: ["king_a_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royal_relations_king_b_id_fkey"
            columns: ["king_b_id"]
            isOneToOne: false
            referencedRelation: "historical_kings"
            referencedColumns: ["id"]
          },
        ]
      }
      runbleck_analysis: {
        Row: {
          charm_type: string | null
          created_at: string
          deposit_context: string | null
          folded: boolean | null
          id: string
          inscription_id: string
          is_borderline: boolean
          material: string | null
          note: string | null
          preservation: string | null
          reading_state: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          charm_type?: string | null
          created_at?: string
          deposit_context?: string | null
          folded?: boolean | null
          id?: string
          inscription_id: string
          is_borderline?: boolean
          material?: string | null
          note?: string | null
          preservation?: string | null
          reading_state?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          charm_type?: string | null
          created_at?: string
          deposit_context?: string | null
          folded?: boolean | null
          id?: string
          inscription_id?: string
          is_borderline?: boolean
          material?: string | null
          note?: string | null
          preservation?: string | null
          reading_state?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runbleck_analysis_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: true
            referencedRelation: "runic_inscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runbleck_analysis_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: true
            referencedRelation: "runic_with_coordinates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runbleck_analysis_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: true
            referencedRelation: "v_parish_unresolved"
            referencedColumns: ["id"]
          },
        ]
      }
      rundata_artefacts: {
        Row: {
          artefact_name: string
          artefactid: string
          category_mapping: string | null
          created_at: string | null
          id: string
          language: string
        }
        Insert: {
          artefact_name: string
          artefactid?: string
          category_mapping?: string | null
          created_at?: string | null
          id?: string
          language?: string
        }
        Update: {
          artefact_name?: string
          artefactid?: string
          category_mapping?: string | null
          created_at?: string | null
          id?: string
          language?: string
        }
        Relationships: []
      }
      runic_inscriptions: {
        Row: {
          also_known_as: string[] | null
          alternative_signum: string[] | null
          bibliography: Json | null
          carver: string | null
          carver_attribution: string | null
          christian_invocation: string | null
          complexity_level: string | null
          condition: string | null
          condition_notes: string | null
          coord_confidence: string | null
          coord_source: string | null
          coordinates: unknown
          country: string | null
          county: string | null
          created_at: string | null
          cross_count: number | null
          cross_forms: string | null
          cross_source: string | null
          cultural_classification: string | null
          current_location: string | null
          data_source: string | null
          dating_confidence: number | null
          dating_source_numeric: string | null
          dating_taq: number | null
          dating_text: string | null
          dating_tpq: number | null
          dimensions: string | null
          embedding: string | null
          fmis_id: number | null
          harad: string | null
          has_cross: boolean
          has_latin: boolean
          historical_context: string | null
          id: string
          inscription_group: string | null
          interpretation_confidence: string | null
          is_primary_signum_verified: boolean | null
          k_samsok_uri: string | null
          lamningsnumber: string | null
          landscape: string | null
          latin_note: string | null
          location: string | null
          material: string | null
          meter: string | null
          municipality: string | null
          name: string | null
          name_en: string | null
          name_source: string | null
          normalization: string | null
          object_category: string | null
          object_type: string | null
          paleographic_notes: string | null
          parish: string | null
          parish_id: string | null
          parish_match_method: string | null
          parish_match_score: number | null
          period_end: number | null
          period_start: number | null
          primary_signum: string | null
          province: string | null
          raa_number: string | null
          rundata_image_url: string | null
          rundata_objectid: string | null
          rundata_signum: string | null
          rune_type: string | null
          rune_variant: string | null
          scholarly_notes: string | null
          signum: string
          socken: string | null
          style_group: string | null
          text_segments: Json | null
          translation_en: string | null
          translation_sv: string | null
          transliteration: string | null
          uncertainty_level: string | null
          updated_at: string | null
        }
        Insert: {
          also_known_as?: string[] | null
          alternative_signum?: string[] | null
          bibliography?: Json | null
          carver?: string | null
          carver_attribution?: string | null
          christian_invocation?: string | null
          complexity_level?: string | null
          condition?: string | null
          condition_notes?: string | null
          coord_confidence?: string | null
          coord_source?: string | null
          coordinates?: unknown
          country?: string | null
          county?: string | null
          created_at?: string | null
          cross_count?: number | null
          cross_forms?: string | null
          cross_source?: string | null
          cultural_classification?: string | null
          current_location?: string | null
          data_source?: string | null
          dating_confidence?: number | null
          dating_source_numeric?: string | null
          dating_taq?: number | null
          dating_text?: string | null
          dating_tpq?: number | null
          dimensions?: string | null
          embedding?: string | null
          fmis_id?: number | null
          harad?: string | null
          has_cross?: boolean
          has_latin?: boolean
          historical_context?: string | null
          id?: string
          inscription_group?: string | null
          interpretation_confidence?: string | null
          is_primary_signum_verified?: boolean | null
          k_samsok_uri?: string | null
          lamningsnumber?: string | null
          landscape?: string | null
          latin_note?: string | null
          location?: string | null
          material?: string | null
          meter?: string | null
          municipality?: string | null
          name?: string | null
          name_en?: string | null
          name_source?: string | null
          normalization?: string | null
          object_category?: string | null
          object_type?: string | null
          paleographic_notes?: string | null
          parish?: string | null
          parish_id?: string | null
          parish_match_method?: string | null
          parish_match_score?: number | null
          period_end?: number | null
          period_start?: number | null
          primary_signum?: string | null
          province?: string | null
          raa_number?: string | null
          rundata_image_url?: string | null
          rundata_objectid?: string | null
          rundata_signum?: string | null
          rune_type?: string | null
          rune_variant?: string | null
          scholarly_notes?: string | null
          signum: string
          socken?: string | null
          style_group?: string | null
          text_segments?: Json | null
          translation_en?: string | null
          translation_sv?: string | null
          transliteration?: string | null
          uncertainty_level?: string | null
          updated_at?: string | null
        }
        Update: {
          also_known_as?: string[] | null
          alternative_signum?: string[] | null
          bibliography?: Json | null
          carver?: string | null
          carver_attribution?: string | null
          christian_invocation?: string | null
          complexity_level?: string | null
          condition?: string | null
          condition_notes?: string | null
          coord_confidence?: string | null
          coord_source?: string | null
          coordinates?: unknown
          country?: string | null
          county?: string | null
          created_at?: string | null
          cross_count?: number | null
          cross_forms?: string | null
          cross_source?: string | null
          cultural_classification?: string | null
          current_location?: string | null
          data_source?: string | null
          dating_confidence?: number | null
          dating_source_numeric?: string | null
          dating_taq?: number | null
          dating_text?: string | null
          dating_tpq?: number | null
          dimensions?: string | null
          embedding?: string | null
          fmis_id?: number | null
          harad?: string | null
          has_cross?: boolean
          has_latin?: boolean
          historical_context?: string | null
          id?: string
          inscription_group?: string | null
          interpretation_confidence?: string | null
          is_primary_signum_verified?: boolean | null
          k_samsok_uri?: string | null
          lamningsnumber?: string | null
          landscape?: string | null
          latin_note?: string | null
          location?: string | null
          material?: string | null
          meter?: string | null
          municipality?: string | null
          name?: string | null
          name_en?: string | null
          name_source?: string | null
          normalization?: string | null
          object_category?: string | null
          object_type?: string | null
          paleographic_notes?: string | null
          parish?: string | null
          parish_id?: string | null
          parish_match_method?: string | null
          parish_match_score?: number | null
          period_end?: number | null
          period_start?: number | null
          primary_signum?: string | null
          province?: string | null
          raa_number?: string | null
          rundata_image_url?: string | null
          rundata_objectid?: string | null
          rundata_signum?: string | null
          rune_type?: string | null
          rune_variant?: string | null
          scholarly_notes?: string | null
          signum?: string
          socken?: string | null
          style_group?: string | null
          text_segments?: Json | null
          translation_en?: string | null
          translation_sv?: string | null
          transliteration?: string | null
          uncertainty_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "runic_inscriptions_parish_id_fkey"
            columns: ["parish_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
        ]
      }
      saints: {
        Row: {
          code: string
          cult_era: string | null
          feast_day: string | null
          gender: string | null
          is_native_nordic: boolean | null
          lived_from: number | null
          lived_to: number | null
          name: string
          name_en: string | null
          patron_of: string | null
          region_significance: string | null
          saint_type: string | null
          source: string | null
          variants: string[] | null
        }
        Insert: {
          code: string
          cult_era?: string | null
          feast_day?: string | null
          gender?: string | null
          is_native_nordic?: boolean | null
          lived_from?: number | null
          lived_to?: number | null
          name: string
          name_en?: string | null
          patron_of?: string | null
          region_significance?: string | null
          saint_type?: string | null
          source?: string | null
          variants?: string[] | null
        }
        Update: {
          code?: string
          cult_era?: string | null
          feast_day?: string | null
          gender?: string | null
          is_native_nordic?: boolean | null
          lived_from?: number | null
          lived_to?: number | null
          name?: string
          name_en?: string | null
          patron_of?: string | null
          region_significance?: string | null
          saint_type?: string | null
          source?: string | null
          variants?: string[] | null
        }
        Relationships: []
      }
      scientific_references: {
        Row: {
          authors: string
          container: string | null
          created_at: string | null
          doi: string | null
          id: string
          license: string | null
          note: string | null
          pages: string | null
          title: string | null
          url: string | null
          volume: string | null
          year: number | null
        }
        Insert: {
          authors: string
          container?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          license?: string | null
          note?: string | null
          pages?: string | null
          title?: string | null
          url?: string | null
          volume?: string | null
          year?: number | null
        }
        Update: {
          authors?: string
          container?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          license?: string | null
          note?: string | null
          pages?: string | null
          title?: string | null
          url?: string | null
          volume?: string | null
          year?: number | null
        }
        Relationships: []
      }
      search_document: {
        Row: {
          body_en: string | null
          body_simple: string | null
          body_sv: string | null
          embedding: string | null
          embedding_model: string | null
          entity_id: string
          entity_type: string
          label: string
          signum: string | null
          signum_norm: string | null
          sublabel: string | null
          tsv_en: unknown
          tsv_simple: unknown
          tsv_sv: unknown
          updated_at: string
        }
        Insert: {
          body_en?: string | null
          body_simple?: string | null
          body_sv?: string | null
          embedding?: string | null
          embedding_model?: string | null
          entity_id: string
          entity_type: string
          label: string
          signum?: string | null
          signum_norm?: string | null
          sublabel?: string | null
          tsv_en?: unknown
          tsv_simple?: unknown
          tsv_sv?: unknown
          updated_at?: string
        }
        Update: {
          body_en?: string | null
          body_simple?: string | null
          body_sv?: string | null
          embedding?: string | null
          embedding_model?: string | null
          entity_id?: string
          entity_type?: string
          label?: string
          signum?: string | null
          signum_norm?: string | null
          sublabel?: string | null
          tsv_en?: unknown
          tsv_simple?: unknown
          tsv_sv?: unknown
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          ip_address: unknown
          new_role: Database["public"]["Enums"]["app_role"] | null
          old_role: Database["public"]["Enums"]["app_role"] | null
          success: boolean
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          success?: boolean
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          success?: boolean
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      signum_inscription_links: {
        Row: {
          canonical: boolean
          created_at: string
          inscription_external_id: string
          signum_external_id: string
          updated_at: string
        }
        Insert: {
          canonical: boolean
          created_at?: string
          inscription_external_id: string
          signum_external_id: string
          updated_at?: string
        }
        Update: {
          canonical?: boolean
          created_at?: string
          inscription_external_id?: string
          signum_external_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_geochemistry: {
        Row: {
          created_at: string | null
          df: number | null
          east_mass_pct: number | null
          element: string
          higher_in: string | null
          hillfort_id: string | null
          id: string
          interpretation: string | null
          method: string | null
          mid_mass_pct: number | null
          n_east: number | null
          n_mid: number | null
          p_value: number | null
          significant: boolean | null
          site_name: string | null
          source: string | null
          t_value: number | null
        }
        Insert: {
          created_at?: string | null
          df?: number | null
          east_mass_pct?: number | null
          element: string
          higher_in?: string | null
          hillfort_id?: string | null
          id?: string
          interpretation?: string | null
          method?: string | null
          mid_mass_pct?: number | null
          n_east?: number | null
          n_mid?: number | null
          p_value?: number | null
          significant?: boolean | null
          site_name?: string | null
          source?: string | null
          t_value?: number | null
        }
        Update: {
          created_at?: string | null
          df?: number | null
          east_mass_pct?: number | null
          element?: string
          higher_in?: string | null
          hillfort_id?: string | null
          id?: string
          interpretation?: string | null
          method?: string | null
          mid_mass_pct?: number | null
          n_east?: number | null
          n_mid?: number | null
          p_value?: number | null
          significant?: boolean | null
          site_name?: string | null
          source?: string | null
          t_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_geochemistry_hillfort_id_fkey"
            columns: ["hillfort_id"]
            isOneToOne: false
            referencedRelation: "swedish_hillforts"
            referencedColumns: ["id"]
          },
        ]
      }
      solidi: {
        Row: {
          cat_no: number | null
          coordinates: unknown
          county: string | null
          created_at: string | null
          die_link_context: string | null
          die_link_sides: string | null
          find_place: string | null
          id: string
          issued_from: number | null
          issued_to: number | null
          mint: string | null
          museum_inv: string | null
          parish: string | null
          ric_ref: string | null
          ruler: string | null
          source: string | null
          weight_g: number | null
        }
        Insert: {
          cat_no?: number | null
          coordinates?: unknown
          county?: string | null
          created_at?: string | null
          die_link_context?: string | null
          die_link_sides?: string | null
          find_place?: string | null
          id?: string
          issued_from?: number | null
          issued_to?: number | null
          mint?: string | null
          museum_inv?: string | null
          parish?: string | null
          ric_ref?: string | null
          ruler?: string | null
          source?: string | null
          weight_g?: number | null
        }
        Update: {
          cat_no?: number | null
          coordinates?: unknown
          county?: string | null
          created_at?: string | null
          die_link_context?: string | null
          die_link_sides?: string | null
          find_place?: string | null
          id?: string
          issued_from?: number | null
          issued_to?: number | null
          mint?: string | null
          museum_inv?: string | null
          parish?: string | null
          ric_ref?: string | null
          ruler?: string | null
          source?: string | null
          weight_g?: number | null
        }
        Relationships: []
      }
      source_texts: {
        Row: {
          created_at: string
          en_source: string | null
          fts: unknown
          id: string
          norse_source: string | null
          original_norse: string | null
          source_id: string
          stanza_no: number | null
          sv_source: string | null
          translation_en: string | null
          translation_sv: string | null
        }
        Insert: {
          created_at?: string
          en_source?: string | null
          fts?: unknown
          id?: string
          norse_source?: string | null
          original_norse?: string | null
          source_id: string
          stanza_no?: number | null
          sv_source?: string | null
          translation_en?: string | null
          translation_sv?: string | null
        }
        Update: {
          created_at?: string
          en_source?: string | null
          fts?: unknown
          id?: string
          norse_source?: string | null
          original_norse?: string | null
          source_id?: string
          stanza_no?: number | null
          sv_source?: string | null
          translation_en?: string | null
          translation_sv?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_texts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          author: string | null
          created_at: string
          isbn: string | null
          notes: string | null
          publication_year: number | null
          publisher: string | null
          source_type: string | null
          sourceid: string
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          isbn?: string | null
          notes?: string | null
          publication_year?: number | null
          publisher?: string | null
          source_type?: string | null
          sourceid: string
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          isbn?: string | null
          notes?: string | null
          publication_year?: number | null
          publisher?: string | null
          source_type?: string | null
          sourceid?: string
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      species_introductions: {
        Row: {
          category: string | null
          confidence: string
          created_at: string
          date_from: number | null
          date_text: string | null
          date_to: number | null
          entity: string
          geo_precision: string | null
          geom: unknown
          id: string
          landscape: string | null
          lat: number | null
          lng: number | null
          note: string | null
          proxy_type: string
          region: string | null
          site_name: string | null
          source: string
          uncertainty: string | null
        }
        Insert: {
          category?: string | null
          confidence?: string
          created_at?: string
          date_from?: number | null
          date_text?: string | null
          date_to?: number | null
          entity: string
          geo_precision?: string | null
          geom?: unknown
          id?: string
          landscape?: string | null
          lat?: number | null
          lng?: number | null
          note?: string | null
          proxy_type: string
          region?: string | null
          site_name?: string | null
          source: string
          uncertainty?: string | null
        }
        Update: {
          category?: string | null
          confidence?: string
          created_at?: string
          date_from?: number | null
          date_text?: string | null
          date_to?: number | null
          entity?: string
          geo_precision?: string | null
          geom?: unknown
          id?: string
          landscape?: string | null
          lat?: number | null
          lng?: number | null
          note?: string | null
          proxy_type?: string
          region?: string | null
          site_name?: string | null
          source?: string
          uncertainty?: string | null
        }
        Relationships: []
      }
      sr_baseline: {
        Row: {
          basis: string
          confidence: string | null
          created_at: string
          d18o_note: string | null
          geology: string | null
          geom: unknown
          id: string
          lat_wgs84: number | null
          lon_wgs84: number | null
          note: string | null
          region: string
          sample_type: string | null
          source: string | null
          sr8786_max: number | null
          sr8786_min: number | null
        }
        Insert: {
          basis: string
          confidence?: string | null
          created_at?: string
          d18o_note?: string | null
          geology?: string | null
          geom?: unknown
          id?: string
          lat_wgs84?: number | null
          lon_wgs84?: number | null
          note?: string | null
          region: string
          sample_type?: string | null
          source?: string | null
          sr8786_max?: number | null
          sr8786_min?: number | null
        }
        Update: {
          basis?: string
          confidence?: string | null
          created_at?: string
          d18o_note?: string | null
          geology?: string | null
          geom?: unknown
          id?: string
          lat_wgs84?: number | null
          lon_wgs84?: number | null
          note?: string | null
          region?: string
          sample_type?: string | null
          source?: string | null
          sr8786_max?: number | null
          sr8786_min?: number | null
        }
        Relationships: []
      }
      staging_inscriptions: {
        Row: {
          conflict_reasons: string[]
          coordinates: string | null
          created_at: string
          dating_text: string | null
          expert_notes: string | null
          id: string
          location: string | null
          object_type: string | null
          original_signum: string
          raw_data: Json
          reviewed_at: string | null
          reviewed_by: string | null
          source_database: string
          status: string
          translation_en: string | null
          transliteration: string | null
          updated_at: string
        }
        Insert: {
          conflict_reasons?: string[]
          coordinates?: string | null
          created_at?: string
          dating_text?: string | null
          expert_notes?: string | null
          id?: string
          location?: string | null
          object_type?: string | null
          original_signum: string
          raw_data?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_database: string
          status?: string
          translation_en?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Update: {
          conflict_reasons?: string[]
          coordinates?: string | null
          created_at?: string
          dating_text?: string | null
          expert_notes?: string | null
          id?: string
          location?: string | null
          object_type?: string | null
          original_signum?: string
          raw_data?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_database?: string
          status?: string
          translation_en?: string | null
          transliteration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      strandkontroll: {
        Row: {
          confidence: string | null
          created_at: string | null
          date_from: number | null
          date_to: number | null
          feature: string | null
          geom: unknown
          id: number
          kontrolltyp: string
          landhojn_mmyr: number | null
          lat_wgs84: number
          lon_wgs84: number
          namn: string
          note: string | null
          region: string | null
          rsl_obs_max: number | null
          rsl_obs_min: number | null
          source: string | null
          z_is_rsl: boolean | null
          z_min_rh2000: number | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          date_from?: number | null
          date_to?: number | null
          feature?: string | null
          geom?: unknown
          id?: number
          kontrolltyp: string
          landhojn_mmyr?: number | null
          lat_wgs84: number
          lon_wgs84: number
          namn: string
          note?: string | null
          region?: string | null
          rsl_obs_max?: number | null
          rsl_obs_min?: number | null
          source?: string | null
          z_is_rsl?: boolean | null
          z_min_rh2000?: number | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          date_from?: number | null
          date_to?: number | null
          feature?: string | null
          geom?: unknown
          id?: number
          kontrolltyp?: string
          landhojn_mmyr?: number | null
          lat_wgs84?: number
          lon_wgs84?: number
          namn?: string
          note?: string | null
          region?: string | null
          rsl_obs_max?: number | null
          rsl_obs_min?: number | null
          source?: string | null
          z_is_rsl?: boolean | null
          z_min_rh2000?: number | null
        }
        Relationships: []
      }
      strandkontroll_linje: {
        Row: {
          geom: unknown
          id: number
          mode: string | null
          namn: string
        }
        Insert: {
          geom?: unknown
          id?: number
          mode?: string | null
          namn: string
        }
        Update: {
          geom?: unknown
          id?: number
          mode?: string | null
          namn?: string
        }
        Relationships: []
      }
      swedish_hillforts: {
        Row: {
          coordinates: unknown
          country: string | null
          county: string | null
          created_at: string | null
          cultural_significance: string | null
          dating_basis: string | null
          dating_confidence: string | null
          dating_source: string | null
          description: string | null
          fortress_type: string | null
          id: string
          landscape: string
          municipality: string | null
          name: string | null
          nearby_runestones: number | null
          parish: string | null
          period: string | null
          raa_number: string | null
          source_reference: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          coordinates?: unknown
          country?: string | null
          county?: string | null
          created_at?: string | null
          cultural_significance?: string | null
          dating_basis?: string | null
          dating_confidence?: string | null
          dating_source?: string | null
          description?: string | null
          fortress_type?: string | null
          id?: string
          landscape: string
          municipality?: string | null
          name?: string | null
          nearby_runestones?: number | null
          parish?: string | null
          period?: string | null
          raa_number?: string | null
          source_reference?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: unknown
          country?: string | null
          county?: string | null
          created_at?: string | null
          cultural_significance?: string | null
          dating_basis?: string | null
          dating_confidence?: string | null
          dating_source?: string | null
          description?: string | null
          fortress_type?: string | null
          id?: string
          landscape?: string
          municipality?: string | null
          name?: string | null
          nearby_runestones?: number | null
          parish?: string | null
          period?: string | null
          raa_number?: string | null
          source_reference?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      swedish_localities: {
        Row: {
          created_at: string
          external_id: string
          fmis_id: number | null
          id: string
          kmr_id: string | null
          parish_external_id: string
          raa_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id: string
          fmis_id?: number | null
          id?: string
          kmr_id?: string | null
          parish_external_id: string
          raa_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string
          fmis_id?: number | null
          id?: string
          kmr_id?: string | null
          parish_external_id?: string
          raa_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_swedish_localities_parish"
            columns: ["parish_external_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["external_id"]
          },
        ]
      }
      themes: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          icon: string | null
          id: string
          keywords: string[] | null
          name: string
          name_en: string | null
          slug: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          keywords?: string[] | null
          name: string
          name_en?: string | null
          slug?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          keywords?: string[] | null
          name?: string
          name_en?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      thing_sites: {
        Row: {
          confidence: string | null
          created_at: string | null
          description: string | null
          evidence_type: string | null
          geom: unknown
          id: string
          jurisdiction: string | null
          landscape: string | null
          lat: number | null
          lng: number | null
          monument_type: string | null
          name: string
          period_end: number | null
          period_start: number | null
          source: string | null
          thing_type: string | null
          updated_at: string | null
          usage_note: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type?: string | null
          geom?: unknown
          id?: string
          jurisdiction?: string | null
          landscape?: string | null
          lat?: number | null
          lng?: number | null
          monument_type?: string | null
          name: string
          period_end?: number | null
          period_start?: number | null
          source?: string | null
          thing_type?: string | null
          updated_at?: string | null
          usage_note?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type?: string | null
          geom?: unknown
          id?: string
          jurisdiction?: string | null
          landscape?: string | null
          lat?: number | null
          lng?: number | null
          monument_type?: string | null
          name?: string
          period_end?: number | null
          period_start?: number | null
          source?: string | null
          thing_type?: string | null
          updated_at?: string | null
          usage_note?: string | null
        }
        Relationships: []
      }
      time_periods: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          end_year: number | null
          id: string
          name: string
          name_en: string | null
          sort_order: number | null
          start_year: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          end_year?: number | null
          id: string
          name: string
          name_en?: string | null
          sort_order?: number | null
          start_year?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          end_year?: number | null
          id?: string
          name?: string
          name_en?: string | null
          sort_order?: number | null
          start_year?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string
          inscriptionid: string
          language: string
          teitext: string | null
          text: string
          translation: string
          translationid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          inscriptionid: string
          language?: string
          teitext?: string | null
          text: string
          translation?: string
          translationid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          inscriptionid?: string
          language?: string
          teitext?: string | null
          text?: string
          translation?: string
          translationid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["language_code"]
          },
        ]
      }
      uris: {
        Row: {
          created_at: string
          updated_at: string
          uri: string
          uriid: string
        }
        Insert: {
          created_at?: string
          updated_at?: string
          uri: string
          uriid: string
        }
        Update: {
          created_at?: string
          updated_at?: string
          uri?: string
          uriid?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      valdemar_route_points: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_lotstation: boolean | null
          is_major_waypoint: boolean | null
          lat: number | null
          lng: number | null
          name: string | null
          route: string | null
          section: string | null
          seq: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          is_lotstation?: boolean | null
          is_major_waypoint?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          route?: string | null
          section?: string | null
          seq?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_lotstation?: boolean | null
          is_major_waypoint?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          route?: string | null
          section?: string | null
          seq?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      viking_cities: {
        Row: {
          category: string
          coordinates: unknown
          country: string
          created_at: string
          description: string
          historical_significance: string | null
          id: string
          name: string
          period_end: number
          period_start: number
          population_estimate: number | null
          region: string | null
          replaces: string | null
          status: string | null
          unesco_site: boolean | null
          updated_at: string
        }
        Insert: {
          category: string
          coordinates: unknown
          country: string
          created_at?: string
          description: string
          historical_significance?: string | null
          id?: string
          name: string
          period_end: number
          period_start: number
          population_estimate?: number | null
          region?: string | null
          replaces?: string | null
          status?: string | null
          unesco_site?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string
          coordinates?: unknown
          country?: string
          created_at?: string
          description?: string
          historical_significance?: string | null
          id?: string
          name?: string
          period_end?: number
          period_start?: number
          population_estimate?: number | null
          region?: string | null
          replaces?: string | null
          status?: string | null
          unesco_site?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      viking_fortresses: {
        Row: {
          archaeological_notes: string | null
          area_hectares: number | null
          construction_end: number | null
          construction_period: string | null
          construction_start: number | null
          coordinates: unknown
          country: string
          created_at: string
          description: string | null
          diameter_meters: number | null
          excavated: boolean | null
          fortress_type: string
          historical_significance: string | null
          id: string
          name: string
          raa_number: string | null
          region: string | null
          status: string | null
          unesco_site: boolean | null
          updated_at: string
        }
        Insert: {
          archaeological_notes?: string | null
          area_hectares?: number | null
          construction_end?: number | null
          construction_period?: string | null
          construction_start?: number | null
          coordinates: unknown
          country: string
          created_at?: string
          description?: string | null
          diameter_meters?: number | null
          excavated?: boolean | null
          fortress_type: string
          historical_significance?: string | null
          id?: string
          name: string
          raa_number?: string | null
          region?: string | null
          status?: string | null
          unesco_site?: boolean | null
          updated_at?: string
        }
        Update: {
          archaeological_notes?: string | null
          area_hectares?: number | null
          construction_end?: number | null
          construction_period?: string | null
          construction_start?: number | null
          coordinates?: unknown
          country?: string
          created_at?: string
          description?: string | null
          diameter_meters?: number | null
          excavated?: boolean | null
          fortress_type?: string
          historical_significance?: string | null
          id?: string
          name?: string
          raa_number?: string | null
          region?: string | null
          status?: string | null
          unesco_site?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      viking_names: {
        Row: {
          created_at: string
          etymology: string | null
          frequency: number | null
          gender: string
          historical_info: string | null
          id: string
          meaning: string
          name: string
          regions: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          etymology?: string | null
          frequency?: number | null
          gender: string
          historical_info?: string | null
          id?: string
          meaning: string
          name: string
          regions?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          etymology?: string | null
          frequency?: number | null
          gender?: string
          historical_info?: string | null
          id?: string
          meaning?: string
          name?: string
          regions?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      viking_regions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          lat: number | null
          lng: number | null
          modern_name: string | null
          timeperiod: string | null
          type: string | null
          updated_at: string | null
          viking_name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          lat?: number | null
          lng?: number | null
          modern_name?: string | null
          timeperiod?: string | null
          type?: string | null
          updated_at?: string | null
          viking_name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          modern_name?: string | null
          timeperiod?: string | null
          type?: string | null
          updated_at?: string | null
          viking_name?: string
        }
        Relationships: []
      }
      viking_roads: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          end_coordinates: unknown
          id: string
          importance_level: string | null
          name: string
          name_en: string | null
          period_end: number | null
          period_start: number | null
          road_type: string
          start_coordinates: unknown
          total_length_km: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          end_coordinates?: unknown
          id?: string
          importance_level?: string | null
          name: string
          name_en?: string | null
          period_end?: number | null
          period_start?: number | null
          road_type: string
          start_coordinates?: unknown
          total_length_km?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          end_coordinates?: unknown
          id?: string
          importance_level?: string | null
          name?: string
          name_en?: string | null
          period_end?: number | null
          period_start?: number | null
          road_type?: string
          start_coordinates?: unknown
          total_length_km?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vocabulary: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          label_en: string | null
          label_sv: string | null
          parent_code: string | null
          period_end: number | null
          period_start: number | null
          scheme: string
          source_ref: string | null
          source_uuid: string | null
          wikidata_id: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          label_en?: string | null
          label_sv?: string | null
          parent_code?: string | null
          period_end?: number | null
          period_start?: number | null
          scheme: string
          source_ref?: string | null
          source_uuid?: string | null
          wikidata_id?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          label_en?: string | null
          label_sv?: string | null
          parent_code?: string | null
          period_end?: number | null
          period_start?: number | null
          scheme?: string
          source_ref?: string | null
          source_uuid?: string | null
          wikidata_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_scheme_parent_code_fkey"
            columns: ["scheme", "parent_code"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["scheme", "code"]
          },
        ]
      }
    }
    Views: {
      carver_inscription: {
        Row: {
          attribution: Database["public"]["Enums"]["attribution_type"] | null
          carverid: string | null
          carverinscriptionid: string | null
          certainty: boolean | null
          created_at: string | null
          inscriptionid: string | null
          lang: string | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          attribution?: never
          carverid?: never
          carverinscriptionid?: never
          certainty?: never
          created_at?: string | null
          inscriptionid?: never
          lang?: never
          notes?: never
          updated_at?: string | null
        }
        Update: {
          attribution?: never
          carverid?: never
          carverinscriptionid?: never
          certainty?: never
          created_at?: string | null
          inscriptionid?: never
          lang?: never
          notes?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      king_inscription_links: {
        Row: {
          analysis_notes: string | null
          connection_type: string | null
          created_at: string | null
          evidence_strength: string | null
          id: string | null
          inscription_id: string | null
          king_id: string | null
        }
        Insert: {
          analysis_notes?: never
          connection_type?: never
          created_at?: string | null
          evidence_strength?: never
          id?: string | null
          inscription_id?: string | null
          king_id?: string | null
        }
        Update: {
          analysis_notes?: never
          connection_type?: never
          created_at?: string | null
          evidence_strength?: never
          id?: string | null
          inscription_id?: string | null
          king_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_object_id_fkey"
            columns: ["king_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_subject_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      runic_with_coordinates: {
        Row: {
          additional_latitude: number | null
          additional_longitude: number | null
          confidence: string | null
          coord_confidence: string | null
          coord_source: string | null
          coordinate_source: string | null
          coordinate_status: string | null
          coordinates_latitude: number | null
          coordinates_longitude: number | null
          country: string | null
          county: string | null
          created_at: string | null
          dating_text: string | null
          geocoding_priority: string | null
          harad: string | null
          id: string | null
          landscape: string | null
          location: string | null
          meter: string | null
          municipality: string | null
          object_type: string | null
          original_coordinates: unknown
          parish: string | null
          period_end: number | null
          period_start: number | null
          province: string | null
          signum: string | null
          socken: string | null
          translation_en: string | null
          translation_sv: string | null
          transliteration: string | null
        }
        Relationships: []
      }
      source_inscription_links: {
        Row: {
          created_at: string | null
          id: string | null
          inscription_id: string | null
          notes: string | null
          relation: string | null
          source_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          inscription_id?: string | null
          notes?: never
          relation?: never
          source_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          inscription_id?: string | null
          notes?: never
          relation?: never
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_object_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_subject_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_links: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string | null
          notes: string | null
          theme_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_object_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_subject_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entity_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      v_dating_conflicts: {
        Row: {
          anchor: string | null
          any_plateau: boolean | null
          earliest_bound: number | null
          latest_bound: number | null
          methods: string[] | null
          n_methods: number | null
          target_events: string[] | null
        }
        Relationships: []
      }
      v_dating_provenance_queue: {
        Row: {
          dating_id: string | null
          end_year: number | null
          lamning_id: string | null
          lamning_name: string | null
          method: Database["public"]["Enums"]["dating_method"] | null
          source_id: string | null
          source_uri: string | null
          start_year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_argument_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_argument_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      v_earliest_primary_evidence: {
        Row: {
          earliest_agent: string | null
          earliest_method: Database["public"]["Enums"]["obs_method"] | null
          earliest_primary_date: string | null
          earliest_source: string | null
          figure_id: string | null
          lamning_name: string | null
          local_label: string | null
          source_uri: string | null
        }
        Relationships: []
      }
      v_founding_church: {
        Row: {
          built_from: number | null
          dating_source: string | null
          kind: string | null
          landscape: string | null
          lat: number | null
          lng: number | null
          name: string | null
          parish: string | null
        }
        Relationships: []
      }
      v_kalmar_needs_geotag: {
        Row: {
          category: string | null
          coord_precision: string | null
          head_element: string | null
          lat: number | null
          lng: number | null
          name: string | null
        }
        Insert: {
          category?: string | null
          coord_precision?: string | null
          head_element?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
        }
        Update: {
          category?: string | null
          coord_precision?: string | null
          head_element?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
        }
        Relationships: []
      }
      v_kalmar_onomastic_core: {
        Row: {
          category: string | null
          element_reading: string | null
          interpretation: string | null
          name: string | null
          sol_match: string | null
          sol_note: string | null
        }
        Insert: {
          category?: string | null
          element_reading?: string | null
          interpretation?: string | null
          name?: string | null
          sol_match?: string | null
          sol_note?: string | null
        }
        Update: {
          category?: string | null
          element_reading?: string | null
          interpretation?: string | null
          name?: string | null
          sol_match?: string | null
          sol_note?: string | null
        }
        Relationships: []
      }
      v_lamning_geometry_metric: {
        Row: {
          geom_metric: unknown
          geometry_id: string | null
          horizontal_unc_m: number | null
          is_current: boolean | null
          lamning_id: string | null
          method: Database["public"]["Enums"]["position_method"] | null
          metric_srid: number | null
          recorded_at: string | null
          source_crs: string | null
          source_id: string | null
        }
        Insert: {
          geom_metric?: never
          geometry_id?: string | null
          horizontal_unc_m?: number | null
          is_current?: boolean | null
          lamning_id?: string | null
          method?: Database["public"]["Enums"]["position_method"] | null
          metric_srid?: number | null
          recorded_at?: string | null
          source_crs?: string | null
          source_id?: string | null
        }
        Update: {
          geom_metric?: never
          geometry_id?: string | null
          horizontal_unc_m?: number | null
          is_current?: boolean | null
          lamning_id?: string | null
          method?: Database["public"]["Enums"]["position_method"] | null
          metric_srid?: number | null
          recorded_at?: string | null
          source_crs?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lamning_geometry_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lamning_geometry_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      v_late_appearing_figures: {
        Row: {
          after_contaminating_event: boolean | null
          authenticity: Database["public"]["Enums"]["authenticity_state"] | null
          figure_id: string | null
          first_present_date: string | null
          first_recording_agent: string | null
          first_recording_method:
            | Database["public"]["Enums"]["obs_method"]
            | null
          lamning_id: string | null
          lamning_name: string | null
          local_label: string | null
          missed_by_n_earlier_obs: number | null
          source_uri: string | null
        }
        Relationships: [
          {
            foreignKeyName: "figure_lamning_id_fkey"
            columns: ["lamning_id"]
            isOneToOne: false
            referencedRelation: "heritage_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      v_medieval_dedications: {
        Row: {
          built_from: number | null
          church: string | null
          cult_era: string | null
          gender: string | null
          is_native_nordic: boolean | null
          landscape: string | null
          parish: string | null
          saint: string | null
          saint_code: string | null
          saint_type: string | null
        }
        Relationships: []
      }
      v_mother_church_candidate: {
        Row: {
          built_from: number | null
          dedication_era: string | null
          hundred_id: string | null
          name: string | null
          parish: string | null
          patron_saint: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecclesiastical_sites_hundred_id_fkey"
            columns: ["hundred_id"]
            isOneToOne: false
            referencedRelation: "hundreds"
            referencedColumns: ["id"]
          },
        ]
      }
      v_observation_depth: {
        Row: {
          agent: string | null
          depth: number | null
          lamning_id: string | null
          method: Database["public"]["Enums"]["obs_method"] | null
          observation_id: string | null
          root_observation: string | null
        }
        Relationships: []
      }
      v_oland_model: {
        Row: {
          kind: string | null
          lat: number | null
          lng: number | null
          name: string | null
          note: string | null
        }
        Relationships: []
      }
      v_ortnamn_hit_review: {
        Row: {
          category: string | null
          element_key: string | null
          id: string | null
          interpretation: string | null
          label: string | null
          lat: number | null
          lng: number | null
          near_node: boolean | null
          owner: string | null
          place_name: string | null
          region: string | null
          sol_note: string | null
          strength: string | null
          verdict: string | null
        }
        Relationships: []
      }
      v_parish_unresolved: {
        Row: {
          country: string | null
          harad: string | null
          id: string | null
          location: string | null
          name: string | null
          primary_signum: string | null
          signum: string | null
          socken: string | null
        }
        Insert: {
          country?: string | null
          harad?: string | null
          id?: string | null
          location?: string | null
          name?: string | null
          primary_signum?: string | null
          signum?: string | null
          socken?: string | null
        }
        Update: {
          country?: string | null
          harad?: string | null
          id?: string | null
          location?: string | null
          name?: string | null
          primary_signum?: string | null
          signum?: string | null
          socken?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      artefact_types_v1: {
        Args: never
        Returns: {
          category: string
          id: string
          inscription_count: number
          name: string
        }[]
      }
      church_nn_by_period: {
        Args: {
          p_landscape?: string
          p_maxlat?: number
          p_maxlng?: number
          p_minlat?: number
          p_minlng?: number
        }
        Returns: {
          cutoff: number
          median_km: number
          n: number
        }[]
      }
      church_nn_current: {
        Args: {
          p_landscape?: string
          p_maxlat?: number
          p_maxlng?: number
          p_minlat?: number
          p_minlng?: number
        }
        Returns: {
          median_km: number
          n: number
        }[]
      }
      church_nn_stats: {
        Args: never
        Returns: {
          mean: number
          median: number
          min_m: number
          n: number
          p90: number
          q1: number
          q3: number
        }[]
      }
      count_runbleck: { Args: never; Returns: number }
      count_runestones: { Args: never; Returns: number }
      disablelongtransactions: { Args: never; Returns: string }
      distance_stats: {
        Args: { p_baseline: string[]; p_target?: string; p_test: string[] }
        Returns: {
          grp: string
          mean: number
          median: number
          n: number
          p90: number
          q1: number
          q3: number
        }[]
      }
      distance_stats_baseline: {
        Args: never
        Returns: {
          grp: string
          max_m: number
          mean: number
          median: number
          min_m: number
          n: number
          p90: number
          q1: number
          q3: number
        }[]
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      ecclesiastical_in_bbox: {
        Args: {
          max_lat: number
          max_lng: number
          min_lat: number
          min_lng: number
          p_limit?: number
        }
        Returns: {
          built_from: number
          dating_class: string
          diocese: string
          harad: string
          id: string
          image_attribution: string
          image_url: string
          kind: string
          lat: number
          lng: number
          name: string
          socken: string
          status: string
        }[]
      }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      eriksgata_nearby:
        | { Args: { radius_m?: number }; Returns: Json }
        | {
            Args: { church_radius_m?: number; radius_m?: number }
            Returns: Json
          }
      extract_primary_signum: { Args: { signum_text: string }; Returns: string }
      features_in_shape: {
        Args: {
          p_lat: number
          p_lng: number
          radius_km: number
          shape?: string
        }
        Returns: Json
      }
      features_near_point: {
        Args: { p_lat: number; p_lng: number; radius_m?: number }
        Returns: Json
      }
      fort_at: {
        Args: { p_min_certainty?: number; p_site?: string; p_year: number }
        Returns: Json
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_artefact_inscriptions: {
        Args: { p_artefact_id: string }
        Returns: {
          id: string
          landscape: string
          name: string
          signum: string
          socken: string
          translation_sv: string
        }[]
      }
      get_carver_inscriptions: {
        Args: never
        Returns: {
          attribution: Database["public"]["Enums"]["attribution_type"]
          carverid: string
          certainty: boolean
          inscription: Json
          inscriptionid: string
          notes: string
        }[]
      }
      get_carver_statistics: {
        Args: never
        Returns: {
          attributed_count: number
          carver_name: string
          certain_count: number
          signed_count: number
          total_inscriptions: number
          uncertain_count: number
        }[]
      }
      get_entity_v1: {
        Args: { p_id?: string; p_signum?: string }
        Returns: Json
      }
      get_excursion_detail: { Args: { p_signum: string }; Returns: Json }
      get_inscription_page: { Args: { p_signum: string }; Returns: Json }
      get_paleo_shorelines_nearest: {
        Args: { p_year: number }
        Returns: {
          geojson: string
          id: string
          period_label: string
          water_body_type: string
          year_ce: number
        }[]
      }
      get_security_alerts: {
        Args: { hours_back?: number }
        Returns: {
          alert_type: string
          last_occurrence: string
          user_count: number
        }[]
      }
      get_viking_names_stats: {
        Args: never
        Returns: {
          female_names: number
          male_names: number
          total_frequency: number
          total_names: number
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      graph_neighborhood: {
        Args: { p_id: string }
        Returns: {
          direction: string
          notes: string
          other_id: string
          other_label: string
          other_type: string
          predicate: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { p_user_id: string }; Returns: boolean }
      is_admin_or_editor: { Args: never; Returns: boolean }
      is_runbleck: { Args: { p_object_type: string }; Returns: boolean }
      is_runestone: { Args: { p_object_type: string }; Returns: boolean }
      jordetal_to_penningland: {
        Args: {
          markland: number
          oresland: number
          ortugland: number
          penningland: number
        }
        Returns: number
      }
      log_security_event: {
        Args: {
          p_error_message?: string
          p_event_type: string
          p_new_role?: Database["public"]["Enums"]["app_role"]
          p_old_role?: Database["public"]["Enums"]["app_role"]
          p_success?: boolean
          p_target_user_id?: string
        }
        Returns: undefined
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      map_b_signum_to_modern: {
        Args: { old_signum: string; parish_name: string; province_name: string }
        Returns: string
      }
      match_metal_provenance: {
        Args: { p_object_id: string; p_object_type: string }
        Returns: {
          ore_metals: string[]
          ore_source_id: string
          ore_source_name: string
          systems_compared: number
          systems_matched: number
          verdict: string
        }[]
      }
      match_search_docs: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          entity_id: string
          entity_type: string
          similarity: number
        }[]
      }
      named_stones_v1: {
        Args: never
        Returns: {
          country: string
          id: string
          image_credit: string
          image_url: string
          landscape: string
          name: string
          name_source: string
          signum: string
          socken: string
          translation_en: string
          translation_sv: string
        }[]
      }
      nearby_features: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
        }
        Returns: {
          distance_km: number
          feature_id: string
          feature_type: string
          label: string
          lat: number
          lng: number
        }[]
      }
      neighbors_v1: {
        Args: { p_id: string; p_predicate?: string }
        Returns: {
          confidence: string
          direction: string
          entity_id: string
          entity_type: string
          label: string
          predicate: string
        }[]
      }
      parish_governance: { Args: { p_socken: string }; Returns: Json }
      parse_swedish_dating: {
        Args: { dating_text: string }
        Returns: {
          confidence: number
          notes: string
          parsed_period: string
          period_end: number
          period_start: number
        }[]
      }
      placename_element_counts: {
        Args: never
        Returns: {
          element_key: string
          n_curated: number
          n_osm: number
        }[]
      }
      placename_match_preview: {
        Args: {
          p_boundary?: string
          p_excludes?: string[]
          p_patterns: string[]
        }
        Returns: Json
      }
      platform_stats: { Args: never; Returns: Json }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      reach_poly: {
        Args: {
          p_lat: number
          p_lng: number
          radius_km: number
          shape?: string
        }
        Returns: unknown
      }
      rebuild_search_document: {
        Args: { p_id?: string; p_type?: string }
        Returns: undefined
      }
      runestone_stats_v1: { Args: never; Returns: Json }
      runic_theophoric_summary: { Args: never; Returns: Json }
      search_inscriptions_by_similarity: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          id: string
          signum: string
          similarity: number
          translation_en: string
          transliteration: string
        }[]
      }
      search_inscriptions_flexible: {
        Args: { p_search_term: string }
        Returns: {
          also_known_as: string[]
          alternative_signum: string[]
          bibliography: Json
          complexity_level: string
          condition_notes: string
          coordinates: unknown
          country: string
          county: string
          created_at: string
          cultural_classification: string
          current_location: string
          data_source: string
          dating_confidence: number
          dating_text: string
          dimensions: string
          embedding: string
          historical_context: string
          id: string
          inscription_group: string
          k_samsok_uri: string
          lamningsnumber: string
          landscape: string
          location: string
          material: string
          municipality: string
          name: string
          name_en: string
          normalization: string
          object_type: string
          paleographic_notes: string
          parish: string
          period_end: number
          period_start: number
          primary_signum: string
          province: string
          raa_number: string
          rundata_signum: string
          rune_type: string
          rune_variant: string
          scholarly_notes: string
          signum: string
          style_group: string
          text_segments: Json
          translation_en: string
          translation_sv: string
          transliteration: string
          uncertainty_level: string
          updated_at: string
        }[]
      }
      search_source_texts: {
        Args: { q: string }
        Returns: {
          rank: number
          snippet_en: string
          snippet_norse: string
          snippet_sv: string
          source_id: string
          stanza_no: number
          title: string
          title_en: string
        }[]
      }
      search_v1: {
        Args: { p_limit?: number; p_q: string; p_types?: string[] }
        Returns: {
          entity_id: string
          entity_type: string
          label: string
          score: number
          signum: string
          snippet: string
          sublabel: string
        }[]
      }
      search_v2: {
        Args: {
          p_embedding: string
          p_limit?: number
          p_q: string
          p_types?: string[]
        }
        Returns: {
          entity_id: string
          entity_type: string
          label: string
          score: number
          signum: string
          snippet: string
          sublabel: string
        }[]
      }
      set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user: string
        }
        Returns: undefined
      }
      shape_reach_stats: {
        Args: {
          p_baseline: string[]
          p_radius_km?: number
          p_shape?: string
          p_target?: string
          p_test: string[]
        }
        Returns: {
          grp: string
          mean_cnt: number
          median_cnt: number
          n: number
          p90_cnt: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sites_bbox_clusters: {
        Args: {
          max_lat: number
          max_lng: number
          min_lat: number
          min_lng: number
          p_types?: string[]
          p_zoom?: number
        }
        Returns: {
          cnt: number
          description: string
          id: string
          landscape: string
          lat: number
          lng: number
          municipality: string
          name: string
          parish: string
          period: string
          raa_type: string
          source_uri: string
        }[]
      }
      sites_in_bbox: {
        Args: {
          max_lat: number
          max_lng: number
          min_lat: number
          min_lng: number
          p_types?: string[]
          p_zoom?: number
        }
        Returns: {
          cnt: number
          description: string
          id: string
          is_cluster: boolean
          landscape: string
          lat: number
          lng: number
          municipality: string
          name: string
          parish: string
          period: string
          raa_type: string
          source_uri: string
        }[]
      }
      sites_near: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_m?: number
          p_types?: string[]
        }
        Returns: {
          distance_m: number
          id: string
          landscape: string
          lat: number
          lng: number
          name: string
          parish: string
          raa_type: string
        }[]
      }
      source_catalog: {
        Args: never
        Returns: {
          author: string
          collection: string
          id: string
          meter: string
          reliability: string
          stanza_count: number
          title: string
          title_en: string
          work_type: string
        }[]
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      temporal_certainty: {
        Args: { ee: number; el: number; se: number; sl: number; t: number }
        Returns: number
      }
      unlockrows: { Args: { "": string }; Returns: number }
      update_dating_periods: { Args: never; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user" | "editor"
      attribution_type:
        | "attributed"
        | "signed"
        | "similar"
        | "signed on pair stone"
      authenticity_state:
        | "unassessed"
        | "accepted"
        | "disputed"
        | "pareidolia"
        | "paint_artefact"
        | "modern_addition"
        | "forgery"
      bearer_kind:
        | "dynasty"
        | "king"
        | "person"
        | "bishopric"
        | "town"
        | "realm"
        | "province"
        | "institution"
        | "family"
      bias_type:
        | "christian_anti_pagan"
        | "nationalist_danish"
        | "nationalist_swedish"
        | "temporal_distance"
        | "political_legitimacy"
        | "none"
      context_state:
        | "open_bedrock"
        | "sealed_monument"
        | "secondary_use"
        | "loose_block"
        | "unassessed"
      dated_material:
        | "cordage"
        | "structural_wood"
        | "charcoal"
        | "bone"
        | "seed"
        | "organic_temper"
        | "pitch_residue"
        | "peat"
        | "other"
      dating_method:
        | "typology"
        | "bronze_typology"
        | "shoreline_displacement"
        | "c14"
        | "dendro"
        | "osl"
        | "boatfind_analogue"
        | "superposition"
        | "sealed_context"
        | "historical_document"
      existence_state:
        | "extant"
        | "destroyed"
        | "documentary_only"
        | "relocated"
        | "unassessed"
      folk_group_category:
        | "germanic"
        | "slavic"
        | "finno_ugric"
        | "baltic"
        | "celtic"
        | "other"
      group_type: "die" | "monument" | "carver"
      heraldic_evidence:
        | "belagd"
        | "tillskriven"
        | "rekonstruerad"
        | "omtvistad"
      heraldic_target:
        | "coin"
        | "heritage_site"
        | "christian_site"
        | "artefact"
        | "picture_stone"
        | "external"
      interval_kind:
        | "range"
        | "terminus_post_quem"
        | "terminus_ante_quem"
        | "point"
      intervention_kind:
        | "painting"
        | "repainting"
        | "paint_removal"
        | "cleaning"
        | "moulding"
        | "excavation"
        | "conservation"
        | "reconstruction"
        | "damage"
        | "destruction"
        | "relocation"
      king_status: "historical" | "semi_legendary" | "legendary" | "disputed"
      motif_category:
        | "djur"
        | "fagel"
        | "fabeldjur"
        | "kors"
        | "himlakropp"
        | "vaxt"
        | "manniska"
        | "foremal"
        | "geometrisk"
        | "komposit"
      obs_method:
        | "autopsy_visual"
        | "frottage"
        | "tracing"
        | "casting"
        | "photo_daylight"
        | "photo_night"
        | "photogrammetry_sfm"
        | "laser_scan"
        | "reproduction"
      paint_state:
        | "unpainted"
        | "painted"
        | "freshly_repainted"
        | "paint_removed"
        | "unknown"
      position_method:
        | "rtk_gnss"
        | "handheld_gps"
        | "total_station"
        | "map_digitised"
        | "description_only"
        | "unknown"
      source_kind:
        | "publication"
        | "archive_item"
        | "field_note"
        | "historical_map"
        | "api_response"
        | "dataset"
        | "personal_comm"
      source_reliability: "primary" | "secondary" | "tertiary" | "legendary"
      source_rights:
        | "public_domain"
        | "cc0"
        | "cc_by"
        | "cc_by_sa"
        | "permission_granted"
        | "copyrighted"
        | "unknown"
      target_event:
        | "organism_death"
        | "construction"
        | "use"
        | "deposition"
        | "carving"
        | "unspecified"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user", "editor"],
      attribution_type: [
        "attributed",
        "signed",
        "similar",
        "signed on pair stone",
      ],
      authenticity_state: [
        "unassessed",
        "accepted",
        "disputed",
        "pareidolia",
        "paint_artefact",
        "modern_addition",
        "forgery",
      ],
      bearer_kind: [
        "dynasty",
        "king",
        "person",
        "bishopric",
        "town",
        "realm",
        "province",
        "institution",
        "family",
      ],
      bias_type: [
        "christian_anti_pagan",
        "nationalist_danish",
        "nationalist_swedish",
        "temporal_distance",
        "political_legitimacy",
        "none",
      ],
      context_state: [
        "open_bedrock",
        "sealed_monument",
        "secondary_use",
        "loose_block",
        "unassessed",
      ],
      dated_material: [
        "cordage",
        "structural_wood",
        "charcoal",
        "bone",
        "seed",
        "organic_temper",
        "pitch_residue",
        "peat",
        "other",
      ],
      dating_method: [
        "typology",
        "bronze_typology",
        "shoreline_displacement",
        "c14",
        "dendro",
        "osl",
        "boatfind_analogue",
        "superposition",
        "sealed_context",
        "historical_document",
      ],
      existence_state: [
        "extant",
        "destroyed",
        "documentary_only",
        "relocated",
        "unassessed",
      ],
      folk_group_category: [
        "germanic",
        "slavic",
        "finno_ugric",
        "baltic",
        "celtic",
        "other",
      ],
      group_type: ["die", "monument", "carver"],
      heraldic_evidence: [
        "belagd",
        "tillskriven",
        "rekonstruerad",
        "omtvistad",
      ],
      heraldic_target: [
        "coin",
        "heritage_site",
        "christian_site",
        "artefact",
        "picture_stone",
        "external",
      ],
      interval_kind: [
        "range",
        "terminus_post_quem",
        "terminus_ante_quem",
        "point",
      ],
      intervention_kind: [
        "painting",
        "repainting",
        "paint_removal",
        "cleaning",
        "moulding",
        "excavation",
        "conservation",
        "reconstruction",
        "damage",
        "destruction",
        "relocation",
      ],
      king_status: ["historical", "semi_legendary", "legendary", "disputed"],
      motif_category: [
        "djur",
        "fagel",
        "fabeldjur",
        "kors",
        "himlakropp",
        "vaxt",
        "manniska",
        "foremal",
        "geometrisk",
        "komposit",
      ],
      obs_method: [
        "autopsy_visual",
        "frottage",
        "tracing",
        "casting",
        "photo_daylight",
        "photo_night",
        "photogrammetry_sfm",
        "laser_scan",
        "reproduction",
      ],
      paint_state: [
        "unpainted",
        "painted",
        "freshly_repainted",
        "paint_removed",
        "unknown",
      ],
      position_method: [
        "rtk_gnss",
        "handheld_gps",
        "total_station",
        "map_digitised",
        "description_only",
        "unknown",
      ],
      source_kind: [
        "publication",
        "archive_item",
        "field_note",
        "historical_map",
        "api_response",
        "dataset",
        "personal_comm",
      ],
      source_reliability: ["primary", "secondary", "tertiary", "legendary"],
      source_rights: [
        "public_domain",
        "cc0",
        "cc_by",
        "cc_by_sa",
        "permission_granted",
        "copyrighted",
        "unknown",
      ],
      target_event: [
        "organism_death",
        "construction",
        "use",
        "deposition",
        "carving",
        "unspecified",
      ],
    },
  },
} as const

