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
    PostgrestVersion: "14.17"
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
          details: string | null
          id: string
          insight_id: string
          reason: string
          reporter_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          insight_id: string
          reason: string
          reporter_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          insight_id?: string
          reason?: string
          reporter_id?: string | null
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
      internships: {
        Row: {
          application_url: string | null
          careers: string[]
          company_id: string | null
          created_at: string
          deadline_date: string | null
          deadline_text: string | null
          description: string | null
          duration: string | null
          eligibility: string | null
          fields: string[]
          id: string
          last_verified_at: string | null
          location: string | null
          opportunity_type: string
          paid: boolean | null
          region: string | null
          slug: string
          source_url: string | null
          stipend_text: string | null
          title: string
          updated_at: string
          verified: boolean
          work_mode: string
        }
        Insert: {
          application_url?: string | null
          careers?: string[]
          company_id?: string | null
          created_at?: string
          deadline_date?: string | null
          deadline_text?: string | null
          description?: string | null
          duration?: string | null
          eligibility?: string | null
          fields?: string[]
          id?: string
          last_verified_at?: string | null
          location?: string | null
          opportunity_type?: string
          paid?: boolean | null
          region?: string | null
          slug: string
          source_url?: string | null
          stipend_text?: string | null
          title: string
          updated_at?: string
          verified?: boolean
          work_mode?: string
        }
        Update: {
          application_url?: string | null
          careers?: string[]
          company_id?: string | null
          created_at?: string
          deadline_date?: string | null
          deadline_text?: string | null
          description?: string | null
          duration?: string | null
          eligibility?: string | null
          fields?: string[]
          id?: string
          last_verified_at?: string | null
          location?: string | null
          opportunity_type?: string
          paid?: boolean | null
          region?: string | null
          slug?: string
          source_url?: string | null
          stipend_text?: string | null
          title?: string
          updated_at?: string
          verified?: boolean
          work_mode?: string
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
      logo_requests: {
        Row: {
          created_at: string
          id: string
          note: string | null
          organisation_name: string
          requested_by: string | null
          status: string
          suggested_url: string | null
          university_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          organisation_name: string
          requested_by?: string | null
          status?: string
          suggested_url?: string | null
          university_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          organisation_name?: string
          requested_by?: string | null
          status?: string
          suggested_url?: string | null
          university_id?: string | null
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
          field: string
          funding_types: string[]
          gender: string
          level: string
          min_coverage: string
          need_based: boolean
          region: string | null
          study_abroad: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field?: string
          funding_types?: string[]
          gender?: string
          level?: string
          min_coverage?: string
          need_based?: boolean
          region?: string | null
          study_abroad?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field?: string
          funding_types?: string[]
          gender?: string
          level?: string
          min_coverage?: string
          need_based?: boolean
          region?: string | null
          study_abroad?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      occupation_salaries: {
        Row: {
          created_at: string
          data_source: string
          experience_level: string
          last_verified: string
          occupation: string
          salary_period: string
          salary_range: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_source?: string
          experience_level?: string
          last_verified?: string
          occupation: string
          salary_period?: string
          salary_range: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_source?: string
          experience_level?: string
          last_verified?: string
          occupation?: string
          salary_period?: string
          salary_range?: string
          updated_at?: string
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
          invite_code?: string
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
      profiles: {
        Row: {
          account_type: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interests: string[]
          onboarded: boolean
          region: string | null
          school: string | null
          target_career: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[]
          onboarded?: boolean
          region?: string | null
          school?: string | null
          target_career?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[]
          onboarded?: boolean
          region?: string | null
          school?: string | null
          target_career?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programme_admission_estimates: {
        Row: {
          confidence_level: string
          created_at: string
          estimate_high: number
          estimate_low: number
          evidence: string
          id: string
          method: string
          programme_id: string
          sample_size: number
          university_id: string
          updated_at: string
        }
        Insert: {
          confidence_level?: string
          created_at?: string
          estimate_high: number
          estimate_low: number
          evidence: string
          id?: string
          method: string
          programme_id: string
          sample_size?: number
          university_id: string
          updated_at?: string
        }
        Update: {
          confidence_level?: string
          created_at?: string
          estimate_high?: number
          estimate_low?: number
          evidence?: string
          id?: string
          method?: string
          programme_id?: string
          sample_size?: number
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_admission_estimates_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: true
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
          created_at: string
          description: string | null
          id: string
          last_verified: string | null
          licence_note: string | null
          occupation: string
          programme_id: string
          salary_data_source: string | null
          salary_experience_level: string | null
          salary_period: string | null
          salary_range: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_verified?: string | null
          licence_note?: string | null
          occupation: string
          programme_id: string
          salary_data_source?: string | null
          salary_experience_level?: string | null
          salary_period?: string | null
          salary_range?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_verified?: string | null
          licence_note?: string | null
          occupation?: string
          programme_id?: string
          salary_data_source?: string | null
          salary_experience_level?: string | null
          salary_period?: string | null
          salary_range?: string | null
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
          courses: string[]
          created_at: string
          id: string
          note: string | null
          position: number
          programme_id: string
          source: string
          updated_at: string
          year_label: string
        }
        Insert: {
          courses?: string[]
          created_at?: string
          id?: string
          note?: string | null
          position?: number
          programme_id: string
          source?: string
          updated_at?: string
          year_label: string
        }
        Update: {
          courses?: string[]
          created_at?: string
          id?: string
          note?: string | null
          position?: number
          programme_id?: string
          source?: string
          updated_at?: string
          year_label?: string
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
          academic_year: string
          admission_notes: string | null
          applicant_category: string
          created_at: string
          cut_off_aggregate: number | null
          id: string
          last_verified_at: string | null
          minimum_grades: Json
          official_source_url: string | null
          programme_id: string | null
          programme_name: string
          source_name: string | null
          source_type: string
          subject_requirements: string | null
          university_id: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          academic_year: string
          admission_notes?: string | null
          applicant_category?: string
          created_at?: string
          cut_off_aggregate?: number | null
          id?: string
          last_verified_at?: string | null
          minimum_grades?: Json
          official_source_url?: string | null
          programme_id?: string | null
          programme_name: string
          source_name?: string | null
          source_type?: string
          subject_requirements?: string | null
          university_id: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          academic_year?: string
          admission_notes?: string | null
          applicant_category?: string
          created_at?: string
          cut_off_aggregate?: number | null
          id?: string
          last_verified_at?: string | null
          minimum_grades?: Json
          official_source_url?: string | null
          programme_id?: string | null
          programme_name?: string
          source_name?: string | null
          source_type?: string
          subject_requirements?: string | null
          university_id?: string
          updated_at?: string
          verification_status?: string
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
          admin_note: string | null
          comment: string | null
          created_at: string
          id: string
          issue_type: string
          programme_id: string
          rating: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          issue_type?: string
          programme_id: string
          rating: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          issue_type?: string
          programme_id?: string
          rating?: number
          status?: string
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
          about: string
          academic_difficulty: string
          careers: Json
          created_at: string
          field: string
          job_market: string
          short_bio: string
          study_areas: string[]
          updated_at: string
          why_choose: string
        }
        Insert: {
          about: string
          academic_difficulty?: string
          careers?: Json
          created_at?: string
          field: string
          job_market: string
          short_bio: string
          study_areas?: string[]
          updated_at?: string
          why_choose: string
        }
        Update: {
          about?: string
          academic_difficulty?: string
          careers?: Json
          created_at?: string
          field?: string
          job_market?: string
          short_bio?: string
          study_areas?: string[]
          updated_at?: string
          why_choose?: string
        }
        Relationships: []
      }
      programme_information: {
        Row: {
          academic_difficulty: string | null
          career_opportunities: string[]
          content_scope: string
          created_at: string
          description: string | null
          id: string
          job_market: string | null
          last_updated: string
          programme_id: string
          short_bio: string | null
          source: string | null
          study_areas: string[]
          updated_at: string
          why_choose: string | null
        }
        Insert: {
          academic_difficulty?: string | null
          career_opportunities?: string[]
          content_scope?: string
          created_at?: string
          description?: string | null
          id?: string
          job_market?: string | null
          last_updated?: string
          programme_id: string
          short_bio?: string | null
          source?: string | null
          study_areas?: string[]
          updated_at?: string
          why_choose?: string | null
        }
        Update: {
          academic_difficulty?: string | null
          career_opportunities?: string[]
          content_scope?: string
          created_at?: string
          description?: string | null
          id?: string
          job_market?: string | null
          last_updated?: string
          programme_id?: string
          short_bio?: string | null
          source?: string | null
          study_areas?: string[]
          updated_at?: string
          why_choose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_information_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: true
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_requirements: {
        Row: {
          additional_requirement: string | null
          aggregate_requirement: number | null
          created_at: string
          id: string
          minimum_grade: string | null
          programme_id: string
          required_subject: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          additional_requirement?: string | null
          aggregate_requirement?: number | null
          created_at?: string
          id?: string
          minimum_grade?: string | null
          programme_id: string
          required_subject: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          additional_requirement?: string | null
          aggregate_requirement?: number | null
          created_at?: string
          id?: string
          minimum_grade?: string | null
          programme_id?: string
          required_subject?: string
          source_url?: string | null
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
          source_type: string
          source_url: string
          verification_status: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          programme_id: string
          source_type?: string
          source_url: string
          verification_status?: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          programme_id?: string
          source_type?: string
          source_url?: string
          verification_status?: string
          verified_at?: string
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
          career_opportunities: string[]
          created_at: string
          degree_type: string
          description: string | null
          duration: string | null
          entry_requirements: string | null
          faculty_id: string | null
          field: string | null
          id: string
          last_verified_at: string | null
          name: string
          programme_url: string | null
          qualification: string | null
          relevant_subjects: string[]
          slug: string
          source_url: string | null
          university_id: string
          updated_at: string
          verification_status: string
          verified: boolean
          wassce_requirements: string | null
        }
        Insert: {
          academic_year?: string | null
          application_url?: string | null
          career_opportunities?: string[]
          created_at?: string
          degree_type?: string
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          faculty_id?: string | null
          field?: string | null
          id?: string
          last_verified_at?: string | null
          name: string
          programme_url?: string | null
          qualification?: string | null
          relevant_subjects?: string[]
          slug: string
          source_url?: string | null
          university_id: string
          updated_at?: string
          verification_status?: string
          verified?: boolean
          wassce_requirements?: string | null
        }
        Update: {
          academic_year?: string | null
          application_url?: string | null
          career_opportunities?: string[]
          created_at?: string
          degree_type?: string
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          faculty_id?: string | null
          field?: string | null
          id?: string
          last_verified_at?: string | null
          name?: string
          programme_url?: string | null
          qualification?: string | null
          relevant_subjects?: string[]
          slug?: string
          source_url?: string | null
          university_id?: string
          updated_at?: string
          verification_status?: string
          verified?: boolean
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
      scholarship_applications: {
        Row: {
          created_at: string
          deadline: string | null
          id: string
          link: string | null
          notes: string | null
          provider: string | null
          scholarship_name: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          provider?: string | null
          scholarship_name: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          provider?: string | null
          scholarship_name?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          academic_requirements: string | null
          application_url: string | null
          coverage: string | null
          created_at: string
          deadline_date: string | null
          deadline_text: string | null
          description: string | null
          eligibility: string | null
          fields: string[]
          funding_type: string | null
          how_to_apply: string | null
          id: string
          last_verified_at: string | null
          location: string | null
          name: string
          nationality_requirement: string | null
          provider: string | null
          slug: string
          study_level: string | null
          type: string
          updated_at: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          academic_requirements?: string | null
          application_url?: string | null
          coverage?: string | null
          created_at?: string
          deadline_date?: string | null
          deadline_text?: string | null
          description?: string | null
          eligibility?: string | null
          fields?: string[]
          funding_type?: string | null
          how_to_apply?: string | null
          id?: string
          last_verified_at?: string | null
          location?: string | null
          name: string
          nationality_requirement?: string | null
          provider?: string | null
          slug: string
          study_level?: string | null
          type?: string
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          academic_requirements?: string | null
          application_url?: string | null
          coverage?: string | null
          created_at?: string
          deadline_date?: string | null
          deadline_text?: string | null
          description?: string | null
          eligibility?: string | null
          fields?: string[]
          funding_type?: string | null
          how_to_apply?: string | null
          id?: string
          last_verified_at?: string | null
          location?: string | null
          name?: string
          nationality_requirement?: string | null
          provider?: string | null
          slug?: string
          study_level?: string | null
          type?: string
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      site_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_insights: {
        Row: {
          advice: string | null
          body: string
          category: string
          created_at: string
          helpful_count: number
          id: string
          image_paths: string[]
          programme: string | null
          rating: number | null
          status: string
          student_status: string
          university_id: string
          updated_at: string
          user_id: string
          wish_i_knew: string | null
          year_of_study: string | null
        }
        Insert: {
          advice?: string | null
          body: string
          category?: string
          created_at?: string
          helpful_count?: number
          id?: string
          image_paths?: string[]
          programme?: string | null
          rating?: number | null
          status?: string
          student_status?: string
          university_id: string
          updated_at?: string
          user_id: string
          wish_i_knew?: string | null
          year_of_study?: string | null
        }
        Update: {
          advice?: string | null
          body?: string
          category?: string
          created_at?: string
          helpful_count?: number
          id?: string
          image_paths?: string[]
          programme?: string | null
          rating?: number | null
          status?: string
          student_status?: string
          university_id?: string
          updated_at?: string
          user_id?: string
          wish_i_knew?: string | null
          year_of_study?: string | null
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
      universities: {
        Row: {
          accreditation_expiry_date: string | null
          accreditation_start_date: string | null
          accreditation_status: string
          admission_aggregate: string | null
          admission_info: string | null
          admissions_url: string | null
          aliases: string[]
          campus_vibe: string | null
          category: string
          country: string
          created_at: string
          delivery_mode: string
          description: string | null
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
          top_programmes: string[]
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
          admission_aggregate?: string | null
          admission_info?: string | null
          admissions_url?: string | null
          aliases?: string[]
          campus_vibe?: string | null
          category?: string
          country?: string
          created_at?: string
          delivery_mode?: string
          description?: string | null
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
          top_programmes?: string[]
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
          admission_aggregate?: string | null
          admission_info?: string | null
          admissions_url?: string | null
          aliases?: string[]
          campus_vibe?: string | null
          category?: string
          country?: string
          created_at?: string
          delivery_mode?: string
          description?: string | null
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
          top_programmes?: string[]
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
          id: string
          metric: string
          recommendation_runs: number
          students: number
          updated_at: string
          website_visits: number
        }
        Insert: {
          active_students?: number
          id: string
          metric?: string
          recommendation_runs?: number
          students?: number
          updated_at?: string
          website_visits?: number
        }
        Update: {
          active_students?: number
          id?: string
          metric?: string
          recommendation_runs?: number
          students?: number
          updated_at?: string
          website_visits?: number
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
      programme_facets: {
        Row: {
          count: number | null
          kind: string | null
          value: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_parent_invite: { Args: { _code: string }; Returns: string }
      admin_analytics: { Args: never; Returns: Json }
      admission_reference: {
        Args: { _limit?: number; _q?: string; _university_id?: string }
        Returns: {
          academic_year: string
          applicant_category: string
          basis: string
          degree_type: string
          entry_requirements: string
          estimate_confidence: string
          estimate_evidence: string
          estimate_high: number
          estimate_low: number
          estimate_method: string
          field: string
          last_verified_at: string
          official_cutoff: number
          official_source_url: string
          programme_id: string
          programme_name: string
          programme_slug: string
          region: string
          source_name: string
          subject_requirements: string
          university_category: string
          university_id: string
          university_name: string
          university_short: string
          university_slug: string
          university_type: string
        }[]
      }
      apply_occupation_salaries: {
        Args: { _programme_id?: string }
        Returns: undefined
      }
      apply_programme_curriculum: {
        Args: { _programme_id: string }
        Returns: undefined
      }
      apply_programme_information: {
        Args: { _programme_id: string }
        Returns: undefined
      }
      end_session: { Args: { _session_id: string }; Returns: undefined }
      find_duplicate_institution: {
        Args: { _name: string }
        Returns: {
          id: string
          name: string
          similarity: number
          slug: string
        }[]
      }
      gen_invite_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      heartbeat_session: { Args: { _session_id: string }; Returns: number }
      institution_tier_offset: {
        Args: { _category: string; _short: string; _type: string }
        Returns: number
      }
      is_linked_parent: {
        Args: { _parent_id: string; _student_id: string }
        Returns: boolean
      }
      live_presence: { Args: never; Returns: Json }
      public_usage_stats: { Args: never; Returns: Json }
      refresh_admission_estimates: { Args: never; Returns: number }
      refresh_usage_counters: { Args: never; Returns: undefined }
      search_catalogue: {
        Args: { _kind?: string; _limit?: number; _offset?: number; _q: string }
        Returns: {
          id: string
          kind: string
          meta: Json
          score: number
          slug: string
          subtitle: string
          title: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      site_rating_summary: { Args: never; Returns: Json }
      toggle_comment_like: { Args: { _comment_id: string }; Returns: Json }
      toggle_insight_helpful: { Args: { _insight_id: string }; Returns: Json }
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
      app_role: ["student", "parent", "admin"],
    },
  },
} as const
