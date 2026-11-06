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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          body: string | null
          category: string
          cover_image: string | null
          created_at: string
          id: string
          is_featured: boolean
          is_published: boolean
          published_at: string
          read_time: string | null
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string
          read_time?: string | null
          slug: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string
          read_time?: string | null
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          messages: Json
          page_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          messages?: Json
          page_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          messages?: Json
          page_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          assistant_name: string
          enabled: boolean
          greeting: string
          id: boolean
          updated_at: string
        }
        Insert: {
          assistant_name?: string
          enabled?: boolean
          greeting?: string
          id?: boolean
          updated_at?: string
        }
        Update: {
          assistant_name?: string
          enabled?: boolean
          greeting?: string
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      client_logos: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          logo_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          budget: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          source: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          source?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source?: string | null
        }
        Relationships: []
      }
      form_rate_limits: {
        Row: {
          attempts: number
          key: string
          window_start: string
        }
        Insert: {
          attempts?: number
          key: string
          window_start?: string
        }
        Update: {
          attempts?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          job_opening_id: string | null
          message: string | null
          phone: string | null
          resume_path: string | null
          role_title: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_opening_id?: string | null
          message?: string | null
          phone?: string | null
          resume_path?: string | null
          role_title: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_opening_id?: string | null
          message?: string | null
          phone?: string | null
          resume_path?: string | null
          role_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_opening_id_fkey"
            columns: ["job_opening_id"]
            isOneToOne: false
            referencedRelation: "job_openings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_openings: {
        Row: {
          created_at: string
          description: string | null
          employment_type: string
          id: string
          is_open: boolean
          location: string
          sort_order: number
          team: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          employment_type?: string
          id?: string
          is_open?: boolean
          location?: string
          sort_order?: number
          team: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          employment_type?: string
          id?: string
          is_open?: boolean
          location?: string
          sort_order?: number
          team?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consent_at: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          consent_at?: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          consent_at?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          company: string
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string
          partnership_type: string | null
          phone: string | null
          website: string | null
        }
        Insert: {
          company: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message: string
          partnership_type?: string | null
          phone?: string | null
          website?: string | null
        }
        Update: {
          company?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          partnership_type?: string | null
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      popup_campaigns: {
        Row: {
          cooldown_days: number
          created_at: string
          cta_path: string
          cta_text: string
          delay_seconds: number
          description: string
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          kind: string
          name: string
          scroll_percent: number
          sort_order: number
          starts_at: string | null
          target_path: string
          title: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          cooldown_days?: number
          created_at?: string
          cta_path?: string
          cta_text?: string
          delay_seconds?: number
          description: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          kind?: string
          name: string
          scroll_percent?: number
          sort_order?: number
          starts_at?: string | null
          target_path?: string
          title: string
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          cooldown_days?: number
          created_at?: string
          cta_path?: string
          cta_text?: string
          delay_seconds?: number
          description?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          kind?: string
          name?: string
          scroll_percent?: number
          sort_order?: number
          starts_at?: string | null
          target_path?: string
          title?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          name: string
          quote: string
          role: string | null
          sort_order: number
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          name: string
          quote: string
          role?: string | null
          sort_order?: number
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          name?: string
          quote?: string
          role?: string | null
          sort_order?: number
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
      work_projects: {
        Row: {
          body: string | null
          category: string
          client: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          result: string | null
          slug: string | null
          sort_order: number
          summary: string
          title: string
        }
        Insert: {
          body?: string | null
          category?: string
          client: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          result?: string | null
          slug?: string | null
          sort_order?: number
          summary: string
          title: string
        }
        Update: {
          body?: string | null
          category?: string
          client?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          result?: string | null
          slug?: string | null
          sort_order?: number
          summary?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_form_limit: { Args: { limit_key: string }; Returns: boolean }
      consume_rate_limit: {
        Args: { limit_key: string; max_attempts: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
