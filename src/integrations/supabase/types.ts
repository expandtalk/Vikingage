export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
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
      archaeological_sites: {
        Row: {
          burial_type: string | null
          coordinates: unknown
          country: string
          county: string | null
          created_at: string | null
          dating: string | null
          description: string | null
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
          id?: string
          location?: string
          name?: string
          parish?: string | null
          period?: string
          updated_at?: string | null
        }
        Relationships: []
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
          sort_order: number
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          description?: Json
          id: string
          is_active?: boolean
          label: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: Json
          id?: string
          is_active?: boolean
          label?: Json
          sort_order?: number
          updated_at?: string
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
          genetic_sex: string | null
          grave_goods: string[] | null
          grave_number: string | null
          id: string
          isotopes: Json | null
          mt_haplogroup: string | null
          museums_inventory: string | null
          radiocarbon: string | null
          sample_id: string
          site_id: string | null
          updated_at: string | null
          y_haplogroup: string | null
        }
        Insert: {
          age?: string | null
          ancestry?: Json | null
          archaeological_sex?: string | null
          burial_context?: string | null
          created_at?: string | null
          genetic_sex?: string | null
          grave_goods?: string[] | null
          grave_number?: string | null
          id?: string
          isotopes?: Json | null
          mt_haplogroup?: string | null
          museums_inventory?: string | null
          radiocarbon?: string | null
          sample_id: string
          site_id?: string | null
          updated_at?: string | null
          y_haplogroup?: string | null
        }
        Update: {
          age?: string | null
          ancestry?: Json | null
          archaeological_sex?: string | null
          burial_context?: string | null
          created_at?: string | null
          genetic_sex?: string | null
          grave_goods?: string[] | null
          grave_number?: string | null
          id?: string
          isotopes?: Json | null
          mt_haplogroup?: string | null
          museums_inventory?: string | null
          radiocarbon?: string | null
          sample_id?: string
          site_id?: string | null
          updated_at?: string | null
          y_haplogroup?: string | null
        }
        Relationships: [
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
      heritage_sites: {
        Row: {
          created_at: string
          description: string | null
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
          source_uri: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
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
          source_uri?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
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
          id: string
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
          id?: string
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
          id?: string
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
          author: string
          bias_types: Database["public"]["Enums"]["bias_type"][] | null
          collection: string | null
          copyrighted_editions: string | null
          covers_period_end: number | null
          covers_period_start: number | null
          created_at: string
          description: string | null
          id: string
          language: string
          manuscript: string | null
          meter: string | null
          reliability: Database["public"]["Enums"]["source_reliability"]
          title: string
          title_en: string
          updated_at: string
          work_type: string | null
          written_year: number | null
        }
        Insert: {
          author: string
          bias_types?: Database["public"]["Enums"]["bias_type"][] | null
          collection?: string | null
          copyrighted_editions?: string | null
          covers_period_end?: number | null
          covers_period_start?: number | null
          created_at?: string
          description?: string | null
          id?: string
          language: string
          manuscript?: string | null
          meter?: string | null
          reliability: Database["public"]["Enums"]["source_reliability"]
          title: string
          title_en: string
          updated_at?: string
          work_type?: string | null
          written_year?: number | null
        }
        Update: {
          author?: string
          bias_types?: Database["public"]["Enums"]["bias_type"][] | null
          collection?: string | null
          copyrighted_editions?: string | null
          covers_period_end?: number | null
          covers_period_start?: number | null
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          manuscript?: string | null
          meter?: string | null
          reliability?: Database["public"]["Enums"]["source_reliability"]
          title?: string
          title_en?: string
          updated_at?: string
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
      place_names: {
        Row: {
          attestation_source: string | null
          attested_form: string | null
          created_at: string
          earliest_attestation_year: number | null
          element_category: string | null
          element_keys: string[]
          external_id: string | null
          feature_type: string | null
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
          created_at?: string
          earliest_attestation_year?: number | null
          element_category?: string | null
          element_keys?: string[]
          external_id?: string | null
          feature_type?: string | null
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
          created_at?: string
          earliest_attestation_year?: number | null
          element_category?: string | null
          element_keys?: string[]
          external_id?: string | null
          feature_type?: string | null
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
          complexity_level: string | null
          condition: string | null
          condition_notes: string | null
          coord_confidence: string | null
          coord_source: string | null
          coordinates: unknown
          country: string | null
          county: string | null
          created_at: string | null
          cultural_classification: string | null
          current_location: string | null
          data_source: string | null
          dating_confidence: number | null
          dating_text: string | null
          dimensions: string | null
          embedding: string | null
          harad: string | null
          historical_context: string | null
          id: string
          inscription_group: string | null
          interpretation_confidence: string | null
          is_primary_signum_verified: boolean | null
          k_samsok_uri: string | null
          lamningsnumber: string | null
          landscape: string | null
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
          complexity_level?: string | null
          condition?: string | null
          condition_notes?: string | null
          coord_confidence?: string | null
          coord_source?: string | null
          coordinates?: unknown
          country?: string | null
          county?: string | null
          created_at?: string | null
          cultural_classification?: string | null
          current_location?: string | null
          data_source?: string | null
          dating_confidence?: number | null
          dating_text?: string | null
          dimensions?: string | null
          embedding?: string | null
          harad?: string | null
          historical_context?: string | null
          id?: string
          inscription_group?: string | null
          interpretation_confidence?: string | null
          is_primary_signum_verified?: boolean | null
          k_samsok_uri?: string | null
          lamningsnumber?: string | null
          landscape?: string | null
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
          complexity_level?: string | null
          condition?: string | null
          condition_notes?: string | null
          coord_confidence?: string | null
          coord_source?: string | null
          coordinates?: unknown
          country?: string | null
          county?: string | null
          created_at?: string | null
          cultural_classification?: string | null
          current_location?: string | null
          data_source?: string | null
          dating_confidence?: number | null
          dating_text?: string | null
          dimensions?: string | null
          embedding?: string | null
          harad?: string | null
          historical_context?: string | null
          id?: string
          inscription_group?: string | null
          interpretation_confidence?: string | null
          is_primary_signum_verified?: boolean | null
          k_samsok_uri?: string | null
          lamningsnumber?: string | null
          landscape?: string | null
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
      swedish_hillforts: {
        Row: {
          coordinates: unknown
          country: string | null
          county: string | null
          created_at: string | null
          cultural_significance: string | null
          description: string | null
          fortress_type: string | null
          id: string
          landscape: string
          municipality: string | null
          name: string | null
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
          description?: string | null
          fortress_type?: string | null
          id?: string
          landscape: string
          municipality?: string | null
          name?: string | null
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
          description?: string | null
          fortress_type?: string | null
          id?: string
          landscape?: string
          municipality?: string | null
          name?: string | null
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
      disablelongtransactions: { Args: never; Returns: string }
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
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      extract_primary_signum: { Args: { signum_text: string }; Returns: string }
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
      rebuild_search_document: {
        Args: { p_id?: string; p_type?: string }
        Returns: undefined
      }
      runestone_stats_v1: { Args: never; Returns: Json }
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
      set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user: string
        }
        Returns: undefined
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
          lat: number
          lng: number
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
          lat: number
          lng: number
          name: string
          period: string
          raa_type: string
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
      bias_type:
        | "christian_anti_pagan"
        | "nationalist_danish"
        | "nationalist_swedish"
        | "temporal_distance"
        | "political_legitimacy"
        | "none"
      folk_group_category:
        | "germanic"
        | "slavic"
        | "finno_ugric"
        | "baltic"
        | "celtic"
        | "other"
      group_type: "die" | "monument" | "carver"
      king_status: "historical" | "semi_legendary" | "legendary" | "disputed"
      source_reliability: "primary" | "secondary" | "tertiary" | "legendary"
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
  public: {
    Enums: {
      app_role: ["admin", "user", "editor"],
      attribution_type: [
        "attributed",
        "signed",
        "similar",
        "signed on pair stone",
      ],
      bias_type: [
        "christian_anti_pagan",
        "nationalist_danish",
        "nationalist_swedish",
        "temporal_distance",
        "political_legitimacy",
        "none",
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
      king_status: ["historical", "semi_legendary", "legendary", "disputed"],
      source_reliability: ["primary", "secondary", "tertiary", "legendary"],
    },
  },
} as const
