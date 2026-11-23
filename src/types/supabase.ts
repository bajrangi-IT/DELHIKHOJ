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
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          ref_id: string | null
          resource: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          ref_id?: string | null
          resource: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          ref_id?: string | null
          resource?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_users_id_fk"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attractions: {
        Row: {
          created_at: string
          description: string
          id: string
          lat: number
          lng: number
          locality: string | null
          name: string
          published: boolean
          slug: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          lat: number
          lng: number
          locality?: string | null
          name: string
          published?: boolean
          slug: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          lat?: number
          lng?: number
          locality?: string | null
          name?: string
          published?: boolean
          slug?: string
          type?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          accessibility: string | null
          address: string | null
          architecture: string | null
          category: string
          created_at: string
          era: string | null
          facilities: string | null
          facts: Json
          fee: string | null
          history: string | null
          hours: string | null
          id: string
          image: string | null
          lat: number
          lng: number
          locality: string | null
          name: string
          name_hi: string | null
          published: boolean
          rules: string | null
          slug: string
          sort_order: number
          sources: Json
          summary: string
          ticket_provider: string | null
          ticket_url: string | null
          unesco: boolean
          updated_at: string
          why_visit: string | null
        }
        Insert: {
          accessibility?: string | null
          address?: string | null
          architecture?: string | null
          category?: string
          created_at?: string
          era?: string | null
          facilities?: string | null
          facts?: Json
          fee?: string | null
          history?: string | null
          hours?: string | null
          id?: string
          image?: string | null
          lat: number
          lng: number
          locality?: string | null
          name: string
          name_hi?: string | null
          published?: boolean
          rules?: string | null
          slug: string
          sort_order?: number
          sources?: Json
          summary: string
          ticket_provider?: string | null
          ticket_url?: string | null
          unesco?: boolean
          updated_at?: string
          why_visit?: string | null
        }
        Update: {
          accessibility?: string | null
          address?: string | null
          architecture?: string | null
          category?: string
          created_at?: string
          era?: string | null
          facilities?: string | null
          facts?: Json
          fee?: string | null
          history?: string | null
          hours?: string | null
          id?: string
          image?: string | null
          lat?: number
          lng?: number
          locality?: string | null
          name?: string
          name_hi?: string | null
          published?: boolean
          rules?: string | null
          slug?: string
          sort_order?: number
          sources?: Json
          summary?: string
          ticket_provider?: string | null
          ticket_url?: string | null
          unesco?: boolean
          updated_at?: string
          why_visit?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          booking_url: string | null
          created_at: string
          description: string
          ends_at: string | null
          family_friendly: boolean
          id: string
          image: string | null
          is_demo: boolean
          is_free: boolean
          lat: number | null
          lng: number | null
          locality: string | null
          organiser: string | null
          price_note: string | null
          published: boolean
          source_url: string | null
          starts_at: string
          title: string
          type: string
          venue: string
        }
        Insert: {
          booking_url?: string | null
          created_at?: string
          description: string
          ends_at?: string | null
          family_friendly?: boolean
          id?: string
          image?: string | null
          is_demo?: boolean
          is_free?: boolean
          lat?: number | null
          lng?: number | null
          locality?: string | null
          organiser?: string | null
          price_note?: string | null
          published?: boolean
          source_url?: string | null
          starts_at: string
          title: string
          type?: string
          venue: string
        }
        Update: {
          booking_url?: string | null
          created_at?: string
          description?: string
          ends_at?: string | null
          family_friendly?: boolean
          id?: string
          image?: string | null
          is_demo?: boolean
          is_free?: boolean
          lat?: number | null
          lng?: number | null
          locality?: string | null
          organiser?: string | null
          price_note?: string | null
          published?: boolean
          source_url?: string | null
          starts_at?: string
          title?: string
          type?: string
          venue?: string
        }
        Relationships: []
      }
      guide_booking_requests: {
        Row: {
          created_at: string
          destination: string | null
          group_size: number
          guide_id: string
          id: string
          message: string | null
          status: string
          time_slot: string
          tour_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          group_size?: number
          guide_id: string
          id?: string
          message?: string | null
          status?: string
          time_slot: string
          tour_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          group_size?: number
          guide_id?: string
          id?: string
          message?: string | null
          status?: string
          time_slot?: string
          tour_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_booking_requests_guide_id_guides_id_fk"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_booking_requests_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          areas: string[]
          availability: string
          badge: string
          bio: string
          contact_email: string | null
          created_at: string
          experience_years: number
          hourly_rate: number
          id: string
          image: string | null
          is_demo: boolean
          languages: string[]
          name: string
          price_note: string
          rating: number
          reviews_count: number
          specialities: string[]
          status: string
          tour_types: string[]
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          areas?: string[]
          availability?: string
          badge?: string
          bio: string
          contact_email?: string | null
          created_at?: string
          experience_years?: number
          hourly_rate?: number
          id?: string
          image?: string | null
          is_demo?: boolean
          languages?: string[]
          name: string
          price_note?: string
          rating?: number
          reviews_count?: number
          specialities?: string[]
          status?: string
          tour_types?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          areas?: string[]
          availability?: string
          badge?: string
          bio?: string
          contact_email?: string | null
          created_at?: string
          experience_years?: number
          hourly_rate?: number
          id?: string
          image?: string | null
          is_demo?: boolean
          languages?: string[]
          name?: string
          price_note?: string
          rating?: number
          reviews_count?: number
          specialities?: string[]
          status?: string
          tour_types?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "guides_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          config: Json
          created_at: string
          id: string
          stops: Json
          title: string
          trip_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          stops?: Json
          title: string
          trip_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          stops?: Json
          title?: string
          trip_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          created_at: string
          description: string
          hours: string | null
          id: string
          image: string | null
          lat: number
          lng: number
          locality: string
          name: string
          published: boolean
          slug: string
          speciality: string
        }
        Insert: {
          created_at?: string
          description: string
          hours?: string | null
          id?: string
          image?: string | null
          lat: number
          lng: number
          locality: string
          name: string
          published?: boolean
          slug: string
          speciality: string
        }
        Update: {
          created_at?: string
          description?: string
          hours?: string | null
          id?: string
          image?: string | null
          lat?: number
          lng?: number
          locality?: string
          name?: string
          published?: boolean
          slug?: string
          speciality?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          product_id: string
          quantity: number
          seller_id: string
          status: string
          total_price_inr: number
          unit_price_inr: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string
          product_id: string
          quantity?: number
          seller_id: string
          status?: string
          total_price_inr: number
          unit_price_inr: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          product_id?: string
          quantity?: number
          seller_id?: string
          status?: string
          total_price_inr?: number
          unit_price_inr?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_resets_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: string
          category: string
          created_at: string
          description: string
          id: string
          image: string | null
          name: string
          price_inr: number | null
          published: boolean
          seller_id: string
        }
        Insert: {
          availability?: string
          category?: string
          created_at?: string
          description: string
          id?: string
          image?: string | null
          name: string
          price_inr?: number | null
          published?: boolean
          seller_id: string
        }
        Update: {
          availability?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          name?: string
          price_inr?: number | null
          published?: boolean
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          kind: string
          ref_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          ref_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          ref_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          product_id: string | null
          seller_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          product_id?: string | null
          seller_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          product_id?: string | null
          seller_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_enquiries_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_enquiries_seller_id_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_enquiries_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          image: string | null
          is_demo: boolean
          locality: string
          slug: string
          status: string
          user_id: string | null
        }
        Insert: {
          business_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          image?: string | null
          is_demo?: boolean
          locality: string
          slug: string
          status?: string
          user_id?: string | null
        }
        Update: {
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          is_demo?: boolean
          locality?: string
          slug?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sellers_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_bookings: {
        Row: {
          adults: number
          booking_ref: string
          children: number
          contact_email: string
          contact_phone: string
          created_at: string
          destination_name: string
          destination_slug: string
          foreigner_count: number
          id: string
          include_guide: boolean
          slot_time: string
          status: string
          total_price_inr: number
          user_id: string
          visit_date: string
        }
        Insert: {
          adults?: number
          booking_ref: string
          children?: number
          contact_email: string
          contact_phone: string
          created_at?: string
          destination_name: string
          destination_slug: string
          foreigner_count?: number
          id?: string
          include_guide?: boolean
          slot_time?: string
          status?: string
          total_price_inr?: number
          user_id: string
          visit_date: string
        }
        Update: {
          adults?: number
          booking_ref?: string
          children?: number
          contact_email?: string
          contact_phone?: string
          created_at?: string
          destination_name?: string
          destination_slug?: string
          foreigner_count?: number
          id?: string
          include_guide?: boolean
          slot_time?: string
          status?: string
          total_price_inr?: number
          user_id?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          created_at: string
          id: string
          kind: string
          ref_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          ref_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          ref_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          interests: string[]
          is_demo: boolean
          language: string
          onboarded: boolean
          password_hash: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          interests?: string[]
          is_demo?: boolean
          language?: string
          onboarded?: boolean
          password_hash: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interests?: string[]
          is_demo?: boolean
          language?: string
          onboarded?: boolean
          password_hash?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
