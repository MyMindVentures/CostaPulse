export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      app_healthchecks: {
        Row: {
          created_at: string;
          description: string;
          last_verified_at: string | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          last_verified_at?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          last_verified_at?: string | null;
          name?: string;
        };
        Relationships: [];
      };
      availability_slots: {
        Row: {
          capacity_reserved: number;
          capacity_total: number;
          created_at: string;
          ends_at: string;
          experience_id: string;
          experience_variant_id: string;
          held_until: string | null;
          id: string;
          notes: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["availability_status"];
          timezone: string;
          updated_at: string;
        };
        Insert: {
          capacity_reserved?: number;
          capacity_total: number;
          created_at?: string;
          ends_at: string;
          experience_id: string;
          experience_variant_id: string;
          held_until?: string | null;
          id?: string;
          notes?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["availability_status"];
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          capacity_reserved?: number;
          capacity_total?: number;
          created_at?: string;
          ends_at?: string;
          experience_id?: string;
          experience_variant_id?: string;
          held_until?: string | null;
          id?: string;
          notes?: string | null;
          starts_at?: string;
          status?: Database["public"]["Enums"]["availability_status"];
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_slots_experience_variant_fk";
            columns: ["experience_variant_id", "experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_variants";
            referencedColumns: ["id", "experience_id"];
          }
        ];
      };
      bookings: {
        Row: {
          availability_slot_id: string | null;
          booked_at: string | null;
          booking_reference: string;
          cancelled_at: string | null;
          completed_at: string | null;
          confirmed_at: string | null;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_profile_id: string | null;
          experience_id: string;
          experience_variant_id: string;
          id: string;
          metadata: Json;
          participant_notes: string | null;
          partner_id: string | null;
          party_size: number;
          payment_status: Database["public"]["Enums"]["payment_status"];
          referral_id: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          subtotal_amount_minor: number;
          total_amount_minor: number;
          unit_amount_minor: number;
          updated_at: string;
          voucher_amount_minor: number;
        };
        Insert: {
          availability_slot_id?: string | null;
          booked_at?: string | null;
          booking_reference?: string;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          currency: string;
          customer_email: string;
          customer_profile_id?: string | null;
          experience_id: string;
          experience_variant_id: string;
          id?: string;
          metadata?: Json;
          participant_notes?: string | null;
          partner_id?: string | null;
          party_size: number;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          referral_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          subtotal_amount_minor: number;
          total_amount_minor: number;
          unit_amount_minor: number;
          updated_at?: string;
          voucher_amount_minor?: number;
        };
        Update: {
          availability_slot_id?: string | null;
          booked_at?: string | null;
          booking_reference?: string;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          currency?: string;
          customer_email?: string;
          customer_profile_id?: string | null;
          experience_id?: string;
          experience_variant_id?: string;
          id?: string;
          metadata?: Json;
          participant_notes?: string | null;
          partner_id?: string | null;
          party_size?: number;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          referral_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          subtotal_amount_minor?: number;
          total_amount_minor?: number;
          unit_amount_minor?: number;
          updated_at?: string;
          voucher_amount_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "availability_slots";
            referencedColumns: ["id", "experience_variant_id"];
          },
          {
            foreignKeyName: "bookings_customer_profile_id_fkey";
            columns: ["customer_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_experience_variant_fk";
            columns: ["experience_variant_id", "experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_variants";
            referencedColumns: ["id", "experience_id"];
          },
          {
            foreignKeyName: "bookings_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_referral_id_fkey";
            columns: ["referral_id"];
            isOneToOne: false;
            referencedRelation: "referrals";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_variants: {
        Row: {
          created_at: string;
          currency: string;
          description: string | null;
          experience_id: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          max_party_size: number | null;
          min_party_size: number;
          name: string;
          pricing_model: Database["public"]["Enums"]["variant_pricing_model"];
          slug: string;
          unit_amount_minor: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency: string;
          description?: string | null;
          experience_id: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          max_party_size?: number | null;
          min_party_size?: number;
          name: string;
          pricing_model?: Database["public"]["Enums"]["variant_pricing_model"];
          slug: string;
          unit_amount_minor: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          experience_id?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          max_party_size?: number | null;
          min_party_size?: number;
          name?: string;
          pricing_model?: Database["public"]["Enums"]["variant_pricing_model"];
          slug?: string;
          unit_amount_minor?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_variants_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      experiences: {
        Row: {
          base_capacity: number;
          base_currency: string;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          hero_image_path: string | null;
          id: string;
          location_name: string | null;
          manual_confirmation_required: boolean;
          provider_profile_id: string | null;
          short_description: string | null;
          slug: string;
          status: Database["public"]["Enums"]["publication_status"];
          timezone: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          base_capacity: number;
          base_currency: string;
          created_at?: string;
          description?: string | null;
          duration_minutes: number;
          hero_image_path?: string | null;
          id?: string;
          location_name?: string | null;
          manual_confirmation_required?: boolean;
          provider_profile_id?: string | null;
          short_description?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["publication_status"];
          timezone?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          base_capacity?: number;
          base_currency?: string;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          hero_image_path?: string | null;
          id?: string;
          location_name?: string | null;
          manual_confirmation_required?: boolean;
          provider_profile_id?: string | null;
          short_description?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["publication_status"];
          timezone?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experiences_provider_profile_id_fkey";
            columns: ["provider_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      partners: {
        Row: {
          attribution_window_hours: number;
          created_at: string;
          id: string;
          name: string;
          owner_profile_id: string | null;
          referral_code: string;
          slug: string;
          status: Database["public"]["Enums"]["partner_status"];
          updated_at: string;
          voucher_percent_basis_points: number;
          website_url: string | null;
        };
        Insert: {
          attribution_window_hours?: number;
          created_at?: string;
          id?: string;
          name: string;
          owner_profile_id?: string | null;
          referral_code?: string;
          slug: string;
          status?: Database["public"]["Enums"]["partner_status"];
          updated_at?: string;
          voucher_percent_basis_points?: number;
          website_url?: string | null;
        };
        Update: {
          attribution_window_hours?: number;
          created_at?: string;
          id?: string;
          name?: string;
          owner_profile_id?: string | null;
          referral_code?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["partner_status"];
          updated_at?: string;
          voucher_percent_basis_points?: number;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "partners_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_events: {
        Row: {
          booking_id: string | null;
          created_at: string;
          id: string;
          payload: Json;
          processed_at: string | null;
          stripe_event_id: string;
          stripe_event_type: string;
        };
        Insert: {
          booking_id?: string | null;
          created_at?: string;
          id?: string;
          payload: Json;
          processed_at?: string | null;
          stripe_event_id: string;
          stripe_event_type: string;
        };
        Update: {
          booking_id?: string | null;
          created_at?: string;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          stripe_event_id?: string;
          stripe_event_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          phone: string | null;
          preferred_locale: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          phone?: string | null;
          preferred_locale?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          phone?: string | null;
          preferred_locale?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          attributed_at: string;
          code: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          landing_path: string | null;
          locked_at: string | null;
          metadata: Json;
          partner_id: string;
          status: Database["public"]["Enums"]["referral_status"];
          updated_at: string;
          visitor_token: string | null;
        };
        Insert: {
          attributed_at?: string;
          code?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          landing_path?: string | null;
          locked_at?: string | null;
          metadata?: Json;
          partner_id: string;
          status?: Database["public"]["Enums"]["referral_status"];
          updated_at?: string;
          visitor_token?: string | null;
        };
        Update: {
          attributed_at?: string;
          code?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          landing_path?: string | null;
          locked_at?: string | null;
          metadata?: Json;
          partner_id?: string;
          status?: Database["public"]["Enums"]["referral_status"];
          updated_at?: string;
          visitor_token?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          granted_at: string;
          granted_by: string | null;
          profile_id: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          granted_at?: string;
          granted_by?: string | null;
          profile_id: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          granted_at?: string;
          granted_by?: string | null;
          profile_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      vouchers: {
        Row: {
          booking_id: string;
          code: string;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_profile_id: string | null;
          expires_at: string | null;
          id: string;
          issued_at: string;
          metadata: Json;
          partner_id: string;
          qualifying_amount_minor: number;
          redeemed_at: string | null;
          redemption_notes: string | null;
          status: Database["public"]["Enums"]["voucher_status"];
          updated_at: string;
          voucher_amount_minor: number;
        };
        Insert: {
          booking_id: string;
          code?: string;
          created_at?: string;
          currency: string;
          customer_email: string;
          customer_profile_id?: string | null;
          expires_at?: string | null;
          id?: string;
          issued_at?: string;
          metadata?: Json;
          partner_id: string;
          qualifying_amount_minor: number;
          redeemed_at?: string | null;
          redemption_notes?: string | null;
          status?: Database["public"]["Enums"]["voucher_status"];
          updated_at?: string;
          voucher_amount_minor: number;
        };
        Update: {
          booking_id?: string;
          code?: string;
          created_at?: string;
          currency?: string;
          customer_email?: string;
          customer_profile_id?: string | null;
          expires_at?: string | null;
          id?: string;
          issued_at?: string;
          metadata?: Json;
          partner_id?: string;
          qualifying_amount_minor?: number;
          redeemed_at?: string | null;
          redemption_notes?: string | null;
          status?: Database["public"]["Enums"]["voucher_status"];
          updated_at?: string;
          voucher_amount_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "vouchers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_customer_profile_id_fkey";
            columns: ["customer_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_public_code: { Args: { prefix?: string }; Returns: string };
    };
    Enums: {
      app_role:
        | "customer"
        | "experience_provider"
        | "team_member"
        | "partner"
        | "operations_staff"
        | "customer_support"
        | "finance_manager"
        | "content_manager"
        | "administrator"
        | "super_administrator";
      availability_status:
        | "scheduled"
        | "sold_out"
        | "unavailable"
        | "cancelled"
        | "completed";
      booking_status:
        | "draft"
        | "pending_payment"
        | "payment_processing"
        | "confirmed"
        | "pending_manual_confirmation"
        | "cancelled"
        | "completed"
        | "refunded"
        | "partially_refunded"
        | "no_show";
      partner_status: "draft" | "active" | "disabled";
      payment_status:
        | "unpaid"
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded";
      publication_status: "draft" | "published" | "archived";
      referral_status: "active" | "locked" | "expired" | "cancelled";
      variant_pricing_model: "per_person" | "per_group";
      voucher_status: "issued" | "redeemed" | "expired" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "customer",
        "experience_provider",
        "team_member",
        "partner",
        "operations_staff",
        "customer_support",
        "finance_manager",
        "content_manager",
        "administrator",
        "super_administrator"
      ],
      availability_status: [
        "scheduled",
        "sold_out",
        "unavailable",
        "cancelled",
        "completed"
      ],
      booking_status: [
        "draft",
        "pending_payment",
        "payment_processing",
        "confirmed",
        "pending_manual_confirmation",
        "cancelled",
        "completed",
        "refunded",
        "partially_refunded",
        "no_show"
      ],
      partner_status: ["draft", "active", "disabled"],
      payment_status: [
        "unpaid",
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "partially_refunded"
      ],
      publication_status: ["draft", "published", "archived"],
      referral_status: ["active", "locked", "expired", "cancelled"],
      variant_pricing_model: ["per_person", "per_group"],
      voucher_status: ["issued", "redeemed", "expired", "cancelled"]
    }
  }
} as const;
