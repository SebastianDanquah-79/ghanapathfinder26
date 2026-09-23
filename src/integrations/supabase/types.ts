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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string
          last_seen: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          last_seen?: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          last_seen?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
        }
        Relationships: []
      }
      africa_country_catalog: {
        Row: {
          code: string
          common_languages: string[]
          created_at: string
          enabled: boolean
          name: string
          official_languages: string[]
          region: string
        }
        Insert: {
          code: string
          common_languages?: string[]
          created_at?: string
          enabled?: boolean
          name: string
          official_languages?: string[]
          region: string
        }
        Update: {
          code?: string
          common_languages?: string[]
          created_at?: string
          enabled?: boolean
          name?: string
          official_languages?: string[]
          region?: string
        }
        Relationships: []
      }
      africa_leaders: {
        Row: {
          biography: string | null
          country_code: string
          country_code_alpha2: string | null
          country_name: string | null
          created_at: string
          id: string
          is_current: boolean | null
          key_policies: string[] | null
          left_office: string | null
          name: string
          notable_achievements: string[] | null
          official_source_url: string | null
          photo_url: string | null
          role: string
          title: string | null
          took_office: string | null
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          biography?: string | null
          country_code: string
          country_code_alpha2?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          is_current?: boolean | null
          key_policies?: string[] | null
          left_office?: string | null
          name: string
          notable_achievements?: string[] | null
          official_source_url?: string | null
          photo_url?: string | null
          role: string
          title?: string | null
          took_office?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          biography?: string | null
          country_code?: string
          country_code_alpha2?: string | null
          country_name?: string | null
          created_at?: string
          id?: string
          is_current?: boolean | null
          key_policies?: string[] | null
          left_office?: string | null
          name?: string
          notable_achievements?: string[] | null
          official_source_url?: string | null
          photo_url?: string | null
          role?: string
          title?: string | null
          took_office?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      african_startups: {
        Row: {
          active_status: string | null
          capital_usd: number | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string
          evidence_date: string | null
          id: string
          last_verified_at: string
          metric_type: string
          official_url: string | null
          sector: string | null
          source_name: string
          source_url: string
          stage: string | null
        }
        Insert: {
          active_status?: string | null
          capital_usd?: number | null
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          evidence_date?: string | null
          id?: string
          last_verified_at?: string
          metric_type?: string
          official_url?: string | null
          sector?: string | null
          source_name: string
          source_url: string
          stage?: string | null
        }
        Update: {
          active_status?: string | null
          capital_usd?: number | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          evidence_date?: string | null
          id?: string
          last_verified_at?: string
          metric_type?: string
          official_url?: string | null
          sector?: string | null
          source_name?: string
          source_url?: string
          stage?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          path: string | null
          ref_id: string | null
          ref_type: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          path?: string | null
          ref_id?: string | null
          ref_type?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          path?: string | null
          ref_id?: string | null
          ref_type?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      application_checklist: {
        Row: {
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          target: string | null
          task: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          target?: string | null
          task: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          target?: string | null
          task?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      application_notes: {
        Row: {
          application_id: string | null
          body: string
          created_at: string
          id: string
          is_private: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_private?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_private?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      book_catalog: {
        Row: {
          author: string
          created_at: string
          description: string | null
          id: string
          publication_year: number | null
          source_url: string | null
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          created_at?: string
          description?: string | null
          id?: string
          publication_year?: number | null
          source_url?: string | null
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          description?: string | null
          id?: string
          publication_year?: number | null
          source_url?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      campuses: {
        Row: {
          accreditation_status: string
          campus_name: string
          created_at: string
          id: string
          institution_id: string
          last_verified_at: string | null
          location: string | null
          region: string | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          accreditation_status?: string
          campus_name: string
          created_at?: string
          id?: string
          institution_id: string
          last_verified_at?: string | null
          location?: string | null
          region?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          accreditation_status?: string
          campus_name?: string
          created_at?: string
          id?: string
          institution_id?: string
          last_verified_at?: string | null
          location?: string | null
          region?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campuses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "insight_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          careers_url: string | null
          created_at: string
          description: string | null
          employer_type: string
          id: string
          last_verified_at: string | null
          location: string | null
          logo_url: string | null
          name: string
          region: string | null
          sector: string
          size: string | null
          slug: string
          source_url: string | null
          updated_at: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          careers_url?: string | null
          created_at?: string
          description?: string | null
          employer_type?: string
          id?: string
          last_verified_at?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          region?: string | null
          sector?: string
          size?: string | null
          slug: string
          source_url?: string | null
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          careers_url?: string | null
          created_at?: string
          description?: string | null
          employer_type?: string
          id?: string
          last_verified_at?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          region?: string | null
          sector?: string
          size?: string | null
          slug?: string
          source_url?: string | null
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      country_catalog: {
        Row: {
          code: string
          created_at: string
          enabled: boolean
          name: string
          primary_language: string
          region: string
        }
        Insert: {
          code: string
          created_at?: string
          enabled?: boolean
          name: string
          primary_language: string
          region: string
        }
        Update: {
          code?: string
          created_at?: string
          enabled?: boolean
          name?: string
          primary_language?: string
          region?: string
        }
        Relationships: []
      }
      country_qualification_mapping: {
        Row: {
          country_code: string
          notes: string | null
          qualification_code: string
          source_url: string | null
          verification_status: string
        }
        Insert: {
          country_code: string
          notes?: string | null
          qualification_code: string
          source_url?: string | null
          verification_status?: string
        }
        Update: {
          country_code?: string
          notes?: string | null
          qualification_code?: string
          source_url?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_qualification_mapping_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "africa_country_catalog"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "country_qualification_mapping_qualification_code_fkey"
            columns: ["qualification_code"]
            isOneToOne: false
            referencedRelation: "qualification_catalog"
            referencedColumns: ["code"]
          },
        ]
      }
      cross_border_opportunities: {
        Row: {
          application_url: string | null
          country_code: string | null
          eligibility: Json
          employer: string
          id: string
          last_verified_at: string | null
          opportunity_type: string
          role_family: string | null
          source_url: string | null
          title: string | null
          verified: boolean
        }
        Insert: {
          application_url?: string | null
          country_code?: string | null
          eligibility?: Json
          employer: string
          id?: string
          last_verified_at?: string | null
          opportunity_type: string
          role_family?: string | null
          source_url?: string | null
          title?: string | null
          verified?: boolean
        }
        Update: {
          application_url?: string | null
          country_code?: string | null
          eligibility?: Json
          employer?: string
          id?: string
          last_verified_at?: string | null
          opportunity_type?: string
          role_family?: string | null
          source_url?: string | null
          title?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      cru_attempts: {
        Row: {
          activity_type: string
          answer: string | null
          concept_id: string | null
          created_at: string
          diagnosis: string | null
          id: string
          prompt: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          answer?: string | null
          concept_id?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          prompt?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          answer?: string | null
          concept_id?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          prompt?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cru_attempts_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "cru_concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      cru_concepts: {
        Row: {
          description: string | null
          domain: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          domain?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          domain?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      cru_courses: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          level: number
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          level?: number
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: number
          title?: string
        }
        Relationships: []
      }
      cru_experiments: {
        Row: {
          conclusion: string | null
          config: Json
          created_at: string
          id: string
          metrics: Json
          name: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          conclusion?: string | null
          config?: Json
          created_at?: string
          id?: string
          metrics?: Json
          name: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          conclusion?: string | null
          config?: Json
          created_at?: string
          id?: string
          metrics?: Json
          name?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cru_experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "cru_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cru_grades: {
        Row: {
          course_code: string
          created_at: string
          credits: number
          grade: string | null
          id: string
          score: number | null
          semester: string | null
          user_id: string
        }
        Insert: {
          course_code: string
          created_at?: string
          credits: number
          grade?: string | null
          id?: string
          score?: number | null
          semester?: string | null
          user_id: string
        }
        Update: {
          course_code?: string
          created_at?: string
          credits?: number
          grade?: string | null
          id?: string
          score?: number | null
          semester?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cru_ideas: {
        Row: {
          created_at: string
          hypothesis: string | null
          id: string
          novelty_notes: string | null
          problem: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hypothesis?: string | null
          id?: string
          novelty_notes?: string | null
          problem?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          hypothesis?: string | null
          id?: string
          novelty_notes?: string | null
          problem?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      cru_lessons: {
        Row: {
          content: string
          course_id: string
          created_at: string
          difficulty: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          difficulty?: string
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          difficulty?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cru_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cru_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      cru_mastery: {
        Row: {
          attempts: number
          concept_id: string
          confidence: number
          mastery: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          concept_id: string
          confidence?: number
          mastery?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          concept_id?: string
          confidence?: number
          mastery?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cru_mastery_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "cru_concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      cru_mistakes: {
        Row: {
          concept_id: string | null
          correction: string | null
          created_at: string
          description: string
          id: string
          mistake_type: string
          resolved: boolean
          user_id: string
        }
        Insert: {
          concept_id?: string | null
          correction?: string | null
          created_at?: string
          description: string
          id?: string
          mistake_type: string
          resolved?: boolean
          user_id: string
        }
        Update: {
          concept_id?: string | null
          correction?: string | null
          created_at?: string
          description?: string
          id?: string
          mistake_type?: string
          resolved?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cru_mistakes_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "cru_concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      cru_news: {
        Row: {
          category: string | null
          created_at: string
          id: string
          published_at: string | null
          reliability: string | null
          source_name: string | null
          source_url: string | null
          summary: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          reliability?: string | null
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          reliability?: string | null
          source_name?: string | null
          source_url?: string | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      cru_paper_notes: {
        Row: {
          created_at: string
          id: string
          notes: string
          paper_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes: string
          paper_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string
          paper_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cru_paper_notes_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "cru_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      cru_papers: {
        Row: {
          abstract: string | null
          arxiv_id: string | null
          authors: string[]
          created_at: string
          doi: string | null
          id: string
          publication_date: string | null
          title: string
          topics: string[]
          url: string | null
          venue: string | null
        }
        Insert: {
          abstract?: string | null
          arxiv_id?: string | null
          authors?: string[]
          created_at?: string
          doi?: string | null
          id?: string
          publication_date?: string | null
          title: string
          topics?: string[]
          url?: string | null
          venue?: string | null
        }
        Update: {
          abstract?: string | null
          arxiv_id?: string | null
          authors?: string[]
          created_at?: string
          doi?: string | null
          id?: string
          publication_date?: string | null
          title?: string
          topics?: string[]
          url?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      cru_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          university: string | null
          updated_at: string
          year_of_study: number | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          university?: string | null
          updated_at?: string
          year_of_study?: number | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          university?: string | null
          updated_at?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      cru_projects: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cru_study_sessions: {
        Row: {
          activity: string
          created_at: string
          id: string
          minutes: number
          notes: string | null
          user_id: string
        }
        Insert: {
          activity: string
          created_at?: string
          id?: string
          minutes?: number
          notes?: string | null
          user_id: string
        }
        Update: {
          activity?: string
          created_at?: string
          id?: string
          minutes?: number
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cv_versions: {
        Row: {
          created_at: string
          cv_id: string
          data: Json
          id: string
          version_name: string
        }
        Insert: {
          created_at?: string
          cv_id: string
          data?: Json
          id?: string
          version_name: string
        }
        Update: {
          created_at?: string
          cv_id?: string
          data?: Json
          id?: string
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_versions_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          },
        ]
      }
      cvs: {
        Row: {
          created_at: string
          data: Json
          discoverable: boolean
          id: string
          name: string
          template: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          data?: Json
          discoverable?: boolean
          id?: string
          name?: string
          template?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          data?: Json
          discoverable?: boolean
          id?: string
          name?: string
          template?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          record_id: string
          record_type: string
          source_name: string | null
          source_type: string
          source_url: string
          updated_at: string
          verification_status: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          record_id: string
          record_type: string
          source_name?: string | null
          source_type?: string
          source_url: string
          updated_at?: string
          verification_status?: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          record_id?: string
          record_type?: string
          source_name?: string | null
          source_type?: string
          source_url?: string
          updated_at?: string
          verification_status?: string
          verified_at?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          category: string | null
          created_at: string
          due_date: string
          id: string
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      directory_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      directory_profiles: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string
          display_name: string
          field: string | null
          github_url: string | null
          graduation_year: number | null
          interests: string[]
          level: string | null
          linkedin_url: string | null
          open_to_collaboration: boolean
          open_to_mentoring: boolean
          open_to_opportunities: boolean
          portfolio_url: string | null
          programme: string | null
          projects: string | null
          seeking_mentor: boolean
          skills: string[]
          university: string | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name: string
          field?: string | null
          github_url?: string | null
          graduation_year?: number | null
          interests?: string[]
          level?: string | null
          linkedin_url?: string | null
          open_to_collaboration?: boolean
          open_to_mentoring?: boolean
          open_to_opportunities?: boolean
          portfolio_url?: string | null
          programme?: string | null
          projects?: string | null
          seeking_mentor?: boolean
          skills?: string[]
          university?: string | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          field?: string | null
          github_url?: string | null
          graduation_year?: number | null
          interests?: string[]
          level?: string | null
          linkedin_url?: string | null
          open_to_collaboration?: boolean
          open_to_mentoring?: boolean
          open_to_opportunities?: boolean
          portfolio_url?: string | null
          programme?: string | null
          projects?: string | null
          seeking_mentor?: boolean
          skills?: string[]
          university?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      directory_reports: {
        Row: {
          created_at: string
          id: string
          profile_user_id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_user_id: string
          reason: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_user_id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_reports_profile_user_id_fkey"
            columns: ["profile_user_id"]
            isOneToOne: false
            referencedRelation: "directory_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_profiles: {
        Row: {
          created_at: string
          employer_name: string | null
          professional_title: string | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          employer_name?: string | null
          professional_title?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          employer_name?: string | null
          professional_title?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      employer_messages: {
        Row: {
          candidate_user_id: string
          created_at: string
          employer_id: string
          id: string
          message: string
          read_at: string | null
          sender_user_id: string
        }
        Insert: {
          candidate_user_id: string
          created_at?: string
          employer_id: string
          id?: string
          message: string
          read_at?: string | null
          sender_user_id: string
        }
        Update: {
          candidate_user_id?: string
          created_at?: string
          employer_id?: string
          id?: string
          message?: string
          read_at?: string | null
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_messages_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          created_at: string
          hiring_focus: string[]
          organization_name: string | null
          organization_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hiring_focus?: string[]
          organization_name?: string | null
          organization_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hiring_focus?: string[]
          organization_name?: string | null
          organization_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employer_users: {
        Row: {
          created_at: string
          employer_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_users_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_verifications: {
        Row: {
          created_at: string
          employer_id: string
          evidence: Json
          id: string
          reviewed_at: string | null
          reviewer_user_id: string | null
          status: string
          submitted_by: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          evidence?: Json
          id?: string
          reviewed_at?: string | null
          reviewer_user_id?: string | null
          status?: string
          submitted_by: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          evidence?: Json
          id?: string
          reviewed_at?: string | null
          reviewer_user_id?: string | null
          status?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_verifications_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          city: string | null
          company_id: string | null
          country_code: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          organization_type: string
          updated_at: string
          verification_source: string | null
          verification_status: string
          verified_at: string | null
          website_url: string | null
        }
        Insert: {
          city?: string | null
          company_id?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          organization_type?: string
          updated_at?: string
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          website_url?: string | null
        }
        Update: {
          city?: string | null
          company_id?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          organization_type?: string
          updated_at?: string
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      faculties: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculties_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_items: {
        Row: {
          category: string
          description: string | null
          id: string
          published_at: string | null
          source_name: string
          source_url: string
          title: string
          verified_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          published_at?: string | null
          source_name: string
          source_url: string
          title: string
          verified_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          published_at?: string | null
          source_name?: string
          source_url?: string
          title?: string
          verified_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      feed_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          author_id: string
          category: string
          comments_count: number
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          likes_count: number
          shares_count: number
          tags: string[]
          thumbnail_url: string | null
          title: string | null
          video_url: string | null
          views_count: number
          youtube_url: string | null
        }
        Insert: {
          author_id: string
          category?: string
          comments_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          likes_count?: number
          shares_count?: number
          tags?: string[]
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string | null
          views_count?: number
          youtube_url?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          comments_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          likes_count?: number
          shares_count?: number
          tags?: string[]
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string | null
          views_count?: number
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_profiles: {
        Row: {
          created_at: string
          pitch_url: string | null
          sector: string | null
          stage: string | null
          startup_name: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          pitch_url?: string | null
          sector?: string | null
          stage?: string | null
          startup_name?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          pitch_url?: string | null
          sector?: string | null
          stage?: string | null
          startup_name?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      ghana_institution_guides: {
        Row: {
          admissions_url: string | null
          application_url: string | null
          id: string
          institution_name: string
          institution_type: string | null
          international_url: string | null
          last_verified_at: string | null
          notes: string | null
          scholarship_url: string | null
          verification_status: string
        }
        Insert: {
          admissions_url?: string | null
          application_url?: string | null
          id?: string
          institution_name: string
          institution_type?: string | null
          international_url?: string | null
          last_verified_at?: string | null
          notes?: string | null
          scholarship_url?: string | null
          verification_status?: string
        }
        Update: {
          admissions_url?: string | null
          application_url?: string | null
          id?: string
          institution_name?: string
          institution_type?: string | null
          international_url?: string | null
          last_verified_at?: string | null
          notes?: string | null
          scholarship_url?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      ghana_student_visa_guides: {
        Row: {
          country_code: string
          destination_country: string
          last_verified_at: string | null
          required_documents: Json
          source_url: string | null
          steps: Json
          title: string
        }
        Insert: {
          country_code: string
          destination_country?: string
          last_verified_at?: string | null
          required_documents?: Json
          source_url?: string | null
          steps?: Json
          title: string
        }
        Update: {
          country_code?: string
          destination_country?: string
          last_verified_at?: string | null
          required_documents?: Json
          source_url?: string | null
          steps?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghana_student_visa_guides_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: true
            referencedRelation: "africa_country_catalog"
            referencedColumns: ["code"]
          },
        ]
      }
      innovation_items: {
        Row: {
          category: string
          description: string | null
          id: string
          media_url: string | null
          published_at: string | null
          source_name: string
          source_url: string
          title: string
          verified_at: string
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          media_url?: string | null
          published_at?: string | null
          source_name: string
          source_url: string
          title: string
          verified_at?: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          media_url?: string | null
          published_at?: string | null
          source_name?: string
          source_url?: string
          title?: string
          verified_at?: string
        }
        Relationships: []
      }
      insight_comments: {
        Row: {
          author_label: string
          body: string
          created_at: string
          id: string
          insight_id: string
          like_count: number
          parent_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_label?: string
          body: string
          created_at?: string
          id?: string
          insight_id: string
          like_count?: number
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_label?: string
          body?: string
          created_at?: string
          id?: string
          insight_id?: string
          like_count?: number
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_comments_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "student_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insight_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "insight_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      insight_helpful: {
        Row: {
          created_at: string
          id: string
          insight_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insight_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insight_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_helpful_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "student_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      insight_reports: {
        Row: {
          created_at: string
          id: string
          insight_id: string
          reason: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          insight_id: string
          reason: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          insight_id?: string
          reason?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_reports_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "student_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      international_students: {
        Row: {
          academic_level: string | null
          country_code: string | null
          created_at: string | null
          github_url: string | null
          graduation_year: number | null
          id: string
          interests: string[] | null
          linkedin_url: string | null
          looking_for_opportunities: boolean | null
          open_to_collaboration: boolean | null
          open_to_mentorship: boolean | null
          portfolio_url: string | null
          programme_name: string | null
          projects: string[] | null
          skills: string[] | null
          university_name: string | null
          updated_at: string | null
          user_id: string
          visible: boolean | null
        }
        Insert: {
          academic_level?: string | null
          country_code?: string | null
          created_at?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          looking_for_opportunities?: boolean | null
          open_to_collaboration?: boolean | null
          open_to_mentorship?: boolean | null
          portfolio_url?: string | null
          programme_name?: string | null
          projects?: string[] | null
          skills?: string[] | null
          university_name?: string | null
          updated_at?: string | null
          user_id: string
          visible?: boolean | null
        }
        Update: {
          academic_level?: string | null
          country_code?: string | null
          created_at?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          looking_for_opportunities?: boolean | null
          open_to_collaboration?: boolean | null
          open_to_mentorship?: boolean | null
          portfolio_url?: string | null
          programme_name?: string | null
          projects?: string[] | null
          skills?: string[] | null
          university_name?: string | null
          updated_at?: string | null
          user_id?: string
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "international_students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      international_universities: {
        Row: {
          admissions_url: string | null
          city: string | null
          country_code: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          source_url: string | null
          updated_at: string | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          admissions_url?: string | null
          city?: string | null
          country_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          source_url?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          admissions_url?: string | null
          city?: string | null
          country_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          source_url?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      internships: {
        Row: {
          application_url: string | null
          careers: string[] | null
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          fields: string[] | null
          id: string
          location: string | null
          source_url: string | null
          start_date: string | null
          title: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          application_url?: string | null
          careers?: string[] | null
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          fields?: string[] | null
          id?: string
          location?: string | null
          source_url?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          application_url?: string | null
          careers?: string[] | null
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          fields?: string[] | null
          id?: string
          location?: string | null
          source_url?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "internships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          country_code: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          sectors: string[] | null
          source_url: string | null
          stages: string[] | null
          type: string | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sectors?: string[] | null
          source_url?: string | null
          stages?: string[] | null
          type?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sectors?: string[] | null
          source_url?: string | null
          stages?: string[] | null
          type?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          category: string | null
          country_code: string | null
          created_at: string | null
          id: string
          level: string | null
          provider: string
          skills: string[] | null
          source_url: string | null
          title: string
          url: string
        }
        Insert: {
          category?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          provider: string
          skills?: string[] | null
          source_url?: string | null
          title: string
          url: string
        }
        Update: {
          category?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          provider?: string
          skills?: string[] | null
          source_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      life_path_items: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          stage: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          stage: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          stage?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logo_requests: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          requested_by: string
          status: string
          university_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          requested_by: string
          status?: string
          university_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          requested_by?: string
          status?: string
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logo_requests_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      match_preferences: {
        Row: {
          created_at: string
          funding_types: string[]
          id: string
          preferred_locations: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          funding_types?: string[]
          id?: string
          preferred_locations?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          funding_types?: string[]
          id?: string
          preferred_locations?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          category: string | null
          content_hash: string | null
          country_code: string | null
          created_at: string
          excerpt: string | null
          fetched_at: string
          id: string
          image_url: string | null
          original_url: string
          published_at: string | null
          source_id: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content_hash?: string | null
          country_code?: string | null
          created_at?: string
          excerpt?: string | null
          fetched_at?: string
          id?: string
          image_url?: string | null
          original_url: string
          published_at?: string | null
          source_id?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content_hash?: string | null
          country_code?: string | null
          created_at?: string
          excerpt?: string | null
          fetched_at?: string
          id?: string
          image_url?: string | null
          original_url?: string
          published_at?: string | null
          source_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_sources: {
        Row: {
          active: boolean
          category: string | null
          country_code: string | null
          created_at: string
          id: string
          last_error: string | null
          last_fetched_at: string | null
          last_success_at: string | null
          name: string
          refresh_interval_minutes: number
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name: string
          refresh_interval_minutes?: number
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          category?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name?: string
          refresh_interval_minutes?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          employer_messages: boolean
          internship_deadlines: boolean
          job_matches: boolean
          recommendations: boolean
          scholarship_deadlines: boolean
          startup_news: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          employer_messages?: boolean
          internship_deadlines?: boolean
          job_matches?: boolean
          recommendations?: boolean
          scholarship_deadlines?: boolean
          startup_news?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          employer_messages?: boolean
          internship_deadlines?: boolean
          job_matches?: boolean
          recommendations?: boolean
          scholarship_deadlines?: boolean
          startup_news?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          read: boolean
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          read?: boolean
          title?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read?: boolean
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      occupation_salaries: {
        Row: {
          created_at: string
          currency: string
          id: string
          job_title: string
          max_salary: number | null
          min_salary: number | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          job_title: string
          max_salary?: number | null
          min_salary?: number | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          job_title?: string
          max_salary?: number | null
          min_salary?: number | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_url: string | null
          apply_url: string | null
          availability: string | null
          city: string | null
          company_id: string | null
          company_logo_url: string | null
          company_name: string | null
          country: string | null
          country_code: string | null
          created_at: string
          deadline: string | null
          description: string | null
          employment_type: string | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          last_verified_at: string | null
          location: string | null
          opportunity_type: string
          posted_at: string | null
          posted_by: string | null
          remote: boolean
          requirements: string | null
          skills: string[]
          skills_required: string[] | null
          source: string | null
          source_id: string | null
          source_name: string | null
          source_url: string | null
          status: string
          title: string
          type: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          application_url?: string | null
          apply_url?: string | null
          availability?: string | null
          city?: string | null
          company_id?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          last_verified_at?: string | null
          location?: string | null
          opportunity_type?: string
          posted_at?: string | null
          posted_by?: string | null
          remote?: boolean
          requirements?: string | null
          skills?: string[]
          skills_required?: string[] | null
          source?: string | null
          source_id?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          application_url?: string | null
          apply_url?: string | null
          availability?: string | null
          city?: string | null
          company_id?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          last_verified_at?: string | null
          location?: string | null
          opportunity_type?: string
          posted_at?: string | null
          posted_by?: string | null
          remote?: boolean
          requirements?: string | null
          skills?: string[]
          skills_required?: string[] | null
          source?: string | null
          source_id?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_applications: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          notes: string | null
          opportunity_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_pipeline: {
        Row: {
          created_at: string
          deadline_date: string | null
          id: string
          item_kind: string
          item_ref: string | null
          notes: string | null
          organisation: string | null
          stage: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline_date?: string | null
          id?: string
          item_kind: string
          item_ref?: string | null
          notes?: string | null
          organisation?: string | null
          stage?: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deadline_date?: string | null
          id?: string
          item_kind?: string
          item_ref?: string | null
          notes?: string | null
          organisation?: string | null
          stage?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parent_links: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          parent_email: string | null
          parent_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          parent_email?: string | null
          parent_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          parent_email?: string | null
          parent_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_countries: {
        Row: {
          active: boolean
          code: string
          created_at: string
          currency_code: string | null
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          currency_code?: string | null
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          currency_code?: string | null
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_role: string
          account_type: string
          availability: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          company: string | null
          country_code: string | null
          created_at: string
          cv_visibility: string
          discoverable_to_recruiters: boolean
          education_level: string | null
          email: string | null
          full_name: string | null
          github_url: string | null
          graduation_year: number | null
          id: string
          interests: string[]
          is_discoverable: boolean | null
          job_title: string | null
          linkedin_url: string | null
          location: string | null
          onboarded: boolean
          onboarding_complete: boolean | null
          pathways: string[]
          phone: string | null
          portfolio_url: string | null
          preferred_industries: string[]
          preferred_locations: string[]
          preferred_opportunity_types: string[]
          profile_visibility: string
          program: string | null
          region: string | null
          role: string | null
          school: string | null
          skills: string[] | null
          target_career: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          account_role?: string
          account_type?: string
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          cv_visibility?: string
          discoverable_to_recruiters?: boolean
          education_level?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id: string
          interests?: string[]
          is_discoverable?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          onboarded?: boolean
          onboarding_complete?: boolean | null
          pathways?: string[]
          phone?: string | null
          portfolio_url?: string | null
          preferred_industries?: string[]
          preferred_locations?: string[]
          preferred_opportunity_types?: string[]
          profile_visibility?: string
          program?: string | null
          region?: string | null
          role?: string | null
          school?: string | null
          skills?: string[] | null
          target_career?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          account_role?: string
          account_type?: string
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country_code?: string | null
          created_at?: string
          cv_visibility?: string
          discoverable_to_recruiters?: boolean
          education_level?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[]
          is_discoverable?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          onboarded?: boolean
          onboarding_complete?: boolean | null
          pathways?: string[]
          phone?: string | null
          portfolio_url?: string | null
          preferred_industries?: string[]
          preferred_locations?: string[]
          preferred_opportunity_types?: string[]
          profile_visibility?: string
          program?: string | null
          region?: string | null
          role?: string | null
          school?: string | null
          skills?: string[] | null
          target_career?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programme_admission_estimates: {
        Row: {
          confidence: number | null
          created_at: string
          estimated_cutoff: number | null
          id: string
          programme_id: string
          source_url: string | null
          university_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          estimated_cutoff?: number | null
          id?: string
          programme_id: string
          source_url?: string | null
          university_id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          estimated_cutoff?: number | null
          id?: string
          programme_id?: string
          source_url?: string | null
          university_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_admission_estimates_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_admission_estimates_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_careers: {
        Row: {
          career: string
          created_at: string
          id: string
          programme_id: string
          updated_at: string
        }
        Insert: {
          career: string
          created_at?: string
          id?: string
          programme_id: string
          updated_at?: string
        }
        Update: {
          career?: string
          created_at?: string
          id?: string
          programme_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_careers_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_curriculum: {
        Row: {
          course_code: string | null
          course_name: string
          courses: string[] | null
          created_at: string
          id: string
          programme_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          course_code?: string | null
          course_name: string
          courses?: string[] | null
          created_at?: string
          id?: string
          programme_id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          course_code?: string | null
          course_name?: string
          courses?: string[] | null
          created_at?: string
          id?: string
          programme_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_curriculum_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_cutoffs: {
        Row: {
          created_at: string
          cutoff: number | null
          id: string
          programme_id: string
          source_url: string | null
          university_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          cutoff?: number | null
          id?: string
          programme_id: string
          source_url?: string | null
          university_id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          cutoff?: number | null
          id?: string
          programme_id?: string
          source_url?: string | null
          university_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_cutoffs_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_cutoffs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          programme_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          programme_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          programme_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_feedback_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_field_library: {
        Row: {
          created_at: string
          field: string
          id: string
          study_areas: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          field: string
          id?: string
          study_areas?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          field?: string
          id?: string
          study_areas?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      programme_information: {
        Row: {
          average_salary: number | null
          career_opportunities: string[] | null
          created_at: string
          description: string | null
          id: string
          job_market_outlook: string | null
          programme_id: string
          study_areas: string[] | null
          updated_at: string
          why_choose: string | null
        }
        Insert: {
          average_salary?: number | null
          career_opportunities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          job_market_outlook?: string | null
          programme_id: string
          study_areas?: string[] | null
          updated_at?: string
          why_choose?: string | null
        }
        Update: {
          average_salary?: number | null
          career_opportunities?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          job_market_outlook?: string | null
          programme_id?: string
          study_areas?: string[] | null
          updated_at?: string
          why_choose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_information_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_qualification_requirements: {
        Row: {
          created_at: string
          id: string
          last_verified_at: string | null
          minimum_overall_score: number | null
          minimum_score_operator: string | null
          notes: string | null
          programme_id: string
          qualification_code: string
          required_subjects: Json
          source_url: string | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_verified_at?: string | null
          minimum_overall_score?: number | null
          minimum_score_operator?: string | null
          notes?: string | null
          programme_id: string
          qualification_code: string
          required_subjects?: Json
          source_url?: string | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_verified_at?: string | null
          minimum_overall_score?: number | null
          minimum_score_operator?: string | null
          notes?: string | null
          programme_id?: string
          qualification_code?: string
          required_subjects?: Json
          source_url?: string | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_qualification_requirements_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_qualification_requirements_qualification_code_fkey"
            columns: ["qualification_code"]
            isOneToOne: false
            referencedRelation: "qualification_catalog"
            referencedColumns: ["code"]
          },
        ]
      }
      programme_requirements: {
        Row: {
          created_at: string
          id: string
          programme_id: string
          requirement: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          programme_id: string
          requirement: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          programme_id?: string
          requirement?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_requirements_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_sources: {
        Row: {
          created_at: string
          id: string
          programme_id: string
          source_name: string | null
          source_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          programme_id: string
          source_name?: string | null
          source_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          programme_id?: string
          source_name?: string | null
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_sources_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programmes: {
        Row: {
          academic_year: string | null
          application_url: string | null
          career_opportunities: string[] | null
          created_at: string | null
          degree_type: string | null
          description: string | null
          duration: string | null
          entry_requirements: string | null
          faculty_id: string | null
          field: string | null
          id: string
          last_verified_at: string | null
          name: string | null
          programme_url: string | null
          qualification: string | null
          relevant_subjects: string[] | null
          slug: string | null
          source_url: string | null
          university_id: string | null
          updated_at: string | null
          verification_status: string | null
          verified: boolean | null
          wassce_requirements: string | null
        }
        Insert: {
          academic_year?: string | null
          application_url?: string | null
          career_opportunities?: string[] | null
          created_at?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          faculty_id?: string | null
          field?: string | null
          id?: string
          last_verified_at?: string | null
          name?: string | null
          programme_url?: string | null
          qualification?: string | null
          relevant_subjects?: string[] | null
          slug?: string | null
          source_url?: string | null
          university_id?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified?: boolean | null
          wassce_requirements?: string | null
        }
        Update: {
          academic_year?: string | null
          application_url?: string | null
          career_opportunities?: string[] | null
          created_at?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          faculty_id?: string | null
          field?: string | null
          id?: string
          last_verified_at?: string | null
          name?: string | null
          programme_url?: string | null
          qualification?: string | null
          relevant_subjects?: string[] | null
          slug?: string | null
          source_url?: string | null
          university_id?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified?: boolean | null
          wassce_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programmes_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programmes_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_catalog: {
        Row: {
          code: string
          country_code: string | null
          created_at: string
          enabled: boolean
          family: string
          grades: string[]
          grading_scale: string | null
          levels: string[]
          metadata: Json
          name: string
          score_max: number | null
          score_min: number | null
          updated_at: string
        }
        Insert: {
          code: string
          country_code?: string | null
          created_at?: string
          enabled?: boolean
          family: string
          grades?: string[]
          grading_scale?: string | null
          levels?: string[]
          metadata?: Json
          name: string
          score_max?: number | null
          score_min?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string | null
          created_at?: string
          enabled?: boolean
          family?: string
          grades?: string[]
          grading_scale?: string | null
          levels?: string[]
          metadata?: Json
          name?: string
          score_max?: number | null
          score_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_items: {
        Row: {
          category: string | null
          created_at: string
          entity_id: string | null
          evidence: Json
          explanation: string | null
          id: string
          item_type: string
          rank: number
          run_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          entity_id?: string | null
          evidence?: Json
          explanation?: string | null
          id?: string
          item_type: string
          rank: number
          run_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          entity_id?: string | null
          evidence?: Json
          explanation?: string | null
          id?: string
          item_type?: string
          rank?: number
          run_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "recommendation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          engine_version: string
          error_message: string | null
          id: string
          input_snapshot: Json
          result_count: number
          run_type: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          engine_version?: string
          error_message?: string | null
          id?: string
          input_snapshot?: Json
          result_count?: number
          run_type?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          engine_version?: string
          error_message?: string | null
          id?: string
          input_snapshot?: Json
          result_count?: number
          run_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_candidates: {
        Row: {
          candidate_user_id: string
          created_at: string
          employer_id: string
          id: string
        }
        Insert: {
          candidate_user_id: string
          created_at?: string
          employer_id: string
          id?: string
        }
        Update: {
          candidate_user_id?: string
          created_at?: string
          employer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_candidates_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_key: string
          item_type: string
          metadata: Json
          subtitle: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_key: string
          item_type: string
          metadata?: Json
          subtitle?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_key?: string
          item_type?: string
          metadata?: Json
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          alerts_enabled: boolean
          created_at: string
          filters: Json
          id: string
          last_run_at: string | null
          name: string
          search_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alerts_enabled?: boolean
          created_at?: string
          filters?: Json
          id?: string
          last_run_at?: string | null
          name: string
          search_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alerts_enabled?: boolean
          created_at?: string
          filters?: Json
          id?: string
          last_run_at?: string | null
          name?: string
          search_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarship_applications: {
        Row: {
          created_at: string
          id: string
          scholarship_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scholarship_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scholarship_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          application_url: string | null
          created_at: string
          deadline: string | null
          description: string | null
          eligibility: string | null
          fields: string[] | null
          id: string
          provider: string
          source_url: string | null
          title: string
          type: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          application_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          fields?: string[] | null
          id?: string
          provider: string
          source_url?: string | null
          title: string
          type?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          application_url?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          fields?: string[] | null
          id?: string
          provider?: string
          source_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      site_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      skill_relationships: {
        Row: {
          from_skill_id: string
          id: string
          rationale: string | null
          relationship_type: string
          to_skill_id: string
          weight: number
        }
        Insert: {
          from_skill_id: string
          id?: string
          rationale?: string | null
          relationship_type?: string
          to_skill_id: string
          weight?: number
        }
        Update: {
          from_skill_id?: string
          id?: string
          rationale?: string | null
          relationship_type?: string
          to_skill_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_relationships_from_skill_id_fkey"
            columns: ["from_skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_relationships_to_skill_id_fkey"
            columns: ["to_skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          learning_resources: Json
          name: string
          prerequisites: string[]
          projects: Json
          related_jobs: Json
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          learning_resources?: Json
          name: string
          prerequisites?: string[]
          projects?: Json
          related_jobs?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          learning_resources?: Json
          name?: string
          prerequisites?: string[]
          projects?: Json
          related_jobs?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_insights: {
        Row: {
          body: string
          created_at: string
          helpful_count: number
          id: string
          image_paths: string[] | null
          status: string
          title: string
          university_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          helpful_count?: number
          id?: string
          image_paths?: string[] | null
          status?: string
          title: string
          university_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          helpful_count?: number
          id?: string
          image_paths?: string[] | null
          status?: string
          title?: string
          university_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_insights_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          created_at: string
          education_stage: string | null
          intended_country: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          education_stage?: string | null
          intended_country?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          education_stage?: string | null
          intended_country?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_qualification_results: {
        Row: {
          created_at: string
          grade: string
          id: string
          level: string | null
          qualification_id: string
          subject: string
          subject_code: string | null
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          level?: string | null
          qualification_id: string
          subject: string
          subject_code?: string | null
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          level?: string | null
          qualification_id?: string
          subject?: string
          subject_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_qualification_results_qualification_id_fkey"
            columns: ["qualification_id"]
            isOneToOne: false
            referencedRelation: "student_qualifications"
            referencedColumns: ["id"]
          },
        ]
      }
      student_qualifications: {
        Row: {
          country_code: string
          created_at: string
          grading_scale: string | null
          id: string
          metadata: Json
          overall_score: string | null
          qualification_code: string
          qualification_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          grading_scale?: string | null
          id?: string
          metadata?: Json
          overall_score?: string | null
          qualification_code: string
          qualification_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country_code?: string
          created_at?: string
          grading_scale?: string | null
          id?: string
          metadata?: Json
          overall_score?: string | null
          qualification_code?: string
          qualification_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_directory: {
        Row: {
          bio: string | null
          city: string | null
          discoverable: boolean
          full_name: string | null
          linkedin_url: string | null
          preferred_industries: string[]
          preferred_locations: string[]
          professional_title: string | null
          skills: string[]
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          discoverable?: boolean
          full_name?: string | null
          linkedin_url?: string | null
          preferred_industries?: string[]
          preferred_locations?: string[]
          professional_title?: string | null
          skills?: string[]
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          discoverable?: boolean
          full_name?: string | null
          linkedin_url?: string | null
          preferred_industries?: string[]
          preferred_locations?: string[]
          professional_title?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          accreditation_expiry_date: string | null
          accreditation_start_date: string | null
          accreditation_status: string
          address: string | null
          admission_aggregate: string | null
          admission_info: string | null
          admissions_url: string | null
          aliases: string[] | null
          campus_vibe: string | null
          category: string
          city: string | null
          country: string
          created_at: string
          delivery_mode: string
          description: string | null
          email: string | null
          established_year: number | null
          financial_aid_url: string | null
          gtec_category: string | null
          id: string
          last_verified_at: string | null
          location: string | null
          logo_url: string | null
          name: string
          ownership: string | null
          region: string | null
          scholarship_info: string | null
          short_name: string | null
          slug: string
          source_type: string
          source_url: string | null
          student_count: number | null
          top_programmes: string[] | null
          tuition_range: string | null
          type: string
          updated_at: string
          verification_status: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          accreditation_expiry_date?: string | null
          accreditation_start_date?: string | null
          accreditation_status?: string
          address?: string | null
          admission_aggregate?: string | null
          admission_info?: string | null
          admissions_url?: string | null
          aliases?: string[] | null
          campus_vibe?: string | null
          category?: string
          city?: string | null
          country?: string
          created_at?: string
          delivery_mode?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          financial_aid_url?: string | null
          gtec_category?: string | null
          id?: string
          last_verified_at?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          ownership?: string | null
          region?: string | null
          scholarship_info?: string | null
          short_name?: string | null
          slug: string
          source_type?: string
          source_url?: string | null
          student_count?: number | null
          top_programmes?: string[] | null
          tuition_range?: string | null
          type?: string
          updated_at?: string
          verification_status?: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          accreditation_expiry_date?: string | null
          accreditation_start_date?: string | null
          accreditation_status?: string
          address?: string | null
          admission_aggregate?: string | null
          admission_info?: string | null
          admissions_url?: string | null
          aliases?: string[] | null
          campus_vibe?: string | null
          category?: string
          city?: string | null
          country?: string
          created_at?: string
          delivery_mode?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          financial_aid_url?: string | null
          gtec_category?: string | null
          id?: string
          last_verified_at?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          ownership?: string | null
          region?: string | null
          scholarship_info?: string | null
          short_name?: string | null
          slug?: string
          source_type?: string
          source_url?: string | null
          student_count?: number | null
          top_programmes?: string[] | null
          tuition_range?: string | null
          type?: string
          updated_at?: string
          verification_status?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      usage_counters: {
        Row: {
          active_students: number
          counter_key: string
          counter_value: number
          metric: string
          recommendation_runs: number
          students: number
          updated_at: string
          website_visits: number
        }
        Insert: {
          active_students?: number
          counter_key: string
          counter_value?: number
          metric?: string
          recommendation_runs?: number
          students?: number
          updated_at?: string
          website_visits?: number
        }
        Update: {
          active_students?: number
          counter_key?: string
          counter_value?: number
          metric?: string
          recommendation_runs?: number
          students?: number
          updated_at?: string
          website_visits?: number
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_name: string
          id: number
          metadata: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_name: string
          id?: number
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_name?: string
          id?: number
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_size_bytes: number | null
          id: string
          metadata: Json
          mime_type: string | null
          status: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          status?: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          status?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      user_skill_profiles: {
        Row: {
          created_at: string
          evidence: Json
          id: string
          level: string | null
          skill_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          id?: string
          level?: string | null
          skill_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          id?: string
          level?: string | null
          skill_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_profiles_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      wassce_results: {
        Row: {
          created_at: string
          grade: string
          id: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      startup_directory: {
        Row: {
          pitch_url: string | null
          sector: string | null
          stage: string | null
          startup_name: string | null
          website_url: string | null
        }
        Insert: {
          pitch_url?: string | null
          sector?: string | null
          stage?: string | null
          startup_name?: string | null
          website_url?: string | null
        }
        Update: {
          pitch_url?: string | null
          sector?: string | null
          stage?: string | null
          startup_name?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      university_platform_analytics: {
        Row: {
          internships_indexed: number | null
          opportunities_indexed: number | null
          programmes_indexed: number | null
          scholarships_indexed: number | null
          universities_indexed: number | null
          university_countries_indexed: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_analytics: { Args: never; Returns: Json }
      get_backend_content: {
        Args: { p_keys?: string[]; p_language?: string }
        Returns: Json[]
      }
      get_public_usage_stats: { Args: never; Returns: Json }
      get_user_backend_snapshot: { Args: never; Returns: Json }
      match_international_programmes: {
        Args: { p_country_code?: string; p_qualification_code?: string }
        Returns: {
          admissions_url: string
          match_status: string
          minimum_overall_score: number
          minimum_score_operator: string
          notes: string
          programme_id: string
          programme_name: string
          programme_url: string
          qualification_code: string
          required_subjects: Json
          source_url: string
          university_id: string
          university_name: string
          verification_status: string
        }[]
      }
      platform_analytics: { Args: never; Returns: Json }
      platform_stats: { Args: never; Returns: Json }
      refresh_public_usage_counters: { Args: never; Returns: undefined }
      resolve_gpf_backend: {
        Args: { p_country_code?: string; p_language?: string }
        Returns: {
          country_code: string
          direction: string
          language_backend: string
          language_code: string
          locale: string
        }[]
      }
      save_profile_bundle: {
        Args: {
          p_account_role?: string
          p_country_code?: string
          p_email?: string
          p_full_name: string
          p_grading_scale?: string
          p_interests?: string[]
          p_linkedin_url?: string
          p_overall_score?: string
          p_pathways?: string[]
          p_qualification_code?: string
          p_qualification_metadata?: Json
          p_qualification_name?: string
          p_qualification_results?: Json
          p_region?: string
          p_school?: string
          p_target_career?: string
          p_wassce_results?: Json
          p_whatsapp_number?: string
        }
        Returns: Json
      }
      toggle_feed_like: { Args: { p_post_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "parent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["student", "parent", "admin"],
    },
  },
} as const
