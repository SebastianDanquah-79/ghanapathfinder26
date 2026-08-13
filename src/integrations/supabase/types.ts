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
          updated_at?: string
        }
        Relationships: []
      }
      programmes: {
        Row: {
          application_url: string | null
          career_opportunities: string[]
          created_at: string
          degree_type: string
          description: string | null
          duration: string | null
          entry_requirements: string | null
          field: string | null
          id: string
          last_verified_at: string | null
          name: string
          programme_url: string | null
          relevant_subjects: string[]
          slug: string
          university_id: string
          updated_at: string
          verified: boolean
          wassce_requirements: string | null
        }
        Insert: {
          application_url?: string | null
          career_opportunities?: string[]
          created_at?: string
          degree_type?: string
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          field?: string | null
          id?: string
          last_verified_at?: string | null
          name: string
          programme_url?: string | null
          relevant_subjects?: string[]
          slug: string
          university_id: string
          updated_at?: string
          verified?: boolean
          wassce_requirements?: string | null
        }
        Update: {
          application_url?: string | null
          career_opportunities?: string[]
          created_at?: string
          degree_type?: string
          description?: string | null
          duration?: string | null
          entry_requirements?: string | null
          field?: string | null
          id?: string
          last_verified_at?: string | null
          name?: string
          programme_url?: string | null
          relevant_subjects?: string[]
          slug?: string
          university_id?: string
          updated_at?: string
          verified?: boolean
          wassce_requirements?: string | null
        }
        Relationships: [
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
      universities: {
        Row: {
          admission_aggregate: string | null
          admission_info: string | null
          admissions_url: string | null
          campus_vibe: string | null
          category: string
          country: string
          created_at: string
          description: string | null
          financial_aid_url: string | null
          id: string
          last_verified_at: string | null
          location: string | null
          logo_url: string | null
          name: string
          region: string | null
          scholarship_info: string | null
          short_name: string | null
          slug: string
          top_programmes: string[]
          tuition_range: string | null
          type: string
          updated_at: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          admission_aggregate?: string | null
          admission_info?: string | null
          admissions_url?: string | null
          campus_vibe?: string | null
          category?: string
          country?: string
          created_at?: string
          description?: string | null
          financial_aid_url?: string | null
          id?: string
          last_verified_at?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          region?: string | null
          scholarship_info?: string | null
          short_name?: string | null
          slug: string
          top_programmes?: string[]
          tuition_range?: string | null
          type?: string
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          admission_aggregate?: string | null
          admission_info?: string | null
          admissions_url?: string | null
          campus_vibe?: string | null
          category?: string
          country?: string
          created_at?: string
          description?: string | null
          financial_aid_url?: string | null
          id?: string
          last_verified_at?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          region?: string | null
          scholarship_info?: string | null
          short_name?: string | null
          slug?: string
          top_programmes?: string[]
          tuition_range?: string | null
          type?: string
          updated_at?: string
          verified?: boolean
          website_url?: string | null
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
      [_ in never]: never
    }
    Functions: {
      accept_parent_invite: { Args: { _code: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_linked_parent: {
        Args: { _parent_id: string; _student_id: string }
        Returns: boolean
      }
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
