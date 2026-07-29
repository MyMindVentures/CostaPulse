export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string;
          actor_profile_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          entity_id: string | null;
          entity_type: string;
          id: number;
          ip_address: unknown;
          occurred_at: string;
          reason: string | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_profile_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          entity_id?: string | null;
          entity_type: string;
          id?: never;
          ip_address?: unknown;
          occurred_at?: string;
          reason?: string | null;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_profile_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: never;
          ip_address?: unknown;
          occurred_at?: string;
          reason?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_profile_id_fkey";
            columns: ["actor_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
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
      availability_exceptions: {
        Row: {
          created_at: string;
          ends_at: string | null;
          exception_date: string;
          experience_id: string;
          id: string;
          reason: string | null;
          starts_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at?: string | null;
          exception_date: string;
          experience_id: string;
          id?: string;
          reason?: string | null;
          starts_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string | null;
          exception_date?: string;
          experience_id?: string;
          id?: string;
          reason?: string | null;
          starts_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_exceptions_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_exceptions_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "availability_exceptions_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "availability_exceptions_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      availability_slot_team_members: {
        Row: {
          availability_slot_id: string;
          created_at: string;
          is_primary: boolean;
          role_label: string;
          team_member_id: string;
        };
        Insert: {
          availability_slot_id: string;
          created_at?: string;
          is_primary?: boolean;
          role_label?: string;
          team_member_id: string;
        };
        Update: {
          availability_slot_id?: string;
          created_at?: string;
          is_primary?: boolean;
          role_label?: string;
          team_member_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_slot_team_members_availability_slot_id_fkey";
            columns: ["availability_slot_id"];
            isOneToOne: false;
            referencedRelation: "admin_capacity_calendar";
            referencedColumns: ["availability_slot_id"];
          },
          {
            foreignKeyName: "availability_slot_team_members_availability_slot_id_fkey";
            columns: ["availability_slot_id"];
            isOneToOne: false;
            referencedRelation: "availability_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_slot_team_members_availability_slot_id_fkey";
            columns: ["availability_slot_id"];
            isOneToOne: false;
            referencedRelation: "booking_availability";
            referencedColumns: ["availability_slot_id"];
          },
          {
            foreignKeyName: "availability_slot_team_members_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_member_profile_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_slot_team_members_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          }
        ];
      };
      availability_slots: {
        Row: {
          booking_cutoff_at: string | null;
          capacity_reserved: number;
          capacity_total: number;
          created_at: string;
          ends_at: string;
          experience_id: string;
          experience_variant_id: string;
          held_until: string | null;
          id: string;
          is_instant_confirmation: boolean;
          location_id: string | null;
          notes: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["availability_status"];
          timezone: string;
          updated_at: string;
        };
        Insert: {
          booking_cutoff_at?: string | null;
          capacity_reserved?: number;
          capacity_total: number;
          created_at?: string;
          ends_at: string;
          experience_id: string;
          experience_variant_id: string;
          held_until?: string | null;
          id?: string;
          is_instant_confirmation?: boolean;
          location_id?: string | null;
          notes?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["availability_status"];
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          booking_cutoff_at?: string | null;
          capacity_reserved?: number;
          capacity_total?: number;
          created_at?: string;
          ends_at?: string;
          experience_id?: string;
          experience_variant_id?: string;
          held_until?: string | null;
          id?: string;
          is_instant_confirmation?: boolean;
          location_id?: string | null;
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
          },
          {
            foreignKeyName: "availability_slots_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "availability_slots_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_addons: {
        Row: {
          addon_id: string;
          booking_id: string;
          created_at: string;
          id: string;
          quantity: number;
          total_amount_minor: number | null;
          unit_amount_minor: number;
        };
        Insert: {
          addon_id: string;
          booking_id: string;
          created_at?: string;
          id?: string;
          quantity?: number;
          total_amount_minor?: number | null;
          unit_amount_minor: number;
        };
        Update: {
          addon_id?: string;
          booking_id?: string;
          created_at?: string;
          id?: string;
          quantity?: number;
          total_amount_minor?: number | null;
          unit_amount_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "booking_addons_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "experience_addons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_contact_events: {
        Row: {
          booking_id: string;
          channel: string;
          event_type: string;
          id: number;
          occurred_at: string;
          payload: Json;
          provider_message_id: string | null;
          recipient: string | null;
          status: string;
        };
        Insert: {
          booking_id: string;
          channel: string;
          event_type: string;
          id?: never;
          occurred_at?: string;
          payload?: Json;
          provider_message_id?: string | null;
          recipient?: string | null;
          status?: string;
        };
        Update: {
          booking_id?: string;
          channel?: string;
          event_type?: string;
          id?: never;
          occurred_at?: string;
          payload?: Json;
          provider_message_id?: string | null;
          recipient?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_contact_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_contact_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_contact_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_holds: {
        Row: {
          anonymous_session_id: string | null;
          availability_slot_id: string;
          booking_id: string | null;
          converted_at: string | null;
          created_at: string;
          customer_profile_id: string | null;
          expires_at: string;
          hold_token: string;
          id: string;
          party_size: number;
          released_at: string | null;
        };
        Insert: {
          anonymous_session_id?: string | null;
          availability_slot_id: string;
          booking_id?: string | null;
          converted_at?: string | null;
          created_at?: string;
          customer_profile_id?: string | null;
          expires_at: string;
          hold_token?: string;
          id?: string;
          party_size: number;
          released_at?: string | null;
        };
        Update: {
          anonymous_session_id?: string | null;
          availability_slot_id?: string;
          booking_id?: string | null;
          converted_at?: string | null;
          created_at?: string;
          customer_profile_id?: string | null;
          expires_at?: string;
          hold_token?: string;
          id?: string;
          party_size?: number;
          released_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "booking_holds_availability_slot_id_fkey";
            columns: ["availability_slot_id"];
            isOneToOne: false;
            referencedRelation: "admin_capacity_calendar";
            referencedColumns: ["availability_slot_id"];
          },
          {
            foreignKeyName: "booking_holds_availability_slot_id_fkey";
            columns: ["availability_slot_id"];
            isOneToOne: false;
            referencedRelation: "availability_slots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_holds_availability_slot_id_fkey";
            columns: ["availability_slot_id"];
            isOneToOne: false;
            referencedRelation: "booking_availability";
            referencedColumns: ["availability_slot_id"];
          },
          {
            foreignKeyName: "booking_holds_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_holds_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_holds_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_holds_customer_profile_id_fkey";
            columns: ["customer_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_participants: {
        Row: {
          accessibility_notes: string | null;
          booking_id: string;
          created_at: string;
          date_of_birth: string | null;
          dietary_notes: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          first_name: string;
          id: string;
          is_lead: boolean;
          last_name: string | null;
          medical_notes: string | null;
          participant_number: number | null;
          phone: string | null;
          updated_at: string;
          waiver_status: string;
        };
        Insert: {
          accessibility_notes?: string | null;
          booking_id: string;
          created_at?: string;
          date_of_birth?: string | null;
          dietary_notes?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          first_name: string;
          id?: string;
          is_lead?: boolean;
          last_name?: string | null;
          medical_notes?: string | null;
          participant_number?: number | null;
          phone?: string | null;
          updated_at?: string;
          waiver_status?: string;
        };
        Update: {
          accessibility_notes?: string | null;
          booking_id?: string;
          created_at?: string;
          date_of_birth?: string | null;
          dietary_notes?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          first_name?: string;
          id?: string;
          is_lead?: boolean;
          last_name?: string | null;
          medical_notes?: string | null;
          participant_number?: number | null;
          phone?: string | null;
          updated_at?: string;
          waiver_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_participants_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_participants_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_participants_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_price_lines: {
        Row: {
          booking_id: string;
          created_at: string;
          currency: string;
          id: string;
          label: string;
          line_type: string;
          metadata: Json;
          quantity: number;
          reference_id: string | null;
          total_amount_minor: number | null;
          unit_amount_minor: number;
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          currency: string;
          id?: string;
          label: string;
          line_type: string;
          metadata?: Json;
          quantity?: number;
          reference_id?: string | null;
          total_amount_minor?: number | null;
          unit_amount_minor: number;
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          label?: string;
          line_type?: string;
          metadata?: Json;
          quantity?: number;
          reference_id?: string | null;
          total_amount_minor?: number | null;
          unit_amount_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "booking_price_lines_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_price_lines_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_price_lines_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_status_history: {
        Row: {
          booking_id: string;
          changed_by: string | null;
          created_at: string;
          id: string;
          new_status: Database["public"]["Enums"]["booking_status"];
          previous_status: Database["public"]["Enums"]["booking_status"] | null;
          reason: string | null;
        };
        Insert: {
          booking_id: string;
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          new_status: Database["public"]["Enums"]["booking_status"];
          previous_status?:
            | Database["public"]["Enums"]["booking_status"]
            | null;
          reason?: string | null;
        };
        Update: {
          booking_id?: string;
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["booking_status"];
          previous_status?:
            | Database["public"]["Enums"]["booking_status"]
            | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_status_history_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_status_history_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_stories: {
        Row: {
          booking_id: string;
          consent_received_at: string | null;
          consent_source: string | null;
          consent_status: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          experience_id: string;
          guest_country_code: string | null;
          guest_display_name: string | null;
          guest_quote: string | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          status: Database["public"]["Enums"]["booking_story_status"];
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          consent_received_at?: string | null;
          consent_source?: string | null;
          consent_status?: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          display_order?: number;
          experience_id: string;
          guest_country_code?: string | null;
          guest_display_name?: string | null;
          guest_quote?: string | null;
          id?: string;
          is_featured?: boolean;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["booking_story_status"];
          subtitle?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          consent_received_at?: string | null;
          consent_source?: string | null;
          consent_status?: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          display_order?: number;
          experience_id?: string;
          guest_country_code?: string | null;
          guest_display_name?: string | null;
          guest_quote?: string | null;
          id?: string;
          is_featured?: boolean;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["booking_story_status"];
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_stories_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_stories_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_stories_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_stories_cover_media_asset_id_fkey";
            columns: ["cover_media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_stories_cover_media_asset_id_fkey";
            columns: ["cover_media_asset_id"];
            isOneToOne: false;
            referencedRelation: "published_media_assets";
            referencedColumns: ["media_asset_id"];
          },
          {
            foreignKeyName: "booking_stories_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_stories_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_stories_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "booking_stories_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "booking_stories_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_story_media: {
        Row: {
          booking_story_id: string;
          caption: string | null;
          created_at: string;
          display_order: number;
          id: string;
          is_active: boolean;
          is_primary: boolean;
          media_asset_id: string;
          media_role: Database["public"]["Enums"]["booking_story_media_role"];
          updated_at: string;
        };
        Insert: {
          booking_story_id: string;
          caption?: string | null;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          is_primary?: boolean;
          media_asset_id: string;
          media_role?: Database["public"]["Enums"]["booking_story_media_role"];
          updated_at?: string;
        };
        Update: {
          booking_story_id?: string;
          caption?: string | null;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          is_primary?: boolean;
          media_asset_id?: string;
          media_role?: Database["public"]["Enums"]["booking_story_media_role"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_story_media_booking_story_id_fkey";
            columns: ["booking_story_id"];
            isOneToOne: false;
            referencedRelation: "booking_stories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_story_media_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_story_media_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "published_media_assets";
            referencedColumns: ["media_asset_id"];
          }
        ];
      };
      bookings: {
        Row: {
          availability_slot_id: string | null;
          booked_at: string | null;
          booking_reference: string;
          cancellation_policy_snapshot: Json;
          cancelled_at: string | null;
          completed_at: string | null;
          confirmed_at: string | null;
          contact_first_name: string | null;
          contact_last_name: string | null;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_id: string | null;
          customer_phone: string | null;
          customer_profile_id: string | null;
          ends_at_snapshot: string | null;
          experience_id: string;
          experience_title_snapshot: string | null;
          experience_variant_id: string;
          expires_at: string | null;
          id: string;
          idempotency_key: string | null;
          location_id: string | null;
          location_name_snapshot: string | null;
          metadata: Json;
          participant_notes: string | null;
          partner_id: string | null;
          partner_voucher_percent_basis_points_snapshot: number | null;
          party_size: number;
          payment_status: Database["public"]["Enums"]["payment_status"];
          preferred_language: string;
          pricing_snapshot: Json;
          referral_id: string | null;
          source_channel: string;
          special_requests: string | null;
          starts_at_snapshot: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          subtotal_amount_minor: number;
          terms_accepted_at: string | null;
          timezone_snapshot: string | null;
          total_amount_minor: number;
          unit_amount_minor: number;
          updated_at: string;
          variant_name_snapshot: string | null;
          version: number;
          voucher_amount_minor: number;
        };
        Insert: {
          availability_slot_id?: string | null;
          booked_at?: string | null;
          booking_reference?: string;
          cancellation_policy_snapshot?: Json;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          created_at?: string;
          currency: string;
          customer_email: string;
          customer_id?: string | null;
          customer_phone?: string | null;
          customer_profile_id?: string | null;
          ends_at_snapshot?: string | null;
          experience_id: string;
          experience_title_snapshot?: string | null;
          experience_variant_id: string;
          expires_at?: string | null;
          id?: string;
          idempotency_key?: string | null;
          location_id?: string | null;
          location_name_snapshot?: string | null;
          metadata?: Json;
          participant_notes?: string | null;
          partner_id?: string | null;
          partner_voucher_percent_basis_points_snapshot?: number | null;
          party_size: number;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          preferred_language?: string;
          pricing_snapshot?: Json;
          referral_id?: string | null;
          source_channel?: string;
          special_requests?: string | null;
          starts_at_snapshot?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          subtotal_amount_minor: number;
          terms_accepted_at?: string | null;
          timezone_snapshot?: string | null;
          total_amount_minor: number;
          unit_amount_minor: number;
          updated_at?: string;
          variant_name_snapshot?: string | null;
          version?: number;
          voucher_amount_minor?: number;
        };
        Update: {
          availability_slot_id?: string | null;
          booked_at?: string | null;
          booking_reference?: string;
          cancellation_policy_snapshot?: Json;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          created_at?: string;
          currency?: string;
          customer_email?: string;
          customer_id?: string | null;
          customer_phone?: string | null;
          customer_profile_id?: string | null;
          ends_at_snapshot?: string | null;
          experience_id?: string;
          experience_title_snapshot?: string | null;
          experience_variant_id?: string;
          expires_at?: string | null;
          id?: string;
          idempotency_key?: string | null;
          location_id?: string | null;
          location_name_snapshot?: string | null;
          metadata?: Json;
          participant_notes?: string | null;
          partner_id?: string | null;
          partner_voucher_percent_basis_points_snapshot?: number | null;
          party_size?: number;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          preferred_language?: string;
          pricing_snapshot?: Json;
          referral_id?: string | null;
          source_channel?: string;
          special_requests?: string | null;
          starts_at_snapshot?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          subtotal_amount_minor?: number;
          terms_accepted_at?: string | null;
          timezone_snapshot?: string | null;
          total_amount_minor?: number;
          unit_amount_minor?: number;
          updated_at?: string;
          variant_name_snapshot?: string | null;
          version?: number;
          voucher_amount_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "admin_capacity_calendar";
            referencedColumns: [
              "availability_slot_id",
              "experience_variant_id"
            ];
          },
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "availability_slots";
            referencedColumns: ["id", "experience_variant_id"];
          },
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "booking_availability";
            referencedColumns: [
              "availability_slot_id",
              "experience_variant_id"
            ];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
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
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
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
            foreignKeyName: "bookings_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "bookings_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
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
      credential_access_events: {
        Row: {
          actor_profile_id: string | null;
          created_at: string;
          document_file_id: string | null;
          document_id: string | null;
          event_type: string;
          grant_id: string | null;
          id: string;
          metadata: Json;
          share_link_id: string | null;
        };
        Insert: {
          actor_profile_id?: string | null;
          created_at?: string;
          document_file_id?: string | null;
          document_id?: string | null;
          event_type: string;
          grant_id?: string | null;
          id?: string;
          metadata?: Json;
          share_link_id?: string | null;
        };
        Update: {
          actor_profile_id?: string | null;
          created_at?: string;
          document_file_id?: string | null;
          document_id?: string | null;
          event_type?: string;
          grant_id?: string | null;
          id?: string;
          metadata?: Json;
          share_link_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "credential_access_events_actor_profile_id_fkey";
            columns: ["actor_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_events_document_file_id_fkey";
            columns: ["document_file_id"];
            isOneToOne: false;
            referencedRelation: "professional_document_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_events_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_events_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents_admin";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_events_grant_id_fkey";
            columns: ["grant_id"];
            isOneToOne: false;
            referencedRelation: "credential_access_grants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_events_share_link_id_fkey";
            columns: ["share_link_id"];
            isOneToOne: false;
            referencedRelation: "credential_share_links";
            referencedColumns: ["id"];
          }
        ];
      };
      credential_access_grant_documents: {
        Row: {
          created_at: string;
          document_id: string;
          file_roles: string[];
          grant_id: string;
          include_document_number: boolean;
          include_history: boolean;
        };
        Insert: {
          created_at?: string;
          document_id: string;
          file_roles?: string[];
          grant_id: string;
          include_document_number?: boolean;
          include_history?: boolean;
        };
        Update: {
          created_at?: string;
          document_id?: string;
          file_roles?: string[];
          grant_id?: string;
          include_document_number?: boolean;
          include_history?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "credential_access_grant_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_grant_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents_admin";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_grant_documents_grant_id_fkey";
            columns: ["grant_id"];
            isOneToOne: false;
            referencedRelation: "credential_access_grants";
            referencedColumns: ["id"];
          }
        ];
      };
      credential_access_grants: {
        Row: {
          access_expires_at: string | null;
          created_at: string;
          created_by_profile_id: string;
          id: string;
          last_login_at: string | null;
          last_magic_link_sent_at: string | null;
          message: string | null;
          owner_profile_id: string;
          permission_download_files: boolean;
          permission_include_document_number: boolean;
          permission_include_history: boolean;
          permission_view_files: boolean;
          recipient_agency_label: string | null;
          recipient_email: string;
          recipient_profile_id: string | null;
          revoked_at: string | null;
          revoked_by_profile_id: string | null;
          updated_at: string;
        };
        Insert: {
          access_expires_at?: string | null;
          created_at?: string;
          created_by_profile_id?: string;
          id?: string;
          last_login_at?: string | null;
          last_magic_link_sent_at?: string | null;
          message?: string | null;
          owner_profile_id: string;
          permission_download_files?: boolean;
          permission_include_document_number?: boolean;
          permission_include_history?: boolean;
          permission_view_files?: boolean;
          recipient_agency_label?: string | null;
          recipient_email: string;
          recipient_profile_id?: string | null;
          revoked_at?: string | null;
          revoked_by_profile_id?: string | null;
          updated_at?: string;
        };
        Update: {
          access_expires_at?: string | null;
          created_at?: string;
          created_by_profile_id?: string;
          id?: string;
          last_login_at?: string | null;
          last_magic_link_sent_at?: string | null;
          message?: string | null;
          owner_profile_id?: string;
          permission_download_files?: boolean;
          permission_include_document_number?: boolean;
          permission_include_history?: boolean;
          permission_view_files?: boolean;
          recipient_agency_label?: string | null;
          recipient_email?: string;
          recipient_profile_id?: string | null;
          revoked_at?: string | null;
          revoked_by_profile_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credential_access_grants_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_grants_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_grants_recipient_profile_id_fkey";
            columns: ["recipient_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_access_grants_revoked_by_profile_id_fkey";
            columns: ["revoked_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      credential_share_links: {
        Row: {
          created_at: string;
          created_by_profile_id: string;
          download_count: number;
          expires_at: string;
          grant_id: string;
          id: string;
          max_downloads: number | null;
          max_views: number | null;
          recipient_agency_label: string | null;
          recipient_email: string | null;
          revoked_at: string | null;
          revoked_by_profile_id: string | null;
          token_hash: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          created_at?: string;
          created_by_profile_id?: string;
          download_count?: number;
          expires_at: string;
          grant_id: string;
          id?: string;
          max_downloads?: number | null;
          max_views?: number | null;
          recipient_agency_label?: string | null;
          recipient_email?: string | null;
          revoked_at?: string | null;
          revoked_by_profile_id?: string | null;
          token_hash: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          created_at?: string;
          created_by_profile_id?: string;
          download_count?: number;
          expires_at?: string;
          grant_id?: string;
          id?: string;
          max_downloads?: number | null;
          max_views?: number | null;
          recipient_agency_label?: string | null;
          recipient_email?: string | null;
          revoked_at?: string | null;
          revoked_by_profile_id?: string | null;
          token_hash?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "credential_share_links_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_share_links_grant_id_fkey";
            columns: ["grant_id"];
            isOneToOne: false;
            referencedRelation: "credential_access_grants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credential_share_links_revoked_by_profile_id_fkey";
            columns: ["revoked_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      customer_referral_sessions: {
        Row: {
          created_at: string;
          customer_id: string;
          expires_at: string;
          id: string;
          last_seen_at: string;
          token_hash: string;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          expires_at: string;
          id?: string;
          last_seen_at?: string;
          token_hash: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          expires_at?: string;
          id?: string;
          last_seen_at?: string;
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_referral_sessions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_referral_sessions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };
      customers: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          date_of_birth: string | null;
          email: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          first_name: string | null;
          id: string;
          last_booking_at: string | null;
          last_name: string | null;
          lifetime_bookings: number;
          lifetime_spent_minor: number;
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          notes: string | null;
          phone: string | null;
          preferred_language: string;
          profile_id: string | null;
          updated_at: string;
          whatsapp_opt_in: boolean;
          whatsapp_opt_in_at: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          email: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          first_name?: string | null;
          id?: string;
          last_booking_at?: string | null;
          last_name?: string | null;
          lifetime_bookings?: number;
          lifetime_spent_minor?: number;
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          notes?: string | null;
          phone?: string | null;
          preferred_language?: string;
          profile_id?: string | null;
          updated_at?: string;
          whatsapp_opt_in?: boolean;
          whatsapp_opt_in_at?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          email?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          first_name?: string | null;
          id?: string;
          last_booking_at?: string | null;
          last_name?: string | null;
          lifetime_bookings?: number;
          lifetime_spent_minor?: number;
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          notes?: string | null;
          phone?: string | null;
          preferred_language?: string;
          profile_id?: string | null;
          updated_at?: string;
          whatsapp_opt_in?: boolean;
          whatsapp_opt_in_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_addon_translations: {
        Row: {
          addon_id: string;
          created_at: string;
          description: string | null;
          id: string;
          locale: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          addon_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          locale: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          addon_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          locale?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_addon_translations_addon_id_fkey";
            columns: ["addon_id"];
            isOneToOne: false;
            referencedRelation: "experience_addons";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_addons: {
        Row: {
          created_at: string;
          currency: string;
          description: string | null;
          display_order: number;
          experience_id: string;
          id: string;
          is_active: boolean;
          max_quantity: number | null;
          name: string;
          pricing_model: Database["public"]["Enums"]["variant_pricing_model"];
          slug: string;
          unit_amount_minor: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          display_order?: number;
          experience_id: string;
          id?: string;
          is_active?: boolean;
          max_quantity?: number | null;
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
          display_order?: number;
          experience_id?: string;
          id?: string;
          is_active?: boolean;
          max_quantity?: number | null;
          name?: string;
          pricing_model?: Database["public"]["Enums"]["variant_pricing_model"];
          slug?: string;
          unit_amount_minor?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_addons_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_addons_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_addons_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_addons_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_hosts: {
        Row: {
          created_at: string;
          display_order: number;
          experience_id: string;
          is_primary: boolean;
          profile_id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          experience_id: string;
          is_primary?: boolean;
          profile_id: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          experience_id?: string;
          is_primary?: boolean;
          profile_id?: string;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_hosts_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_hosts_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_hosts_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_hosts_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_hosts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_itinerary_step_translations: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          itinerary_step_id: string;
          locale: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          itinerary_step_id: string;
          locale: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          itinerary_step_id?: string;
          locale?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_itinerary_step_translations_itinerary_step_id_fkey";
            columns: ["itinerary_step_id"];
            isOneToOne: false;
            referencedRelation: "experience_itinerary_steps";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_itinerary_steps: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          duration_minutes: number | null;
          experience_id: string;
          id: string;
          starts_after_minutes: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          duration_minutes?: number | null;
          experience_id: string;
          id?: string;
          starts_after_minutes?: number | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          duration_minutes?: number | null;
          experience_id?: string;
          id?: string;
          starts_after_minutes?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_itinerary_steps_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_itinerary_steps_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_itinerary_steps_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_itinerary_steps_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_languages: {
        Row: {
          created_at: string;
          display_name: string;
          experience_id: string;
          is_primary: boolean;
          language_code: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          experience_id: string;
          is_primary?: boolean;
          language_code: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          experience_id?: string;
          is_primary?: boolean;
          language_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_languages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_languages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_languages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_languages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_locations: {
        Row: {
          created_at: string;
          display_order: number;
          experience_id: string;
          is_active: boolean;
          is_primary: boolean;
          location_id: string;
          meeting_point_override: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          experience_id: string;
          is_active?: boolean;
          is_primary?: boolean;
          location_id: string;
          meeting_point_override?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          experience_id?: string;
          is_active?: boolean;
          is_primary?: boolean;
          location_id?: string;
          meeting_point_override?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_locations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_locations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_locations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_locations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_locations_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "experience_locations_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_policies: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          experience_id: string;
          id: string;
          is_active: boolean;
          policy_type: string;
          title: string;
          updated_at: string;
          value_minutes: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          experience_id: string;
          id?: string;
          is_active?: boolean;
          policy_type: string;
          title: string;
          updated_at?: string;
          value_minutes?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          experience_id?: string;
          id?: string;
          is_active?: boolean;
          policy_type?: string;
          title?: string;
          updated_at?: string;
          value_minutes?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "experience_policies_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_policies_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_policies_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_policies_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_policy_translations: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          locale: string;
          policy_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          locale: string;
          policy_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          locale?: string;
          policy_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_policy_translations_policy_id_fkey";
            columns: ["policy_id"];
            isOneToOne: false;
            referencedRelation: "experience_policies";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_requirement_translations: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          locale: string;
          requirement_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          locale: string;
          requirement_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          locale?: string;
          requirement_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_requirement_translations_requirement_id_fkey";
            columns: ["requirement_id"];
            isOneToOne: false;
            referencedRelation: "experience_requirements";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_requirements: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          experience_id: string;
          id: string;
          is_mandatory: boolean;
          requirement_type: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          experience_id: string;
          id?: string;
          is_mandatory?: boolean;
          requirement_type?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          experience_id?: string;
          id?: string;
          is_mandatory?: boolean;
          requirement_type?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_requirements_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_requirements_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_requirements_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_requirements_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_translations: {
        Row: {
          category_label: string | null;
          created_at: string;
          description: string | null;
          experience_id: string;
          highlights: Json;
          id: string;
          inclusions: Json;
          locale: string;
          location_name: string | null;
          short_description: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category_label?: string | null;
          created_at?: string;
          description?: string | null;
          experience_id: string;
          highlights?: Json;
          id?: string;
          inclusions?: Json;
          locale: string;
          location_name?: string | null;
          short_description?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category_label?: string | null;
          created_at?: string;
          description?: string | null;
          experience_id?: string;
          highlights?: Json;
          id?: string;
          inclusions?: Json;
          locale?: string;
          location_name?: string | null;
          short_description?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_translations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_translations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_translations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_translations_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_variant_translations: {
        Row: {
          badge_label: string | null;
          created_at: string;
          description: string | null;
          id: string;
          locale: string;
          name: string;
          subtitle: string | null;
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          badge_label?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          locale: string;
          name: string;
          subtitle?: string | null;
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          badge_label?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          locale?: string;
          name?: string;
          subtitle?: string | null;
          updated_at?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_variant_translations_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "experience_variants";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_variants: {
        Row: {
          badge_label: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          duration_minutes: number | null;
          experience_id: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          max_party_size: number | null;
          min_party_size: number;
          name: string;
          pricing_model: Database["public"]["Enums"]["variant_pricing_model"];
          slug: string;
          subtitle: string | null;
          unit_amount_minor: number;
          updated_at: string;
        };
        Insert: {
          badge_label?: string | null;
          created_at?: string;
          currency: string;
          description?: string | null;
          duration_minutes?: number | null;
          experience_id: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          max_party_size?: number | null;
          min_party_size?: number;
          name: string;
          pricing_model?: Database["public"]["Enums"]["variant_pricing_model"];
          slug: string;
          subtitle?: string | null;
          unit_amount_minor: number;
          updated_at?: string;
        };
        Update: {
          badge_label?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          duration_minutes?: number | null;
          experience_id?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          max_party_size?: number | null;
          min_party_size?: number;
          name?: string;
          pricing_model?: Database["public"]["Enums"]["variant_pricing_model"];
          slug?: string;
          subtitle?: string | null;
          unit_amount_minor?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "experience_variants_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "experience_variants_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "experience_variants_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
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
          category_label: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          experience_type: string | null;
          hero_image_path: string | null;
          highlights: Json;
          id: string;
          inclusions: Json;
          is_featured: boolean;
          location_name: string | null;
          manual_confirmation_required: boolean;
          media_folder: string | null;
          mentor_required: boolean;
          provider_profile_id: string | null;
          short_description: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["publication_status"];
          timezone: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          base_capacity: number;
          base_currency: string;
          category_label?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes: number;
          experience_type?: string | null;
          hero_image_path?: string | null;
          highlights?: Json;
          id?: string;
          inclusions?: Json;
          is_featured?: boolean;
          location_name?: string | null;
          manual_confirmation_required?: boolean;
          media_folder?: string | null;
          mentor_required?: boolean;
          provider_profile_id?: string | null;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["publication_status"];
          timezone?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          base_capacity?: number;
          base_currency?: string;
          category_label?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          experience_type?: string | null;
          hero_image_path?: string | null;
          highlights?: Json;
          id?: string;
          inclusions?: Json;
          is_featured?: boolean;
          location_name?: string | null;
          manual_confirmation_required?: boolean;
          media_folder?: string | null;
          mentor_required?: boolean;
          provider_profile_id?: string | null;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
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
      locations: {
        Row: {
          address_line_1: string | null;
          address_line_2: string | null;
          city: string;
          country_code: string;
          created_at: string;
          description: string | null;
          google_maps_url: string | null;
          google_place_id: string | null;
          google_plus_code: string | null;
          id: string;
          is_active: boolean;
          latitude: number;
          longitude: number;
          map_zoom: number;
          meeting_point_notes: string | null;
          name: string;
          parking_notes: string | null;
          postal_code: string | null;
          province: string | null;
          short_name: string | null;
          slug: string;
          updated_at: string;
          what3words: string | null;
        };
        Insert: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          city: string;
          country_code?: string;
          created_at?: string;
          description?: string | null;
          google_maps_url?: string | null;
          google_place_id?: string | null;
          google_plus_code?: string | null;
          id?: string;
          is_active?: boolean;
          latitude: number;
          longitude: number;
          map_zoom?: number;
          meeting_point_notes?: string | null;
          name: string;
          parking_notes?: string | null;
          postal_code?: string | null;
          province?: string | null;
          short_name?: string | null;
          slug: string;
          updated_at?: string;
          what3words?: string | null;
        };
        Update: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string;
          country_code?: string;
          created_at?: string;
          description?: string | null;
          google_maps_url?: string | null;
          google_place_id?: string | null;
          google_plus_code?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number;
          longitude?: number;
          map_zoom?: number;
          meeting_point_notes?: string | null;
          name?: string;
          parking_notes?: string | null;
          postal_code?: string | null;
          province?: string | null;
          short_name?: string | null;
          slug?: string;
          updated_at?: string;
          what3words?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          alt_text: string | null;
          alt_text_override: string | null;
          asset_key: string;
          blurhash: string | null;
          breakpoint: string;
          bucket_id: string;
          byte_size: number | null;
          caption: string | null;
          caption_override: string | null;
          component_key: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          dominant_color: string | null;
          duration_seconds: number | null;
          ends_at: string | null;
          etag: string | null;
          focal_unit: Database["public"]["Enums"]["media_focal_unit"];
          focal_x: number;
          focal_y: number;
          folder_path: string | null;
          generated_filename: string | null;
          height: number | null;
          id: string;
          is_active: boolean;
          is_primary: boolean;
          link_url: string | null;
          locale: string | null;
          media_type: string;
          metadata: Json;
          mime_type: string | null;
          open_in_new_tab: boolean;
          original_filename: string | null;
          page_path: string | null;
          placement_key: string | null;
          published_at: string | null;
          role: string;
          scope_key: string | null;
          scope_type: string | null;
          section_key: string | null;
          starts_at: string | null;
          status: Database["public"]["Enums"]["media_asset_status"];
          storage_object_id: string | null;
          storage_path: string;
          tags: string[];
          title: string | null;
          updated_at: string;
          variant: string | null;
          visibility: Database["public"]["Enums"]["media_visibility"];
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          alt_text_override?: string | null;
          asset_key: string;
          blurhash?: string | null;
          breakpoint?: string;
          bucket_id: string;
          byte_size?: number | null;
          caption?: string | null;
          caption_override?: string | null;
          component_key?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          display_order?: number;
          dominant_color?: string | null;
          duration_seconds?: number | null;
          ends_at?: string | null;
          etag?: string | null;
          focal_unit?: Database["public"]["Enums"]["media_focal_unit"];
          focal_x?: number;
          focal_y?: number;
          folder_path?: string | null;
          generated_filename?: string | null;
          height?: number | null;
          id?: string;
          is_active?: boolean;
          is_primary?: boolean;
          link_url?: string | null;
          locale?: string | null;
          media_type: string;
          metadata?: Json;
          mime_type?: string | null;
          open_in_new_tab?: boolean;
          original_filename?: string | null;
          page_path?: string | null;
          placement_key?: string | null;
          published_at?: string | null;
          role?: string;
          scope_key?: string | null;
          scope_type?: string | null;
          section_key?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["media_asset_status"];
          storage_object_id?: string | null;
          storage_path: string;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          variant?: string | null;
          visibility?: Database["public"]["Enums"]["media_visibility"];
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          alt_text_override?: string | null;
          asset_key?: string;
          blurhash?: string | null;
          breakpoint?: string;
          bucket_id?: string;
          byte_size?: number | null;
          caption?: string | null;
          caption_override?: string | null;
          component_key?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          display_order?: number;
          dominant_color?: string | null;
          duration_seconds?: number | null;
          ends_at?: string | null;
          etag?: string | null;
          focal_unit?: Database["public"]["Enums"]["media_focal_unit"];
          focal_x?: number;
          focal_y?: number;
          folder_path?: string | null;
          generated_filename?: string | null;
          height?: number | null;
          id?: string;
          is_active?: boolean;
          is_primary?: boolean;
          link_url?: string | null;
          locale?: string | null;
          media_type?: string;
          metadata?: Json;
          mime_type?: string | null;
          open_in_new_tab?: boolean;
          original_filename?: string | null;
          page_path?: string | null;
          placement_key?: string | null;
          published_at?: string | null;
          role?: string;
          scope_key?: string | null;
          scope_type?: string | null;
          section_key?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["media_asset_status"];
          storage_object_id?: string | null;
          storage_path?: string;
          tags?: string[];
          title?: string | null;
          updated_at?: string;
          variant?: string | null;
          visibility?: Database["public"]["Enums"]["media_visibility"];
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      media_placements: {
        Row: {
          alt_text_override: string | null;
          breakpoint: string;
          caption_override: string | null;
          created_at: string;
          display_order: number;
          entity_id: string;
          entity_type: string;
          id: string;
          is_active: boolean;
          is_primary: boolean;
          locale: string | null;
          media_asset_id: string;
          parent_entity_id: string | null;
          updated_at: string;
          usage: string;
        };
        Insert: {
          alt_text_override?: string | null;
          breakpoint?: string;
          caption_override?: string | null;
          created_at?: string;
          display_order?: number;
          entity_id: string;
          entity_type: string;
          id?: string;
          is_active?: boolean;
          is_primary?: boolean;
          locale?: string | null;
          media_asset_id: string;
          parent_entity_id?: string | null;
          updated_at?: string;
          usage: string;
        };
        Update: {
          alt_text_override?: string | null;
          breakpoint?: string;
          caption_override?: string | null;
          created_at?: string;
          display_order?: number;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          is_active?: boolean;
          is_primary?: boolean;
          locale?: string | null;
          media_asset_id?: string;
          parent_entity_id?: string | null;
          updated_at?: string;
          usage?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_placements_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_placements_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "published_media_assets";
            referencedColumns: ["media_asset_id"];
          }
        ];
      };
      mission_statement_translations: {
        Row: {
          created_at: string;
          id: string;
          locale: string;
          mission_statement_id: string;
          principles: Json;
          statement: string;
          supporting_statement: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          locale: string;
          mission_statement_id: string;
          principles?: Json;
          statement: string;
          supporting_statement?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          locale?: string;
          mission_statement_id?: string;
          principles?: Json;
          statement?: string;
          supporting_statement?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_statement_translations_mission_statement_id_fkey";
            columns: ["mission_statement_id"];
            isOneToOne: false;
            referencedRelation: "mission_statements";
            referencedColumns: ["id"];
          }
        ];
      };
      mission_statements: {
        Row: {
          created_at: string;
          id: string;
          is_primary: boolean;
          principles: Json;
          slug: string;
          statement: string;
          status: string;
          supporting_statement: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          principles?: Json;
          slug: string;
          statement: string;
          status?: string;
          supporting_statement?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          principles?: Json;
          slug?: string;
          statement?: string;
          status?: string;
          supporting_statement?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      partner_financial_profiles: {
        Row: {
          account_holder: string;
          bank_name: string | null;
          bic_swift: string | null;
          billing_address_line_1: string | null;
          billing_address_line_2: string | null;
          billing_city: string | null;
          billing_country_code: string | null;
          billing_email: string | null;
          billing_phone: string | null;
          billing_postal_code: string | null;
          billing_province: string | null;
          created_at: string;
          iban: string;
          is_verified: boolean;
          legal_company_name: string;
          notes: string | null;
          partner_id: string;
          payment_reference_prefix: string | null;
          payment_terms_days: number;
          preferred_currency: string;
          tax_id: string | null;
          updated_at: string;
          vat_number: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          account_holder: string;
          bank_name?: string | null;
          bic_swift?: string | null;
          billing_address_line_1?: string | null;
          billing_address_line_2?: string | null;
          billing_city?: string | null;
          billing_country_code?: string | null;
          billing_email?: string | null;
          billing_phone?: string | null;
          billing_postal_code?: string | null;
          billing_province?: string | null;
          created_at?: string;
          iban: string;
          is_verified?: boolean;
          legal_company_name: string;
          notes?: string | null;
          partner_id: string;
          payment_reference_prefix?: string | null;
          payment_terms_days?: number;
          preferred_currency?: string;
          tax_id?: string | null;
          updated_at?: string;
          vat_number?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          account_holder?: string;
          bank_name?: string | null;
          bic_swift?: string | null;
          billing_address_line_1?: string | null;
          billing_address_line_2?: string | null;
          billing_city?: string | null;
          billing_country_code?: string | null;
          billing_email?: string | null;
          billing_phone?: string | null;
          billing_postal_code?: string | null;
          billing_province?: string | null;
          created_at?: string;
          iban?: string;
          is_verified?: boolean;
          legal_company_name?: string;
          notes?: string | null;
          partner_id?: string;
          payment_reference_prefix?: string | null;
          payment_terms_days?: number;
          preferred_currency?: string;
          tax_id?: string | null;
          updated_at?: string;
          vat_number?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "partner_financial_profiles_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: true;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_financial_profiles_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: true;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_financial_profiles_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      partner_outreach: {
        Row: {
          assigned_to: string | null;
          channel: Database["public"]["Enums"]["partner_outreach_channel"];
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          contact_role: string | null;
          contacted_at: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          is_public_presentation: boolean;
          message_summary: string | null;
          next_follow_up_at: string | null;
          notes: string | null;
          outcome: string | null;
          partner_id: string;
          status: Database["public"]["Enums"]["partner_outreach_status"];
          subject: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          channel?: Database["public"]["Enums"]["partner_outreach_channel"];
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_role?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_public_presentation?: boolean;
          message_summary?: string | null;
          next_follow_up_at?: string | null;
          notes?: string | null;
          outcome?: string | null;
          partner_id: string;
          status?: Database["public"]["Enums"]["partner_outreach_status"];
          subject?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          channel?: Database["public"]["Enums"]["partner_outreach_channel"];
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_role?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_public_presentation?: boolean;
          message_summary?: string | null;
          next_follow_up_at?: string | null;
          notes?: string | null;
          outcome?: string | null;
          partner_id?: string;
          status?: Database["public"]["Enums"]["partner_outreach_status"];
          subject?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_outreach_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_outreach_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_outreach_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_outreach_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      partner_outreach_translations: {
        Row: {
          created_at: string;
          id: string;
          invitation_body: string;
          locale: string;
          outreach_id: string;
          subject: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invitation_body: string;
          locale: string;
          outreach_id: string;
          subject: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invitation_body?: string;
          locale?: string;
          outreach_id?: string;
          subject?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_outreach_translations_outreach_id_fkey";
            columns: ["outreach_id"];
            isOneToOne: false;
            referencedRelation: "partner_outreach";
            referencedColumns: ["id"];
          }
        ];
      };
      partner_payout_items: {
        Row: {
          approved_at: string | null;
          booking_id: string;
          created_at: string;
          currency: string;
          id: string;
          paid_at: string | null;
          partner_id: string;
          payout_id: string | null;
          qualifying_amount_minor: number;
          status: Database["public"]["Enums"]["partner_payout_item_status"];
          updated_at: string;
          voucher_amount_minor: number;
          voucher_id: string;
        };
        Insert: {
          approved_at?: string | null;
          booking_id: string;
          created_at?: string;
          currency: string;
          id?: string;
          paid_at?: string | null;
          partner_id: string;
          payout_id?: string | null;
          qualifying_amount_minor: number;
          status?: Database["public"]["Enums"]["partner_payout_item_status"];
          updated_at?: string;
          voucher_amount_minor: number;
          voucher_id: string;
        };
        Update: {
          approved_at?: string | null;
          booking_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          paid_at?: string | null;
          partner_id?: string;
          payout_id?: string | null;
          qualifying_amount_minor?: number;
          status?: Database["public"]["Enums"]["partner_payout_item_status"];
          updated_at?: string;
          voucher_amount_minor?: number;
          voucher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_payout_items_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payout_items_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payout_items_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payout_items_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payout_items_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payout_items_payout_id_fkey";
            columns: ["payout_id"];
            isOneToOne: false;
            referencedRelation: "partner_payouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payout_items_voucher_id_fkey";
            columns: ["voucher_id"];
            isOneToOne: true;
            referencedRelation: "vouchers";
            referencedColumns: ["id"];
          }
        ];
      };
      partner_payouts: {
        Row: {
          account_holder_snapshot: string;
          adjustment_amount_minor: number;
          approved_at: string | null;
          approved_by: string | null;
          bank_name_snapshot: string | null;
          bic_swift_snapshot: string | null;
          created_at: string;
          currency: string;
          external_payment_id: string | null;
          gross_voucher_amount_minor: number;
          iban_snapshot: string;
          id: string;
          net_amount_minor: number | null;
          notes: string | null;
          paid_at: string | null;
          paid_by: string | null;
          partner_id: string;
          payment_method: string;
          payment_reference: string | null;
          period_end: string;
          period_start: string;
          status: Database["public"]["Enums"]["partner_payout_status"];
          updated_at: string;
        };
        Insert: {
          account_holder_snapshot: string;
          adjustment_amount_minor?: number;
          approved_at?: string | null;
          approved_by?: string | null;
          bank_name_snapshot?: string | null;
          bic_swift_snapshot?: string | null;
          created_at?: string;
          currency?: string;
          external_payment_id?: string | null;
          gross_voucher_amount_minor?: number;
          iban_snapshot: string;
          id?: string;
          net_amount_minor?: number | null;
          notes?: string | null;
          paid_at?: string | null;
          paid_by?: string | null;
          partner_id: string;
          payment_method?: string;
          payment_reference?: string | null;
          period_end: string;
          period_start: string;
          status?: Database["public"]["Enums"]["partner_payout_status"];
          updated_at?: string;
        };
        Update: {
          account_holder_snapshot?: string;
          adjustment_amount_minor?: number;
          approved_at?: string | null;
          approved_by?: string | null;
          bank_name_snapshot?: string | null;
          bic_swift_snapshot?: string | null;
          created_at?: string;
          currency?: string;
          external_payment_id?: string | null;
          gross_voucher_amount_minor?: number;
          iban_snapshot?: string;
          id?: string;
          net_amount_minor?: number | null;
          notes?: string | null;
          paid_at?: string | null;
          paid_by?: string | null;
          partner_id?: string;
          payment_method?: string;
          payment_reference?: string | null;
          period_end?: string;
          period_start?: string;
          status?: Database["public"]["Enums"]["partner_payout_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_payouts_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payouts_paid_by_fkey";
            columns: ["paid_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payouts_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_payouts_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      partner_promo_content: {
        Row: {
          content: Json;
          created_at: string;
          is_published: boolean;
          locale: string;
          updated_at: string;
        };
        Insert: {
          content: Json;
          created_at?: string;
          is_published?: boolean;
          locale: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          is_published?: boolean;
          locale?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      partner_referral_events: {
        Row: {
          booking_id: string | null;
          created_at: string;
          customer_id: string | null;
          event_type: string;
          id: string;
          metadata: Json;
          partner_id: string | null;
          referral_id: string | null;
          visit_id: string | null;
          voucher_id: string | null;
        };
        Insert: {
          booking_id?: string | null;
          created_at?: string;
          customer_id?: string | null;
          event_type: string;
          id?: string;
          metadata?: Json;
          partner_id?: string | null;
          referral_id?: string | null;
          visit_id?: string | null;
          voucher_id?: string | null;
        };
        Update: {
          booking_id?: string | null;
          created_at?: string;
          customer_id?: string | null;
          event_type?: string;
          id?: string;
          metadata?: Json;
          partner_id?: string | null;
          referral_id?: string | null;
          visit_id?: string | null;
          voucher_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "partner_referral_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_referral_id_fkey";
            columns: ["referral_id"];
            isOneToOne: false;
            referencedRelation: "referrals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "partner_referral_visits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_events_voucher_id_fkey";
            columns: ["voucher_id"];
            isOneToOne: false;
            referencedRelation: "vouchers";
            referencedColumns: ["id"];
          }
        ];
      };
      partner_referral_visits: {
        Row: {
          created_at: string;
          id: string;
          landing_path: string;
          partner_id: string;
          public_token: string;
          visitor_token_hash: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          landing_path?: string;
          partner_id: string;
          public_token: string;
          visitor_token_hash: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          landing_path?: string;
          partner_id?: string;
          public_token?: string;
          visitor_token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_referral_visits_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_referral_visits_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      partner_translations: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          locale: string;
          name: string | null;
          partner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          locale: string;
          name?: string | null;
          partner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          locale?: string;
          name?: string | null;
          partner_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_translations_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_translations_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      partners: {
        Row: {
          attribution_window_hours: number;
          business_type: string | null;
          contact_name: string | null;
          created_at: string;
          description: string | null;
          email: string | null;
          id: string;
          is_featured: boolean;
          location_id: string | null;
          name: string;
          owner_profile_id: string | null;
          phone: string | null;
          published_at: string;
          referral_code: string;
          slug: string;
          status: Database["public"]["Enums"]["partner_status"];
          updated_at: string;
          voucher_percent_basis_points: number;
          website_url: string | null;
        };
        Insert: {
          attribution_window_hours?: number;
          business_type?: string | null;
          contact_name?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_featured?: boolean;
          location_id?: string | null;
          name: string;
          owner_profile_id?: string | null;
          phone?: string | null;
          published_at?: string;
          referral_code?: string;
          slug: string;
          status?: Database["public"]["Enums"]["partner_status"];
          updated_at?: string;
          voucher_percent_basis_points?: number;
          website_url?: string | null;
        };
        Update: {
          attribution_window_hours?: number;
          business_type?: string | null;
          contact_name?: string | null;
          created_at?: string;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_featured?: boolean;
          location_id?: string | null;
          name?: string;
          owner_profile_id?: string | null;
          phone?: string | null;
          published_at?: string;
          referral_code?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["partner_status"];
          updated_at?: string;
          voucher_percent_basis_points?: number;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "partners_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "partners_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
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
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      professional_document_files: {
        Row: {
          checksum_sha256: string | null;
          created_at: string;
          document_id: string;
          file_role: string;
          file_size_bytes: number;
          id: string;
          is_current: boolean;
          mime_type: string;
          original_filename: string;
          sort_order: number;
          storage_bucket: string;
          storage_path: string;
          stored_filename: string;
          updated_at: string;
          uploaded_by_profile_id: string;
          version_number: number;
        };
        Insert: {
          checksum_sha256?: string | null;
          created_at?: string;
          document_id: string;
          file_role?: string;
          file_size_bytes: number;
          id?: string;
          is_current?: boolean;
          mime_type: string;
          original_filename: string;
          sort_order?: number;
          storage_bucket?: string;
          storage_path: string;
          stored_filename: string;
          updated_at?: string;
          uploaded_by_profile_id?: string;
          version_number?: number;
        };
        Update: {
          checksum_sha256?: string | null;
          created_at?: string;
          document_id?: string;
          file_role?: string;
          file_size_bytes?: number;
          id?: string;
          is_current?: boolean;
          mime_type?: string;
          original_filename?: string;
          sort_order?: number;
          storage_bucket?: string;
          storage_path?: string;
          stored_filename?: string;
          updated_at?: string;
          uploaded_by_profile_id?: string;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "professional_document_files_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_document_files_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents_admin";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_document_files_uploaded_by_profile_id_fkey";
            columns: ["uploaded_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      professional_documents: {
        Row: {
          category: string;
          confidentiality_level: string;
          created_at: string;
          document_number: string | null;
          document_type: string;
          does_not_expire: boolean;
          expires_on: string | null;
          id: string;
          issued_on: string | null;
          issuing_authority: string | null;
          issuing_country_code: string | null;
          metadata: Json;
          notes: string | null;
          profile_id: string;
          qualification: string | null;
          replaces_document_id: string | null;
          restrictions: string | null;
          status: string;
          stcw_code: string | null;
          team_member_certificate_id: string | null;
          title: string;
          updated_at: string;
          uploaded_by_profile_id: string;
          valid_from: string | null;
          verification_status: string;
          verified_at: string | null;
          verified_by_profile_id: string | null;
        };
        Insert: {
          category: string;
          confidentiality_level?: string;
          created_at?: string;
          document_number?: string | null;
          document_type: string;
          does_not_expire?: boolean;
          expires_on?: string | null;
          id?: string;
          issued_on?: string | null;
          issuing_authority?: string | null;
          issuing_country_code?: string | null;
          metadata?: Json;
          notes?: string | null;
          profile_id: string;
          qualification?: string | null;
          replaces_document_id?: string | null;
          restrictions?: string | null;
          status?: string;
          stcw_code?: string | null;
          team_member_certificate_id?: string | null;
          title: string;
          updated_at?: string;
          uploaded_by_profile_id?: string;
          valid_from?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by_profile_id?: string | null;
        };
        Update: {
          category?: string;
          confidentiality_level?: string;
          created_at?: string;
          document_number?: string | null;
          document_type?: string;
          does_not_expire?: boolean;
          expires_on?: string | null;
          id?: string;
          issued_on?: string | null;
          issuing_authority?: string | null;
          issuing_country_code?: string | null;
          metadata?: Json;
          notes?: string | null;
          profile_id?: string;
          qualification?: string | null;
          replaces_document_id?: string | null;
          restrictions?: string | null;
          status?: string;
          stcw_code?: string | null;
          team_member_certificate_id?: string | null;
          title?: string;
          updated_at?: string;
          uploaded_by_profile_id?: string;
          valid_from?: string | null;
          verification_status?: string;
          verified_at?: string | null;
          verified_by_profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_documents_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_replaces_document_id_fkey";
            columns: ["replaces_document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_replaces_document_id_fkey";
            columns: ["replaces_document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents_admin";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_team_member_certificate_id_fkey";
            columns: ["team_member_certificate_id"];
            isOneToOne: false;
            referencedRelation: "team_member_certificates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_uploaded_by_profile_id_fkey";
            columns: ["uploaded_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_verified_by_profile_id_fkey";
            columns: ["verified_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      professional_services: {
        Row: {
          accommodation_required: boolean;
          audience: string[];
          created_at: string;
          currency_code: string;
          day_rate_from_minor: number | null;
          deliverables: Json;
          description: string | null;
          direct_booking_enabled: boolean;
          engagement_units: string[];
          geographic_scope: string;
          id: string;
          inquiry_required: boolean;
          languages: string[];
          lead_time_days: number;
          metadata: Json;
          minimum_engagement_unit: string | null;
          minimum_engagement_value: number | null;
          owner_profile_id: string | null;
          price_from_minor: number | null;
          pricing_model: string;
          provider_profile_id: string | null;
          published_at: string | null;
          qualifications: string[];
          regions: string[];
          requirements: Json;
          seo_description: string | null;
          seo_title: string | null;
          service_category: string;
          service_features: Json;
          service_key: string;
          short_title: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["publication_status"];
          summary: string;
          title: string;
          travel_costs_included: boolean;
          travel_required: boolean;
          updated_at: string;
          vessel_types: string[];
          week_rate_from_minor: number | null;
        };
        Insert: {
          accommodation_required?: boolean;
          audience?: string[];
          created_at?: string;
          currency_code?: string;
          day_rate_from_minor?: number | null;
          deliverables?: Json;
          description?: string | null;
          direct_booking_enabled?: boolean;
          engagement_units?: string[];
          geographic_scope?: string;
          id?: string;
          inquiry_required?: boolean;
          languages?: string[];
          lead_time_days?: number;
          metadata?: Json;
          minimum_engagement_unit?: string | null;
          minimum_engagement_value?: number | null;
          owner_profile_id?: string | null;
          price_from_minor?: number | null;
          pricing_model?: string;
          provider_profile_id?: string | null;
          published_at?: string | null;
          qualifications?: string[];
          regions?: string[];
          requirements?: Json;
          seo_description?: string | null;
          seo_title?: string | null;
          service_category: string;
          service_features?: Json;
          service_key: string;
          short_title?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["publication_status"];
          summary: string;
          title: string;
          travel_costs_included?: boolean;
          travel_required?: boolean;
          updated_at?: string;
          vessel_types?: string[];
          week_rate_from_minor?: number | null;
        };
        Update: {
          accommodation_required?: boolean;
          audience?: string[];
          created_at?: string;
          currency_code?: string;
          day_rate_from_minor?: number | null;
          deliverables?: Json;
          description?: string | null;
          direct_booking_enabled?: boolean;
          engagement_units?: string[];
          geographic_scope?: string;
          id?: string;
          inquiry_required?: boolean;
          languages?: string[];
          lead_time_days?: number;
          metadata?: Json;
          minimum_engagement_unit?: string | null;
          minimum_engagement_value?: number | null;
          owner_profile_id?: string | null;
          price_from_minor?: number | null;
          pricing_model?: string;
          provider_profile_id?: string | null;
          published_at?: string | null;
          qualifications?: string[];
          regions?: string[];
          requirements?: Json;
          seo_description?: string | null;
          seo_title?: string | null;
          service_category?: string;
          service_features?: Json;
          service_key?: string;
          short_title?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["publication_status"];
          summary?: string;
          title?: string;
          travel_costs_included?: boolean;
          travel_required?: boolean;
          updated_at?: string;
          vessel_types?: string[];
          week_rate_from_minor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_services_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_services_provider_profile_id_fkey";
            columns: ["provider_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
      referral_contact_verifications: {
        Row: {
          created_at: string;
          email: string;
          expires_at: string;
          first_name: string;
          id: string;
          last_name: string;
          marketing_consent: boolean;
          phone: string | null;
          preferred_locale: string;
          token_hash: string;
          updated_at: string;
          verified_at: string | null;
          visit_id: string;
          whatsapp_opt_in: boolean;
        };
        Insert: {
          created_at?: string;
          email: string;
          expires_at: string;
          first_name: string;
          id?: string;
          last_name: string;
          marketing_consent?: boolean;
          phone?: string | null;
          preferred_locale?: string;
          token_hash: string;
          updated_at?: string;
          verified_at?: string | null;
          visit_id: string;
          whatsapp_opt_in?: boolean;
        };
        Update: {
          created_at?: string;
          email?: string;
          expires_at?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          marketing_consent?: boolean;
          phone?: string | null;
          preferred_locale?: string;
          token_hash?: string;
          updated_at?: string;
          verified_at?: string | null;
          visit_id?: string;
          whatsapp_opt_in?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "referral_contact_verifications_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: true;
            referencedRelation: "partner_referral_visits";
            referencedColumns: ["id"];
          }
        ];
      };
      referrals: {
        Row: {
          attributed_at: string;
          code: string;
          created_at: string;
          customer_id: string | null;
          expires_at: string | null;
          id: string;
          landing_path: string | null;
          locked_at: string | null;
          metadata: Json;
          partner_id: string;
          status: Database["public"]["Enums"]["referral_status"];
          updated_at: string;
          verified_at: string | null;
          visit_id: string | null;
          visitor_token: string | null;
        };
        Insert: {
          attributed_at?: string;
          code?: string;
          created_at?: string;
          customer_id?: string | null;
          expires_at?: string | null;
          id?: string;
          landing_path?: string | null;
          locked_at?: string | null;
          metadata?: Json;
          partner_id: string;
          status?: Database["public"]["Enums"]["referral_status"];
          updated_at?: string;
          verified_at?: string | null;
          visit_id?: string | null;
          visitor_token?: string | null;
        };
        Update: {
          attributed_at?: string;
          code?: string;
          created_at?: string;
          customer_id?: string | null;
          expires_at?: string | null;
          id?: string;
          landing_path?: string | null;
          locked_at?: string | null;
          metadata?: Json;
          partner_id?: string;
          status?: Database["public"]["Enums"]["referral_status"];
          updated_at?: string;
          verified_at?: string | null;
          visit_id?: string | null;
          visitor_token?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "partner_referral_visits";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          booking_id: string;
          comment: string | null;
          created_at: string;
          customer_id: string | null;
          experience_id: string;
          id: string;
          published_at: string | null;
          rating: number;
          status: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          comment?: string | null;
          created_at?: string;
          customer_id?: string | null;
          experience_id: string;
          id?: string;
          published_at?: string | null;
          rating: number;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          comment?: string | null;
          created_at?: string;
          customer_id?: string | null;
          experience_id?: string;
          id?: string;
          published_at?: string | null;
          rating?: number;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "reviews_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "reviews_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      seo_pages: {
        Row: {
          body_sections: Json;
          canonical_path: string | null;
          created_at: string;
          created_by: string | null;
          cta_label: string | null;
          cta_path: string | null;
          excerpt: string | null;
          experience_id: string | null;
          faq_items: Json;
          h1: string;
          hero_media_asset_id: string | null;
          id: string;
          introduction: string | null;
          is_featured: boolean;
          locale: string;
          location_id: string | null;
          meta_description: string;
          meta_title: string;
          metadata: Json;
          page_type: string;
          parent_page_id: string | null;
          primary_keyword: string | null;
          published_at: string | null;
          robots_follow: boolean;
          robots_index: boolean;
          search_intent: string | null;
          secondary_keywords: string[];
          slug: string;
          sort_order: number;
          status: string;
          structured_data: Json;
          target_audience: string[];
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          body_sections?: Json;
          canonical_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          cta_label?: string | null;
          cta_path?: string | null;
          excerpt?: string | null;
          experience_id?: string | null;
          faq_items?: Json;
          h1: string;
          hero_media_asset_id?: string | null;
          id?: string;
          introduction?: string | null;
          is_featured?: boolean;
          locale?: string;
          location_id?: string | null;
          meta_description: string;
          meta_title: string;
          metadata?: Json;
          page_type: string;
          parent_page_id?: string | null;
          primary_keyword?: string | null;
          published_at?: string | null;
          robots_follow?: boolean;
          robots_index?: boolean;
          search_intent?: string | null;
          secondary_keywords?: string[];
          slug: string;
          sort_order?: number;
          status?: string;
          structured_data?: Json;
          target_audience?: string[];
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          body_sections?: Json;
          canonical_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          cta_label?: string | null;
          cta_path?: string | null;
          excerpt?: string | null;
          experience_id?: string | null;
          faq_items?: Json;
          h1?: string;
          hero_media_asset_id?: string | null;
          id?: string;
          introduction?: string | null;
          is_featured?: boolean;
          locale?: string;
          location_id?: string | null;
          meta_description?: string;
          meta_title?: string;
          metadata?: Json;
          page_type?: string;
          parent_page_id?: string | null;
          primary_keyword?: string | null;
          published_at?: string | null;
          robots_follow?: boolean;
          robots_index?: boolean;
          search_intent?: string | null;
          secondary_keywords?: string[];
          slug?: string;
          sort_order?: number;
          status?: string;
          structured_data?: Json;
          target_audience?: string[];
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "seo_pages_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "seo_pages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "seo_pages_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_hero_media_asset_id_fkey";
            columns: ["hero_media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_hero_media_asset_id_fkey";
            columns: ["hero_media_asset_id"];
            isOneToOne: false;
            referencedRelation: "published_media_assets";
            referencedColumns: ["media_asset_id"];
          },
          {
            foreignKeyName: "seo_pages_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "seo_pages_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_parent_page_id_fkey";
            columns: ["parent_page_id"];
            isOneToOne: false;
            referencedRelation: "seo_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      site_content_sections: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          label: string;
          section_key: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label: string;
          section_key: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          section_key?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_navigation_item_translations: {
        Row: {
          id: string;
          label: string;
          locale: string;
          navigation_item_id: string;
        };
        Insert: {
          id?: string;
          label: string;
          locale: string;
          navigation_item_id: string;
        };
        Update: {
          id?: string;
          label?: string;
          locale?: string;
          navigation_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_navigation_item_translations_navigation_item_id_fkey";
            columns: ["navigation_item_id"];
            isOneToOne: false;
            referencedRelation: "site_navigation_items";
            referencedColumns: ["id"];
          }
        ];
      };
      site_navigation_items: {
        Row: {
          created_at: string;
          href: string;
          id: string;
          is_external: boolean;
          is_published: boolean;
          item_key: string;
          parent_id: string | null;
          placement: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          href: string;
          id?: string;
          is_external?: boolean;
          is_published?: boolean;
          item_key: string;
          parent_id?: string | null;
          placement: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          href?: string;
          id?: string;
          is_external?: boolean;
          is_published?: boolean;
          item_key?: string;
          parent_id?: string | null;
          placement?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_navigation_items_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "site_navigation_items";
            referencedColumns: ["id"];
          }
        ];
      };
      strategies: {
        Row: {
          action_plan: Json;
          channels: string[];
          created_at: string;
          description: string | null;
          ends_at: string | null;
          id: string;
          metadata: Json;
          objective: string | null;
          owner_profile_id: string | null;
          priority: number;
          slug: string;
          sort_order: number;
          stakeholder_key: string | null;
          starts_at: string | null;
          status: string;
          strategy_type: string;
          success_metrics: Json;
          summary: string | null;
          target_audience: string[];
          title: string;
          updated_at: string;
          user_role: Database["public"]["Enums"]["app_role"] | null;
          win_win: Json;
        };
        Insert: {
          action_plan?: Json;
          channels?: string[];
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          metadata?: Json;
          objective?: string | null;
          owner_profile_id?: string | null;
          priority?: number;
          slug: string;
          sort_order?: number;
          stakeholder_key?: string | null;
          starts_at?: string | null;
          status?: string;
          strategy_type?: string;
          success_metrics?: Json;
          summary?: string | null;
          target_audience?: string[];
          title: string;
          updated_at?: string;
          user_role?: Database["public"]["Enums"]["app_role"] | null;
          win_win?: Json;
        };
        Update: {
          action_plan?: Json;
          channels?: string[];
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          metadata?: Json;
          objective?: string | null;
          owner_profile_id?: string | null;
          priority?: number;
          slug?: string;
          sort_order?: number;
          stakeholder_key?: string | null;
          starts_at?: string | null;
          status?: string;
          strategy_type?: string;
          success_metrics?: Json;
          summary?: string | null;
          target_audience?: string[];
          title?: string;
          updated_at?: string;
          user_role?: Database["public"]["Enums"]["app_role"] | null;
          win_win?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "strategies_owner_profile_id_fkey";
            columns: ["owner_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      strategy_mission_statements: {
        Row: {
          created_at: string;
          display_order: number;
          mission_statement_id: string;
          rationale: string | null;
          relationship_type: string;
          strategy_id: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          mission_statement_id: string;
          rationale?: string | null;
          relationship_type?: string;
          strategy_id: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          mission_statement_id?: string;
          rationale?: string | null;
          relationship_type?: string;
          strategy_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "strategy_mission_statements_mission_statement_id_fkey";
            columns: ["mission_statement_id"];
            isOneToOne: false;
            referencedRelation: "mission_statements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "strategy_mission_statements_strategy_id_fkey";
            columns: ["strategy_id"];
            isOneToOne: false;
            referencedRelation: "strategies";
            referencedColumns: ["id"];
          }
        ];
      };
      strategy_translations: {
        Row: {
          action_plan: Json;
          channels: Json;
          created_at: string;
          description: string | null;
          id: string;
          locale: string;
          objective: string | null;
          simple_workflow_steps: Json;
          strategy_id: string;
          success_metrics: Json;
          summary: string | null;
          target_audience: Json;
          title: string;
          updated_at: string;
          win_win: Json;
        };
        Insert: {
          action_plan?: Json;
          channels?: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          locale: string;
          objective?: string | null;
          simple_workflow_steps?: Json;
          strategy_id: string;
          success_metrics?: Json;
          summary?: string | null;
          target_audience?: Json;
          title: string;
          updated_at?: string;
          win_win?: Json;
        };
        Update: {
          action_plan?: Json;
          channels?: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          locale?: string;
          objective?: string | null;
          simple_workflow_steps?: Json;
          strategy_id?: string;
          success_metrics?: Json;
          summary?: string | null;
          target_audience?: Json;
          title?: string;
          updated_at?: string;
          win_win?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "strategy_translations_strategy_id_fkey";
            columns: ["strategy_id"];
            isOneToOne: false;
            referencedRelation: "strategies";
            referencedColumns: ["id"];
          }
        ];
      };
      team_member_certificates: {
        Row: {
          certificate_number: string | null;
          certificate_type: string;
          created_at: string;
          credential_url: string | null;
          description: string | null;
          display_order: number;
          document_media_asset_id: string | null;
          does_not_expire: boolean;
          expires_on: string | null;
          id: string;
          is_featured: boolean;
          is_public: boolean;
          issued_on: string | null;
          issuing_organization: string | null;
          metadata: Json;
          short_title: string | null;
          skills: string[];
          status: string;
          team_member_id: string;
          title: string;
          updated_at: string;
          valid_from: string | null;
          verification_status: string;
          verification_url: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          certificate_number?: string | null;
          certificate_type?: string;
          created_at?: string;
          credential_url?: string | null;
          description?: string | null;
          display_order?: number;
          document_media_asset_id?: string | null;
          does_not_expire?: boolean;
          expires_on?: string | null;
          id?: string;
          is_featured?: boolean;
          is_public?: boolean;
          issued_on?: string | null;
          issuing_organization?: string | null;
          metadata?: Json;
          short_title?: string | null;
          skills?: string[];
          status?: string;
          team_member_id: string;
          title: string;
          updated_at?: string;
          valid_from?: string | null;
          verification_status?: string;
          verification_url?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          certificate_number?: string | null;
          certificate_type?: string;
          created_at?: string;
          credential_url?: string | null;
          description?: string | null;
          display_order?: number;
          document_media_asset_id?: string | null;
          does_not_expire?: boolean;
          expires_on?: string | null;
          id?: string;
          is_featured?: boolean;
          is_public?: boolean;
          issued_on?: string | null;
          issuing_organization?: string | null;
          metadata?: Json;
          short_title?: string | null;
          skills?: string[];
          status?: string;
          team_member_id?: string;
          title?: string;
          updated_at?: string;
          valid_from?: string | null;
          verification_status?: string;
          verification_url?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_member_certificates_document_media_asset_id_fkey";
            columns: ["document_media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_certificates_document_media_asset_id_fkey";
            columns: ["document_media_asset_id"];
            isOneToOne: false;
            referencedRelation: "published_media_assets";
            referencedColumns: ["media_asset_id"];
          },
          {
            foreignKeyName: "team_member_certificates_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_member_profile_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_certificates_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_certificates_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      team_member_experiences: {
        Row: {
          created_at: string;
          display_order: number;
          experience_id: string;
          is_primary: boolean;
          role_label: string;
          team_member_id: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          experience_id: string;
          is_primary?: boolean;
          role_label?: string;
          team_member_id: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          experience_id?: string;
          is_primary?: boolean;
          role_label?: string;
          team_member_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_member_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "team_member_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "team_member_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_experiences_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_member_profile_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_experiences_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          }
        ];
      };
      team_member_metrics: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          label: string;
          team_member_id: string;
          updated_at: string;
          value_text: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          label: string;
          team_member_id: string;
          updated_at?: string;
          value_text: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          label?: string;
          team_member_id?: string;
          updated_at?: string;
          value_text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_member_metrics_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_member_profile_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_metrics_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          }
        ];
      };
      team_member_specialties: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          icon_key: string | null;
          id: string;
          team_member_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon_key?: string | null;
          id?: string;
          team_member_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon_key?: string | null;
          id?: string;
          team_member_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_member_specialties_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_member_profile_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_member_specialties_team_member_id_fkey";
            columns: ["team_member_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          }
        ];
      };
      team_members: {
        Row: {
          bio: string | null;
          certifications: Json;
          created_at: string;
          display_name: string | null;
          display_order: number;
          email: string | null;
          first_name: string;
          hero_image_path: string | null;
          hobbies: Json;
          home_base: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          languages: Json;
          last_name: string;
          phone: string | null;
          photo_alt_text: string | null;
          photo_path: string | null;
          profile_id: string | null;
          role_title: string;
          seo_description: string | null;
          seo_title: string | null;
          short_bio: string | null;
          signature_path: string | null;
          slug: string;
          social_links: Json;
          tagline: string | null;
          updated_at: string;
          years_experience: number | null;
        };
        Insert: {
          bio?: string | null;
          certifications?: Json;
          created_at?: string;
          display_name?: string | null;
          display_order?: number;
          email?: string | null;
          first_name: string;
          hero_image_path?: string | null;
          hobbies?: Json;
          home_base?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          languages?: Json;
          last_name: string;
          phone?: string | null;
          photo_alt_text?: string | null;
          photo_path?: string | null;
          profile_id?: string | null;
          role_title: string;
          seo_description?: string | null;
          seo_title?: string | null;
          short_bio?: string | null;
          signature_path?: string | null;
          slug: string;
          social_links?: Json;
          tagline?: string | null;
          updated_at?: string;
          years_experience?: number | null;
        };
        Update: {
          bio?: string | null;
          certifications?: Json;
          created_at?: string;
          display_name?: string | null;
          display_order?: number;
          email?: string | null;
          first_name?: string;
          hero_image_path?: string | null;
          hobbies?: Json;
          home_base?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          languages?: Json;
          last_name?: string;
          phone?: string | null;
          photo_alt_text?: string | null;
          photo_path?: string | null;
          profile_id?: string | null;
          role_title?: string;
          seo_description?: string | null;
          seo_title?: string | null;
          short_bio?: string | null;
          signature_path?: string | null;
          slug?: string;
          social_links?: Json;
          tagline?: string | null;
          updated_at?: string;
          years_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          customer_id: string | null;
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
          customer_id?: string | null;
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
          customer_id?: string | null;
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
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
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
            referencedRelation: "admin_partner_performance";
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
      waivers: {
        Row: {
          booking_id: string;
          created_at: string;
          document_version: string;
          id: string;
          ip_address: unknown;
          participant_id: string | null;
          signature_data: Json;
          signed_at: string | null;
          signed_name: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          document_version: string;
          id?: string;
          ip_address?: unknown;
          participant_id?: string | null;
          signature_data?: Json;
          signed_at?: string | null;
          signed_name?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          document_version?: string;
          id?: string;
          ip_address?: unknown;
          participant_id?: string | null;
          signature_data?: Json;
          signed_at?: string | null;
          signed_name?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "waivers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "admin_booking_queue";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "waivers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "booking_detail";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "waivers_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "waivers_participant_id_fkey";
            columns: ["participant_id"];
            isOneToOne: false;
            referencedRelation: "booking_participants";
            referencedColumns: ["id"];
          }
        ];
      };
      yacht_menu_ingredients: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          ingredient_name: string;
          is_optional: boolean;
          menu_id: string;
          metadata: Json;
          preparation_notes: string | null;
          quantity_text: string | null;
          quantity_value: number | null;
          section: string | null;
          storage_method: string | null;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          ingredient_name: string;
          is_optional?: boolean;
          menu_id: string;
          metadata?: Json;
          preparation_notes?: string | null;
          quantity_text?: string | null;
          quantity_value?: number | null;
          section?: string | null;
          storage_method?: string | null;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          ingredient_name?: string;
          is_optional?: boolean;
          menu_id?: string;
          metadata?: Json;
          preparation_notes?: string | null;
          quantity_text?: string | null;
          quantity_value?: number | null;
          section?: string | null;
          storage_method?: string | null;
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "yacht_menu_ingredients_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "yacht_menus";
            referencedColumns: ["id"];
          }
        ];
      };
      yacht_menus: {
        Row: {
          created_at: string;
          currency: string;
          description: string | null;
          dietary_tags: string[];
          display_order: number;
          experience_id: string;
          id: string;
          is_featured: boolean;
          menu_items: Json;
          metadata: Json;
          price_amount_minor: number | null;
          serves_people: number;
          slug: string;
          status: Database["public"]["Enums"]["publication_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          dietary_tags?: string[];
          display_order?: number;
          experience_id: string;
          id?: string;
          is_featured?: boolean;
          menu_items?: Json;
          metadata?: Json;
          price_amount_minor?: number | null;
          serves_people?: number;
          slug: string;
          status?: Database["public"]["Enums"]["publication_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          dietary_tags?: string[];
          display_order?: number;
          experience_id?: string;
          id?: string;
          is_featured?: boolean;
          menu_items?: Json;
          metadata?: Json;
          price_amount_minor?: number | null;
          serves_people?: number;
          slug?: string;
          status?: Database["public"]["Enums"]["publication_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "yacht_menus_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "yacht_menus_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "yacht_menus_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "yacht_menus_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
      yacht_sub_experiences: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          duration_minutes: number | null;
          experience_id: string;
          highlights: Json;
          id: string;
          ideal_for: string[];
          is_featured: boolean;
          metadata: Json;
          operational_notes: string | null;
          route_summary: string | null;
          short_description: string | null;
          slug: string;
          status: Database["public"]["Enums"]["publication_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          duration_minutes?: number | null;
          experience_id: string;
          highlights?: Json;
          id?: string;
          ideal_for?: string[];
          is_featured?: boolean;
          metadata?: Json;
          operational_notes?: string | null;
          route_summary?: string | null;
          short_description?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["publication_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          duration_minutes?: number | null;
          experience_id?: string;
          highlights?: Json;
          id?: string;
          ideal_for?: string[];
          is_featured?: boolean;
          metadata?: Json;
          operational_notes?: string | null;
          route_summary?: string | null;
          short_description?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["publication_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "yacht_sub_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "yacht_sub_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "yacht_sub_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "yacht_sub_experiences_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      admin_booking_queue: {
        Row: {
          availability_slot_id: string | null;
          booked_at: string | null;
          booking_reference: string | null;
          confirmed_at: string | null;
          contact_first_name: string | null;
          contact_last_name: string | null;
          created_at: string | null;
          currency: string | null;
          current_location_name: string | null;
          customer_email: string | null;
          customer_id: string | null;
          customer_phone: string | null;
          ends_at_snapshot: string | null;
          experience_id: string | null;
          experience_title_snapshot: string | null;
          experience_variant_id: string | null;
          id: string | null;
          location_name_snapshot: string | null;
          partner_id: string | null;
          partner_name: string | null;
          party_size: number | null;
          payment_status: Database["public"]["Enums"]["payment_status"] | null;
          referral_id: string | null;
          source_channel: string | null;
          special_requests: string | null;
          starts_at_snapshot: string | null;
          status: Database["public"]["Enums"]["booking_status"] | null;
          timezone_snapshot: string | null;
          total_amount_minor: number | null;
          updated_at: string | null;
          variant_name_snapshot: string | null;
          voucher_amount_minor: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "admin_capacity_calendar";
            referencedColumns: [
              "availability_slot_id",
              "experience_variant_id"
            ];
          },
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "availability_slots";
            referencedColumns: ["id", "experience_variant_id"];
          },
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "booking_availability";
            referencedColumns: [
              "availability_slot_id",
              "experience_variant_id"
            ];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
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
            referencedRelation: "admin_partner_performance";
            referencedColumns: ["id"];
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
      admin_capacity_calendar: {
        Row: {
          assigned_team: Json | null;
          availability_slot_id: string | null;
          booking_cutoff_at: string | null;
          capacity_available: number | null;
          capacity_reserved: number | null;
          capacity_total: number | null;
          city: string | null;
          ends_at: string | null;
          experience_id: string | null;
          experience_title: string | null;
          experience_variant_id: string | null;
          is_instant_confirmation: boolean | null;
          location_id: string | null;
          location_name: string | null;
          starts_at: string | null;
          status: Database["public"]["Enums"]["availability_status"] | null;
          timezone: string | null;
          variant_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "availability_slots_experience_variant_fk";
            columns: ["experience_variant_id", "experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_variants";
            referencedColumns: ["id", "experience_id"];
          },
          {
            foreignKeyName: "availability_slots_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "availability_slots_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_customer_summary: {
        Row: {
          booking_count_current: number | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          first_name: string | null;
          id: string | null;
          last_booking_at: string | null;
          last_booking_at_current: string | null;
          last_name: string | null;
          lifetime_bookings: number | null;
          lifetime_spent_minor: number | null;
          marketing_consent: boolean | null;
          marketing_consent_at: string | null;
          notes: string | null;
          paid_total_minor_current: number | null;
          phone: string | null;
          preferred_language: string | null;
          profile_id: string | null;
          updated_at: string | null;
          whatsapp_opt_in: boolean | null;
          whatsapp_opt_in_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_experience_health: {
        Row: {
          bookings_count: number | null;
          experience_type: string | null;
          id: string | null;
          is_featured: boolean | null;
          locations_count: number | null;
          media_count: number | null;
          next_slot_at: string | null;
          paid_revenue_minor: number | null;
          slug: string | null;
          sort_order: number | null;
          status: Database["public"]["Enums"]["publication_status"] | null;
          title: string | null;
          upcoming_slots_count: number | null;
          variants_count: number | null;
        };
        Relationships: [];
      };
      admin_partner_performance: {
        Row: {
          attribution_window_hours: number | null;
          bookings_count: number | null;
          conversion_percent: number | null;
          created_at: string | null;
          id: string | null;
          name: string | null;
          paid_revenue_minor: number | null;
          referral_code: string | null;
          referral_visits: number | null;
          referrals_count: number | null;
          slug: string | null;
          status: Database["public"]["Enums"]["partner_status"] | null;
          unique_referral_visitors: number | null;
          verified_referrals: number | null;
          voucher_percent_basis_points: number | null;
          voucher_value_minor: number | null;
          vouchers_issued: number | null;
          vouchers_redeemed: number | null;
          website_url: string | null;
        };
        Relationships: [];
      };
      booking_availability: {
        Row: {
          availability_slot_id: string | null;
          booking_cutoff_at: string | null;
          capacity_available: number | null;
          capacity_reserved_live: number | null;
          capacity_total: number | null;
          ends_at: string | null;
          experience_id: string | null;
          experience_variant_id: string | null;
          is_bookable: boolean | null;
          is_instant_confirmation: boolean | null;
          location_id: string | null;
          starts_at: string | null;
          status: Database["public"]["Enums"]["availability_status"] | null;
          timezone: string | null;
        };
        Insert: {
          availability_slot_id?: string | null;
          booking_cutoff_at?: string | null;
          capacity_available?: never;
          capacity_reserved_live?: never;
          capacity_total?: number | null;
          ends_at?: string | null;
          experience_id?: string | null;
          experience_variant_id?: string | null;
          is_bookable?: never;
          is_instant_confirmation?: boolean | null;
          location_id?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["availability_status"] | null;
          timezone?: string | null;
        };
        Update: {
          availability_slot_id?: string | null;
          booking_cutoff_at?: string | null;
          capacity_available?: never;
          capacity_reserved_live?: never;
          capacity_total?: number | null;
          ends_at?: string | null;
          experience_id?: string | null;
          experience_variant_id?: string | null;
          is_bookable?: never;
          is_instant_confirmation?: boolean | null;
          location_id?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["availability_status"] | null;
          timezone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "availability_slots_experience_variant_fk";
            columns: ["experience_variant_id", "experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_variants";
            referencedColumns: ["id", "experience_id"];
          },
          {
            foreignKeyName: "availability_slots_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "availability_slots_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_detail: {
        Row: {
          addons: Json | null;
          availability_slot_id: string | null;
          booked_at: string | null;
          booking_reference: string | null;
          cancellation_policy_snapshot: Json | null;
          cancelled_at: string | null;
          completed_at: string | null;
          confirmed_at: string | null;
          contact_first_name: string | null;
          contact_last_name: string | null;
          created_at: string | null;
          currency: string | null;
          customer_email: string | null;
          customer_id: string | null;
          customer_phone: string | null;
          customer_profile_id: string | null;
          ends_at_snapshot: string | null;
          experience_id: string | null;
          experience_title_snapshot: string | null;
          experience_variant_id: string | null;
          expires_at: string | null;
          id: string | null;
          location_id: string | null;
          location_name_snapshot: string | null;
          participants: Json | null;
          party_size: number | null;
          payment_status: Database["public"]["Enums"]["payment_status"] | null;
          preferred_language: string | null;
          price_lines: Json | null;
          pricing_snapshot: Json | null;
          special_requests: string | null;
          starts_at_snapshot: string | null;
          status: Database["public"]["Enums"]["booking_status"] | null;
          status_history: Json | null;
          subtotal_amount_minor: number | null;
          timezone_snapshot: string | null;
          total_amount_minor: number | null;
          unit_amount_minor: number | null;
          updated_at: string | null;
          variant_name_snapshot: string | null;
          voucher_amount_minor: number | null;
        };
        Insert: {
          addons?: never;
          availability_slot_id?: string | null;
          booked_at?: string | null;
          booking_reference?: string | null;
          cancellation_policy_snapshot?: Json | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          created_at?: string | null;
          currency?: string | null;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_phone?: string | null;
          customer_profile_id?: string | null;
          ends_at_snapshot?: string | null;
          experience_id?: string | null;
          experience_title_snapshot?: string | null;
          experience_variant_id?: string | null;
          expires_at?: string | null;
          id?: string | null;
          location_id?: string | null;
          location_name_snapshot?: string | null;
          participants?: never;
          party_size?: number | null;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          preferred_language?: string | null;
          price_lines?: never;
          pricing_snapshot?: Json | null;
          special_requests?: string | null;
          starts_at_snapshot?: string | null;
          status?: Database["public"]["Enums"]["booking_status"] | null;
          status_history?: never;
          subtotal_amount_minor?: number | null;
          timezone_snapshot?: string | null;
          total_amount_minor?: number | null;
          unit_amount_minor?: number | null;
          updated_at?: string | null;
          variant_name_snapshot?: string | null;
          voucher_amount_minor?: number | null;
        };
        Update: {
          addons?: never;
          availability_slot_id?: string | null;
          booked_at?: string | null;
          booking_reference?: string | null;
          cancellation_policy_snapshot?: Json | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_at?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          created_at?: string | null;
          currency?: string | null;
          customer_email?: string | null;
          customer_id?: string | null;
          customer_phone?: string | null;
          customer_profile_id?: string | null;
          ends_at_snapshot?: string | null;
          experience_id?: string | null;
          experience_title_snapshot?: string | null;
          experience_variant_id?: string | null;
          expires_at?: string | null;
          id?: string | null;
          location_id?: string | null;
          location_name_snapshot?: string | null;
          participants?: never;
          party_size?: number | null;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          preferred_language?: string | null;
          price_lines?: never;
          pricing_snapshot?: Json | null;
          special_requests?: string | null;
          starts_at_snapshot?: string | null;
          status?: Database["public"]["Enums"]["booking_status"] | null;
          status_history?: never;
          subtotal_amount_minor?: number | null;
          timezone_snapshot?: string | null;
          total_amount_minor?: number | null;
          unit_amount_minor?: number | null;
          updated_at?: string | null;
          variant_name_snapshot?: string | null;
          voucher_amount_minor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "admin_capacity_calendar";
            referencedColumns: [
              "availability_slot_id",
              "experience_variant_id"
            ];
          },
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "availability_slots";
            referencedColumns: ["id", "experience_variant_id"];
          },
          {
            foreignKeyName: "bookings_availability_slot_fk";
            columns: ["availability_slot_id", "experience_variant_id"];
            isOneToOne: false;
            referencedRelation: "booking_availability";
            referencedColumns: [
              "availability_slot_id",
              "experience_variant_id"
            ];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "admin_customer_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
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
            referencedRelation: "admin_experience_health";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["experience_id"];
          },
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experience_review_summaries";
            referencedColumns: ["experience_id"];
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
            foreignKeyName: "bookings_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "experience_map_catalog";
            referencedColumns: ["location_id"];
          },
          {
            foreignKeyName: "bookings_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      experience_map_catalog: {
        Row: {
          base_capacity: number | null;
          base_currency: string | null;
          category_label: string | null;
          city: string | null;
          country_code: string | null;
          duration_minutes: number | null;
          experience_id: string | null;
          experience_type: string | null;
          from_price_minor: number | null;
          hero_image_path: string | null;
          is_featured: boolean | null;
          is_primary_location: boolean | null;
          latitude: number | null;
          location_id: string | null;
          location_name: string | null;
          location_short_name: string | null;
          location_slug: string | null;
          longitude: number | null;
          map_zoom: number | null;
          meeting_point: string | null;
          next_available_at: string | null;
          province: string | null;
          short_description: string | null;
          slug: string | null;
          team_members: Json | null;
          title: string | null;
          upcoming_slot_count: number | null;
        };
        Relationships: [];
      };
      experience_review_summaries: {
        Row: {
          average_rating: number | null;
          experience_id: string | null;
          review_count: number | null;
        };
        Relationships: [];
      };
      professional_documents_admin: {
        Row: {
          category: string | null;
          computed_status: string | null;
          confidentiality_level: string | null;
          created_at: string | null;
          document_number: string | null;
          document_type: string | null;
          does_not_expire: boolean | null;
          expires_on: string | null;
          files: Json | null;
          id: string | null;
          issued_on: string | null;
          issuing_authority: string | null;
          issuing_country_code: string | null;
          metadata: Json | null;
          notes: string | null;
          profile_id: string | null;
          qualification: string | null;
          replaces_document_id: string | null;
          restrictions: string | null;
          status: string | null;
          stcw_code: string | null;
          team_member_certificate_id: string | null;
          title: string | null;
          updated_at: string | null;
          uploaded_by_profile_id: string | null;
          valid_from: string | null;
          verification_status: string | null;
          verified_at: string | null;
          verified_by_profile_id: string | null;
        };
        Insert: {
          category?: string | null;
          computed_status?: never;
          confidentiality_level?: string | null;
          created_at?: string | null;
          document_number?: string | null;
          document_type?: string | null;
          does_not_expire?: boolean | null;
          expires_on?: string | null;
          files?: never;
          id?: string | null;
          issued_on?: string | null;
          issuing_authority?: string | null;
          issuing_country_code?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          profile_id?: string | null;
          qualification?: string | null;
          replaces_document_id?: string | null;
          restrictions?: string | null;
          status?: string | null;
          stcw_code?: string | null;
          team_member_certificate_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          uploaded_by_profile_id?: string | null;
          valid_from?: string | null;
          verification_status?: string | null;
          verified_at?: string | null;
          verified_by_profile_id?: string | null;
        };
        Update: {
          category?: string | null;
          computed_status?: never;
          confidentiality_level?: string | null;
          created_at?: string | null;
          document_number?: string | null;
          document_type?: string | null;
          does_not_expire?: boolean | null;
          expires_on?: string | null;
          files?: never;
          id?: string | null;
          issued_on?: string | null;
          issuing_authority?: string | null;
          issuing_country_code?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          profile_id?: string | null;
          qualification?: string | null;
          replaces_document_id?: string | null;
          restrictions?: string | null;
          status?: string | null;
          stcw_code?: string | null;
          team_member_certificate_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          uploaded_by_profile_id?: string | null;
          valid_from?: string | null;
          verification_status?: string | null;
          verified_at?: string | null;
          verified_by_profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "professional_documents_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_replaces_document_id_fkey";
            columns: ["replaces_document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_replaces_document_id_fkey";
            columns: ["replaces_document_id"];
            isOneToOne: false;
            referencedRelation: "professional_documents_admin";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_team_member_certificate_id_fkey";
            columns: ["team_member_certificate_id"];
            isOneToOne: false;
            referencedRelation: "team_member_certificates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_uploaded_by_profile_id_fkey";
            columns: ["uploaded_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_documents_verified_by_profile_id_fkey";
            columns: ["verified_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      professional_services_public: {
        Row: {
          accommodation_required: boolean | null;
          audience: string[] | null;
          currency_code: string | null;
          day_rate_from_minor: number | null;
          deliverables: Json | null;
          description: string | null;
          direct_booking_enabled: boolean | null;
          engagement_units: string[] | null;
          geographic_scope: string | null;
          inquiry_required: boolean | null;
          languages: string[] | null;
          lead_time_days: number | null;
          metadata: Json | null;
          minimum_engagement_unit: string | null;
          minimum_engagement_value: number | null;
          price_from_minor: number | null;
          pricing_model: string | null;
          qualifications: string[] | null;
          regions: string[] | null;
          requirements: Json | null;
          seo_description: string | null;
          seo_title: string | null;
          service_category: string | null;
          service_features: Json | null;
          service_key: string | null;
          short_title: string | null;
          slug: string | null;
          sort_order: number | null;
          summary: string | null;
          title: string | null;
          travel_costs_included: boolean | null;
          travel_required: boolean | null;
          vessel_types: string[] | null;
          week_rate_from_minor: number | null;
        };
        Insert: {
          accommodation_required?: boolean | null;
          audience?: string[] | null;
          currency_code?: string | null;
          day_rate_from_minor?: number | null;
          deliverables?: Json | null;
          description?: string | null;
          direct_booking_enabled?: boolean | null;
          engagement_units?: string[] | null;
          geographic_scope?: string | null;
          inquiry_required?: boolean | null;
          languages?: string[] | null;
          lead_time_days?: number | null;
          metadata?: Json | null;
          minimum_engagement_unit?: string | null;
          minimum_engagement_value?: number | null;
          price_from_minor?: number | null;
          pricing_model?: string | null;
          qualifications?: string[] | null;
          regions?: string[] | null;
          requirements?: Json | null;
          seo_description?: string | null;
          seo_title?: string | null;
          service_category?: string | null;
          service_features?: Json | null;
          service_key?: string | null;
          short_title?: string | null;
          slug?: string | null;
          sort_order?: number | null;
          summary?: string | null;
          title?: string | null;
          travel_costs_included?: boolean | null;
          travel_required?: boolean | null;
          vessel_types?: string[] | null;
          week_rate_from_minor?: number | null;
        };
        Update: {
          accommodation_required?: boolean | null;
          audience?: string[] | null;
          currency_code?: string | null;
          day_rate_from_minor?: number | null;
          deliverables?: Json | null;
          description?: string | null;
          direct_booking_enabled?: boolean | null;
          engagement_units?: string[] | null;
          geographic_scope?: string | null;
          inquiry_required?: boolean | null;
          languages?: string[] | null;
          lead_time_days?: number | null;
          metadata?: Json | null;
          minimum_engagement_unit?: string | null;
          minimum_engagement_value?: number | null;
          price_from_minor?: number | null;
          pricing_model?: string | null;
          qualifications?: string[] | null;
          regions?: string[] | null;
          requirements?: Json | null;
          seo_description?: string | null;
          seo_title?: string | null;
          service_category?: string | null;
          service_features?: Json | null;
          service_key?: string | null;
          short_title?: string | null;
          slug?: string | null;
          sort_order?: number | null;
          summary?: string | null;
          title?: string | null;
          travel_costs_included?: boolean | null;
          travel_required?: boolean | null;
          vessel_types?: string[] | null;
          week_rate_from_minor?: number | null;
        };
        Relationships: [];
      };
      published_media_assets: {
        Row: {
          alt_text: string | null;
          asset_key: string | null;
          asset_metadata: Json | null;
          blurhash: string | null;
          breakpoint: string | null;
          bucket_id: string | null;
          caption: string | null;
          component_key: string | null;
          display_order: number | null;
          dominant_color: string | null;
          duration_seconds: number | null;
          entity_id: string | null;
          focal_x: number | null;
          focal_y: number | null;
          folder_path: string | null;
          height: number | null;
          id: string | null;
          is_primary: boolean | null;
          link_url: string | null;
          locale: string | null;
          media_asset_id: string | null;
          media_type: string | null;
          mime_type: string | null;
          open_in_new_tab: boolean | null;
          page_path: string | null;
          parent_entity_id: string | null;
          placement_id: string | null;
          placement_key: string | null;
          placement_metadata: Json | null;
          role: string | null;
          scope_key: string | null;
          scope_type: string | null;
          section_key: string | null;
          storage_path: string | null;
          usage: string | null;
          variant: string | null;
          visibility: Database["public"]["Enums"]["media_visibility"] | null;
          width: number | null;
        };
        Relationships: [];
      };
      strategy_cards_public: {
        Row: {
          action_plan: Json | null;
          audience_key: string | null;
          channels: string[] | null;
          description: string | null;
          metadata: Json | null;
          mission_statements: Json | null;
          objective: string | null;
          priority: number | null;
          slug: string | null;
          sort_order: number | null;
          stakeholder_key: string | null;
          status: string | null;
          strategy_type: string | null;
          success_metrics: Json | null;
          summary: string | null;
          target_audience: string[] | null;
          title: string | null;
          user_role: Database["public"]["Enums"]["app_role"] | null;
          win_win: Json | null;
        };
        Insert: {
          action_plan?: Json | null;
          audience_key?: never;
          channels?: string[] | null;
          description?: string | null;
          metadata?: Json | null;
          mission_statements?: never;
          objective?: string | null;
          priority?: number | null;
          slug?: string | null;
          sort_order?: number | null;
          stakeholder_key?: string | null;
          status?: string | null;
          strategy_type?: string | null;
          success_metrics?: Json | null;
          summary?: string | null;
          target_audience?: string[] | null;
          title?: string | null;
          user_role?: Database["public"]["Enums"]["app_role"] | null;
          win_win?: Json | null;
        };
        Update: {
          action_plan?: Json | null;
          audience_key?: never;
          channels?: string[] | null;
          description?: string | null;
          metadata?: Json | null;
          mission_statements?: never;
          objective?: string | null;
          priority?: number | null;
          slug?: string | null;
          sort_order?: number | null;
          stakeholder_key?: string | null;
          status?: string | null;
          strategy_type?: string | null;
          success_metrics?: Json | null;
          summary?: string | null;
          target_audience?: string[] | null;
          title?: string | null;
          user_role?: Database["public"]["Enums"]["app_role"] | null;
          win_win?: Json | null;
        };
        Relationships: [];
      };
      team_member_profile_detail: {
        Row: {
          bio: string | null;
          certifications: Json | null;
          created_at: string | null;
          display_name: string | null;
          display_order: number | null;
          email: string | null;
          experiences: Json | null;
          first_name: string | null;
          hero_image_path: string | null;
          hobbies: Json | null;
          home_base: string | null;
          id: string | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          languages: Json | null;
          last_name: string | null;
          media: Json | null;
          metrics: Json | null;
          phone: string | null;
          photo_alt_text: string | null;
          photo_path: string | null;
          profile_id: string | null;
          role_title: string | null;
          seo_description: string | null;
          seo_title: string | null;
          short_bio: string | null;
          signature_path: string | null;
          slug: string | null;
          social_links: Json | null;
          specialties: Json | null;
          tagline: string | null;
          updated_at: string | null;
          years_experience: number | null;
        };
        Insert: {
          bio?: string | null;
          certifications?: Json | null;
          created_at?: string | null;
          display_name?: string | null;
          display_order?: number | null;
          email?: string | null;
          experiences?: never;
          first_name?: string | null;
          hero_image_path?: string | null;
          hobbies?: Json | null;
          home_base?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          languages?: Json | null;
          last_name?: string | null;
          media?: never;
          metrics?: never;
          phone?: string | null;
          photo_alt_text?: string | null;
          photo_path?: string | null;
          profile_id?: string | null;
          role_title?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          short_bio?: string | null;
          signature_path?: string | null;
          slug?: string | null;
          social_links?: Json | null;
          specialties?: never;
          tagline?: string | null;
          updated_at?: string | null;
          years_experience?: number | null;
        };
        Update: {
          bio?: string | null;
          certifications?: Json | null;
          created_at?: string | null;
          display_name?: string | null;
          display_order?: number | null;
          email?: string | null;
          experiences?: never;
          first_name?: string | null;
          hero_image_path?: string | null;
          hobbies?: Json | null;
          home_base?: string | null;
          id?: string | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          languages?: Json | null;
          last_name?: string | null;
          media?: never;
          metrics?: never;
          phone?: string | null;
          photo_alt_text?: string | null;
          photo_path?: string | null;
          profile_id?: string | null;
          role_title?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          short_bio?: string | null;
          signature_path?: string | null;
          slug?: string | null;
          social_links?: Json | null;
          specialties?: never;
          tagline?: string | null;
          updated_at?: string | null;
          years_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      admin_archive_booking_story: {
        Args: { p_story_id: string };
        Returns: {
          booking_id: string;
          consent_received_at: string | null;
          consent_source: string | null;
          consent_status: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          experience_id: string;
          guest_country_code: string | null;
          guest_display_name: string | null;
          guest_quote: string | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          status: Database["public"]["Enums"]["booking_story_status"];
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "booking_stories";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_assign_slot_team: {
        Args: { p_slot_id: string; p_team_members: Json };
        Returns: Json;
      };
      admin_attach_booking_story_media: {
        Args: {
          p_caption?: string;
          p_display_order?: number;
          p_is_primary?: boolean;
          p_media_asset_id: string;
          p_media_role?: Database["public"]["Enums"]["booking_story_media_role"];
          p_story_id: string;
        };
        Returns: {
          booking_story_id: string;
          caption: string | null;
          created_at: string;
          display_order: number;
          id: string;
          is_active: boolean;
          is_primary: boolean;
          media_asset_id: string;
          media_role: Database["public"]["Enums"]["booking_story_media_role"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "booking_story_media";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_booking_detail: { Args: { p_booking_id: string }; Returns: Json };
      admin_complete_past_slots: { Args: never; Returns: number };
      admin_create_booking_story: {
        Args: {
          p_booking_id: string;
          p_consent_source?: string;
          p_consent_status?: Database["public"]["Enums"]["booking_story_consent_status"];
          p_description?: string;
          p_guest_country_code?: string;
          p_guest_display_name?: string;
          p_guest_quote?: string;
          p_subtitle?: string;
          p_title: string;
        };
        Returns: {
          booking_id: string;
          consent_received_at: string | null;
          consent_source: string | null;
          consent_status: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          experience_id: string;
          guest_country_code: string | null;
          guest_display_name: string | null;
          guest_quote: string | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          status: Database["public"]["Enums"]["booking_story_status"];
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "booking_stories";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_create_partner_payout: {
        Args: {
          p_adjustment_amount_minor?: number;
          p_notes?: string;
          p_partner_id: string;
          p_period_end: string;
          p_period_start: string;
        };
        Returns: {
          account_holder_snapshot: string;
          adjustment_amount_minor: number;
          approved_at: string | null;
          approved_by: string | null;
          bank_name_snapshot: string | null;
          bic_swift_snapshot: string | null;
          created_at: string;
          currency: string;
          external_payment_id: string | null;
          gross_voucher_amount_minor: number;
          iban_snapshot: string;
          id: string;
          net_amount_minor: number | null;
          notes: string | null;
          paid_at: string | null;
          paid_by: string | null;
          partner_id: string;
          payment_method: string;
          payment_reference: string | null;
          period_end: string;
          period_start: string;
          status: Database["public"]["Enums"]["partner_payout_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "partner_payouts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_customer_detail: { Args: { p_customer_id: string }; Returns: Json };
      admin_dashboard_overview: {
        Args: { p_from?: string; p_to?: string };
        Returns: Json;
      };
      admin_delete_entity: {
        Args: { p_entity_id: string; p_entity_type: string; p_reason?: string };
        Returns: boolean;
      };
      admin_delete_media: {
        Args: { p_id: string; p_reason?: string };
        Returns: boolean;
      };
      admin_detach_media_placement: {
        Args: { p_placement_id: string };
        Returns: boolean;
      };
      admin_experience_detail: {
        Args: { p_experience_id: string };
        Returns: Json;
      };
      admin_expire_vouchers: { Args: never; Returns: number };
      admin_finalize_media_upload: {
        Args: { p_bucket_id: string; p_payload?: Json; p_storage_path: string };
        Returns: Json;
      };
      admin_finance_summary: {
        Args: { p_from: string; p_to: string };
        Returns: Json;
      };
      admin_link_media_to_scope: {
        Args: {
          p_items?: Json;
          p_role: string;
          p_scope_key: string;
          p_scope_type: string;
        };
        Returns: Json;
      };
      admin_list_bookings: {
        Args: {
          p_experience_id?: string;
          p_from?: string;
          p_location_id?: string;
          p_page?: number;
          p_page_size?: number;
          p_payment_status?: Database["public"]["Enums"]["payment_status"];
          p_search?: string;
          p_status?: Database["public"]["Enums"]["booking_status"];
          p_to?: string;
        };
        Returns: Json;
      };
      admin_list_calendar: {
        Args: {
          p_experience_id?: string;
          p_from: string;
          p_location_id?: string;
          p_team_member_id?: string;
          p_to: string;
        };
        Returns: Json;
      };
      admin_list_customers: {
        Args: { p_page?: number; p_page_size?: number; p_search?: string };
        Returns: Json;
      };
      admin_list_experiences: {
        Args: {
          p_search?: string;
          p_status?: Database["public"]["Enums"]["publication_status"];
        };
        Returns: Json;
      };
      admin_list_media: {
        Args: {
          p_entity_id?: string;
          p_entity_type?: string;
          p_media_type?: string;
          p_mime_type?: string;
          p_page?: number;
          p_page_size?: number;
          p_placement_usage?: string;
          p_scope_type?: string;
          p_search?: string;
          p_usage?: string;
        };
        Returns: Json;
      };
      admin_mark_partner_payout_paid: {
        Args: {
          p_external_payment_id?: string;
          p_notes?: string;
          p_payout_id: string;
        };
        Returns: {
          account_holder_snapshot: string;
          adjustment_amount_minor: number;
          approved_at: string | null;
          approved_by: string | null;
          bank_name_snapshot: string | null;
          bic_swift_snapshot: string | null;
          created_at: string;
          currency: string;
          external_payment_id: string | null;
          gross_voucher_amount_minor: number;
          iban_snapshot: string;
          id: string;
          net_amount_minor: number | null;
          notes: string | null;
          paid_at: string | null;
          paid_by: string | null;
          partner_id: string;
          payment_method: string;
          payment_reference: string | null;
          period_end: string;
          period_start: string;
          status: Database["public"]["Enums"]["partner_payout_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "partner_payouts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_moderate_review: {
        Args: { p_reason?: string; p_review_id: string; p_status: string };
        Returns: {
          booking_id: string;
          comment: string | null;
          created_at: string;
          customer_id: string | null;
          experience_id: string;
          id: string;
          published_at: string | null;
          rating: number;
          status: string;
          title: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "reviews";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_navigation_tree: { Args: never; Returns: Json };
      admin_publish_booking_story: {
        Args: { p_story_id: string };
        Returns: {
          booking_id: string;
          consent_received_at: string | null;
          consent_source: string | null;
          consent_status: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          experience_id: string;
          guest_country_code: string | null;
          guest_display_name: string | null;
          guest_quote: string | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          status: Database["public"]["Enums"]["booking_story_status"];
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "booking_stories";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_redeem_voucher: {
        Args: { p_notes?: string; p_voucher_id: string };
        Returns: {
          booking_id: string;
          code: string;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_id: string | null;
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
        SetofOptions: {
          from: "*";
          to: "vouchers";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_reference_data: { Args: never; Returns: Json };
      admin_remove_booking_story_media: {
        Args: { p_media_asset_id: string; p_story_id: string };
        Returns: undefined;
      };
      admin_replace_experience_collection: {
        Args: { p_collection: string; p_experience_id: string; p_items: Json };
        Returns: Json;
      };
      admin_replace_media_placement: {
        Args: {
          p_bucket_id: string;
          p_payload?: Json;
          p_placement_id: string;
          p_storage_path: string;
        };
        Returns: Json;
      };
      admin_replace_team_collection: {
        Args: { p_collection: string; p_items: Json; p_team_member_id: string };
        Returns: Json;
      };
      admin_set_booking_story_cover: {
        Args: { p_media_asset_id: string; p_story_id: string };
        Returns: {
          booking_id: string;
          consent_received_at: string | null;
          consent_source: string | null;
          consent_status: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          experience_id: string;
          guest_country_code: string | null;
          guest_display_name: string | null;
          guest_quote: string | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          status: Database["public"]["Enums"]["booking_story_status"];
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "booking_stories";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_set_media_primary: {
        Args: { p_placement_id: string };
        Returns: {
          alt_text_override: string | null;
          breakpoint: string;
          caption_override: string | null;
          created_at: string;
          display_order: number;
          entity_id: string;
          entity_type: string;
          id: string;
          is_active: boolean;
          is_primary: boolean;
          locale: string | null;
          media_asset_id: string;
          parent_entity_id: string | null;
          updated_at: string;
          usage: string;
        };
        SetofOptions: {
          from: "*";
          to: "media_placements";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_set_user_roles: {
        Args: {
          p_profile_id: string;
          p_roles: Database["public"]["Enums"]["app_role"][];
        };
        Returns: Json;
      };
      admin_system_health: { Args: never; Returns: Json };
      admin_team_member_detail: {
        Args: { p_team_member_id: string };
        Returns: Json;
      };
      admin_update_booking_status: {
        Args: {
          p_booking_id: string;
          p_new_status: Database["public"]["Enums"]["booking_status"];
          p_reason?: string;
        };
        Returns: {
          availability_slot_id: string | null;
          booked_at: string | null;
          booking_reference: string;
          cancellation_policy_snapshot: Json;
          cancelled_at: string | null;
          completed_at: string | null;
          confirmed_at: string | null;
          contact_first_name: string | null;
          contact_last_name: string | null;
          created_at: string;
          currency: string;
          customer_email: string;
          customer_id: string | null;
          customer_phone: string | null;
          customer_profile_id: string | null;
          ends_at_snapshot: string | null;
          experience_id: string;
          experience_title_snapshot: string | null;
          experience_variant_id: string;
          expires_at: string | null;
          id: string;
          idempotency_key: string | null;
          location_id: string | null;
          location_name_snapshot: string | null;
          metadata: Json;
          participant_notes: string | null;
          partner_id: string | null;
          partner_voucher_percent_basis_points_snapshot: number | null;
          party_size: number;
          payment_status: Database["public"]["Enums"]["payment_status"];
          preferred_language: string;
          pricing_snapshot: Json;
          referral_id: string | null;
          source_channel: string;
          special_requests: string | null;
          starts_at_snapshot: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          subtotal_amount_minor: number;
          terms_accepted_at: string | null;
          timezone_snapshot: string | null;
          total_amount_minor: number;
          unit_amount_minor: number;
          updated_at: string;
          variant_name_snapshot: string | null;
          version: number;
          voucher_amount_minor: number;
        };
        SetofOptions: {
          from: "*";
          to: "bookings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_update_booking_story: {
        Args: { p_patch: Json; p_story_id: string };
        Returns: {
          booking_id: string;
          consent_received_at: string | null;
          consent_source: string | null;
          consent_status: Database["public"]["Enums"]["booking_story_consent_status"];
          cover_media_asset_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          experience_id: string;
          guest_country_code: string | null;
          guest_display_name: string | null;
          guest_quote: string | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          status: Database["public"]["Enums"]["booking_story_status"];
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "booking_stories";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_addon: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: {
          created_at: string;
          currency: string;
          description: string | null;
          display_order: number;
          experience_id: string;
          id: string;
          is_active: boolean;
          max_quantity: number | null;
          name: string;
          pricing_model: Database["public"]["Enums"]["variant_pricing_model"];
          slug: string;
          unit_amount_minor: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "experience_addons";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_experience: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: {
          base_capacity: number;
          base_currency: string;
          category_label: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          experience_type: string | null;
          hero_image_path: string | null;
          highlights: Json;
          id: string;
          inclusions: Json;
          is_featured: boolean;
          location_name: string | null;
          manual_confirmation_required: boolean;
          media_folder: string | null;
          mentor_required: boolean;
          provider_profile_id: string | null;
          short_description: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["publication_status"];
          timezone: string;
          title: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "experiences";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_location: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: {
          address_line_1: string | null;
          address_line_2: string | null;
          city: string;
          country_code: string;
          created_at: string;
          description: string | null;
          google_maps_url: string | null;
          google_place_id: string | null;
          google_plus_code: string | null;
          id: string;
          is_active: boolean;
          latitude: number;
          longitude: number;
          map_zoom: number;
          meeting_point_notes: string | null;
          name: string;
          parking_notes: string | null;
          postal_code: string | null;
          province: string | null;
          short_name: string | null;
          slug: string;
          updated_at: string;
          what3words: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "locations";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_media_asset: {
        Args: { p_id: string; p_payload?: Json };
        Returns: {
          alt_text: string | null;
          alt_text_override: string | null;
          asset_key: string;
          blurhash: string | null;
          breakpoint: string;
          bucket_id: string;
          byte_size: number | null;
          caption: string | null;
          caption_override: string | null;
          component_key: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          display_order: number;
          dominant_color: string | null;
          duration_seconds: number | null;
          ends_at: string | null;
          etag: string | null;
          focal_unit: Database["public"]["Enums"]["media_focal_unit"];
          focal_x: number;
          focal_y: number;
          folder_path: string | null;
          generated_filename: string | null;
          height: number | null;
          id: string;
          is_active: boolean;
          is_primary: boolean;
          link_url: string | null;
          locale: string | null;
          media_type: string;
          metadata: Json;
          mime_type: string | null;
          open_in_new_tab: boolean;
          original_filename: string | null;
          page_path: string | null;
          placement_key: string | null;
          published_at: string | null;
          role: string;
          scope_key: string | null;
          scope_type: string | null;
          section_key: string | null;
          starts_at: string | null;
          status: Database["public"]["Enums"]["media_asset_status"];
          storage_object_id: string | null;
          storage_path: string;
          tags: string[];
          title: string | null;
          updated_at: string;
          variant: string | null;
          visibility: Database["public"]["Enums"]["media_visibility"];
          width: number | null;
        };
        SetofOptions: {
          from: "*";
          to: "media_assets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_navigation_item: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: Json;
      };
      admin_upsert_partner: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: {
          attribution_window_hours: number;
          business_type: string | null;
          contact_name: string | null;
          created_at: string;
          description: string | null;
          email: string | null;
          id: string;
          is_featured: boolean;
          location_id: string | null;
          name: string;
          owner_profile_id: string | null;
          phone: string | null;
          published_at: string;
          referral_code: string;
          slug: string;
          status: Database["public"]["Enums"]["partner_status"];
          updated_at: string;
          voucher_percent_basis_points: number;
          website_url: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "partners";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_partner_financial_profile: {
        Args: { p_partner_id: string; p_payload: Json };
        Returns: {
          account_holder: string;
          bank_name: string | null;
          bic_swift: string | null;
          billing_address_line_1: string | null;
          billing_address_line_2: string | null;
          billing_city: string | null;
          billing_country_code: string | null;
          billing_email: string | null;
          billing_phone: string | null;
          billing_postal_code: string | null;
          billing_province: string | null;
          created_at: string;
          iban: string;
          is_verified: boolean;
          legal_company_name: string;
          notes: string | null;
          partner_id: string;
          payment_reference_prefix: string | null;
          payment_terms_days: number;
          preferred_currency: string;
          tax_id: string | null;
          updated_at: string;
          vat_number: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "partner_financial_profiles";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_slot: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: {
          booking_cutoff_at: string | null;
          capacity_reserved: number;
          capacity_total: number;
          created_at: string;
          ends_at: string;
          experience_id: string;
          experience_variant_id: string;
          held_until: string | null;
          id: string;
          is_instant_confirmation: boolean;
          location_id: string | null;
          notes: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["availability_status"];
          timezone: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "availability_slots";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_team_member: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: {
          bio: string | null;
          certifications: Json;
          created_at: string;
          display_name: string | null;
          display_order: number;
          email: string | null;
          first_name: string;
          hero_image_path: string | null;
          hobbies: Json;
          home_base: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          languages: Json;
          last_name: string;
          phone: string | null;
          photo_alt_text: string | null;
          photo_path: string | null;
          profile_id: string | null;
          role_title: string;
          seo_description: string | null;
          seo_title: string | null;
          short_bio: string | null;
          signature_path: string | null;
          slug: string;
          social_links: Json;
          tagline: string | null;
          updated_at: string;
          years_experience: number | null;
        };
        SetofOptions: {
          from: "*";
          to: "team_members";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_upsert_variant: {
        Args: { p_id?: string; p_payload?: Json };
        Returns: {
          badge_label: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          duration_minutes: number | null;
          experience_id: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          max_party_size: number | null;
          min_party_size: number;
          name: string;
          pricing_model: Database["public"]["Enums"]["variant_pricing_model"];
          slug: string;
          subtitle: string | null;
          unit_amount_minor: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "experience_variants";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      booking_reserved_capacity: {
        Args: { p_slot_id: string };
        Returns: number;
      };
      build_professional_document_filename: {
        Args: {
          p_document_number: string;
          p_document_type: string;
          p_expires_on: string;
          p_extension: string;
          p_issued_on: string;
          p_profile_name: string;
          p_unique_suffix?: string;
        };
        Returns: string;
      };
      cancel_booking_voucher: {
        Args: { p_booking_id: string; p_reason?: string };
        Returns: Json;
      };
      confirm_paid_booking: {
        Args: { p_booking_id: string; p_provider_payment_id?: string };
        Returns: Json;
      };
      create_credential_access_grant: {
        Args: {
          p_access_expires_at?: string;
          p_document_ids: string[];
          p_message?: string;
          p_permission_download_files?: boolean;
          p_permission_include_document_number?: boolean;
          p_permission_include_history?: boolean;
          p_permission_view_files?: boolean;
          p_recipient_agency_label: string;
          p_recipient_email: string;
          p_selected_file_roles?: string[];
        };
        Returns: string;
      };
      create_credential_share_link: {
        Args: {
          p_expires_at: string;
          p_grant_id: string;
          p_max_downloads?: number;
          p_max_views?: number;
          p_recipient_agency_label?: string;
          p_recipient_email?: string;
          p_token_hash: string;
        };
        Returns: string;
      };
      create_experience_booking: {
        Args: {
          p_anonymous_session_id?: string;
          p_availability_slot_id: string;
          p_contact_first_name: string;
          p_contact_last_name: string;
          p_customer_email: string;
          p_customer_phone?: string;
          p_idempotency_key?: string;
          p_party_size: number;
          p_preferred_language?: string;
          p_referral_session_token_hash?: string;
          p_selected_referral_id?: string;
          p_special_requests?: string;
          p_terms_accepted?: boolean;
        };
        Returns: Json;
      };
      generate_public_code: { Args: { prefix?: string }; Returns: string };
      get_authenticated_credential_file_access: {
        Args: { p_document_file_id: string; p_intent?: string };
        Returns: Json;
      };
      get_authenticated_credential_portfolio: { Args: never; Returns: Json };
      get_experience_calendar: {
        Args: {
          p_experience_id: string;
          p_from: string;
          p_location_id?: string;
          p_team_member_id?: string;
          p_to: string;
        };
        Returns: {
          assigned_team_members: Json;
          booking_cutoff_at: string;
          capacity_available: number;
          capacity_reserved: number;
          capacity_total: number;
          ends_at: string;
          experience_id: string;
          experience_variant_id: string;
          is_instant_confirmation: boolean;
          latitude: number;
          location_id: string;
          location_name: string;
          longitude: number;
          slot_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["availability_status"];
          timezone: string;
          variant_name: string;
        }[];
      };
      get_experience_map:
        | {
            Args: {
              p_experience_type?: string;
              p_from?: string;
              p_team_member_id?: string;
              p_to?: string;
            };
            Returns: {
              available_slot_count: number;
              base_capacity: number;
              base_currency: string;
              category_label: string;
              city: string;
              duration_minutes: number;
              experience_id: string;
              experience_type: string;
              from_price_minor: number;
              hero_image_path: string;
              is_featured: boolean;
              latitude: number;
              location_id: string;
              location_name: string;
              location_slug: string;
              longitude: number;
              map_zoom: number;
              meeting_point: string;
              next_available_at: string;
              province: string;
              short_description: string;
              slug: string;
              team_members: Json;
              title: string;
            }[];
          }
        | {
            Args: {
              p_experience_type?: string;
              p_from?: string;
              p_locale?: string;
              p_team_member_id?: string;
              p_to?: string;
            };
            Returns: {
              available_slot_count: number;
              base_capacity: number;
              base_currency: string;
              category_label: string;
              city: string;
              duration_minutes: number;
              experience_id: string;
              experience_type: string;
              from_price_minor: number;
              hero_image_path: string;
              is_featured: boolean;
              latitude: number;
              location_id: string;
              location_name: string;
              location_slug: string;
              longitude: number;
              map_zoom: number;
              meeting_point: string;
              next_available_at: string;
              province: string;
              short_description: string;
              slug: string;
              team_members: Json;
              title: string;
            }[];
          };
      get_public_experience_booking_stories: {
        Args: {
          p_experience_slug: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Json;
      };
      get_public_partner_directory: {
        Args: { p_locale?: string };
        Returns: {
          address_line_1: string;
          attributed_booking_count: number;
          category: string;
          city: string;
          conversion_rate: number;
          country_code: string;
          directions_url: string;
          image_alt_text: string;
          image_bucket_id: string;
          image_storage_path: string;
          is_featured: boolean;
          latitude: number;
          location_id: string;
          location_name: string;
          location_slug: string;
          logo_alt_text: string;
          logo_bucket_id: string;
          logo_storage_path: string;
          longitude: number;
          map_zoom: number;
          most_booked_experience_name: string;
          most_booked_experience_slug: string;
          name: string;
          partner_id: string;
          phone: string;
          postal_code: string;
          province: string;
          published_at: string;
          qr_scan_count: number;
          short_description: string;
          slug: string;
          total_booking_count: number;
          total_partner_count: number;
          total_qr_scan_count: number;
          website_url: string;
        }[];
      };
      get_public_partner_invitation: {
        Args: { p_locale?: string; p_partner_slug: string };
        Returns: {
          business_type: string;
          image_alt_text: string;
          image_bucket_id: string;
          image_storage_path: string;
          invitation_body: string;
          location_city: string;
          location_country_code: string;
          location_name: string;
          location_province: string;
          logo_alt_text: string;
          logo_bucket_id: string;
          logo_storage_path: string;
          outreach_subject: string;
          partner_description: string;
          partner_id: string;
          partner_name: string;
          partner_slug: string;
          website_url: string;
        }[];
      };
      get_public_referral_landing: {
        Args: { p_locale?: string; p_visit_token: string };
        Returns: Json;
      };
      get_public_strategy_cards: {
        Args: { requested_locale?: string };
        Returns: {
          action_plan: Json;
          audience_key: string;
          channels: string[];
          description: string;
          metadata: Json;
          mission_statements: Json;
          objective: string;
          priority: number;
          simple_workflow_steps: Json;
          slug: string;
          sort_order: number;
          stakeholder_key: string;
          status: string;
          strategy_type: string;
          success_metrics: Json;
          summary: string;
          target_audience: string[];
          title: string;
          user_role: Database["public"]["Enums"]["app_role"];
          win_win: Json;
        }[];
      };
      get_shared_credential_file_access: {
        Args: {
          p_document_file_id: string;
          p_intent?: string;
          p_token: string;
        };
        Returns: Json;
      };
      get_shared_credential_portfolio: {
        Args: { p_token: string };
        Returns: Json;
      };
      get_verified_referral_context: {
        Args: { p_session_token_hash: string };
        Returns: Json;
      };
      has_any_role: {
        Args: {
          p_roles: Database["public"]["Enums"]["app_role"][];
          p_user_id: string;
        };
        Returns: boolean;
      };
      list_owner_credential_access_grants: {
        Args: never;
        Returns: {
          access_expires_at: string | null;
          created_at: string;
          created_by_profile_id: string;
          id: string;
          last_login_at: string | null;
          last_magic_link_sent_at: string | null;
          message: string | null;
          owner_profile_id: string;
          permission_download_files: boolean;
          permission_include_document_number: boolean;
          permission_include_history: boolean;
          permission_view_files: boolean;
          recipient_agency_label: string | null;
          recipient_email: string;
          recipient_profile_id: string | null;
          revoked_at: string | null;
          revoked_by_profile_id: string | null;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "credential_access_grants";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      localized_role_benefit: {
        Args: { p_locale: string; p_role: string };
        Returns: string;
      };
      localized_role_motivation: {
        Args: { p_locale: string; p_role: string };
        Returns: string;
      };
      mark_booking_payment_processing: {
        Args: { p_booking_id: string; p_provider_payment_id?: string };
        Returns: Json;
      };
      mark_credential_magic_link_sent: {
        Args: { p_grant_id: string };
        Returns: undefined;
      };
      media_assets_is_keep_object: {
        Args: { object_name: string };
        Returns: boolean;
      };
      record_referral_verification_email_outcome: {
        Args: {
          p_provider_message_id?: string;
          p_succeeded: boolean;
          p_verification_token_hash: string;
        };
        Returns: undefined;
      };
      register_partner_referral_visit: {
        Args: {
          p_landing_path?: string;
          p_partner_code: string;
          p_visitor_token_hash: string;
        };
        Returns: Json;
      };
      release_booking_hold: {
        Args: { p_booking_id: string };
        Returns: boolean;
      };
      release_expired_booking_holds: { Args: never; Returns: number };
      revoke_credential_access_grant: {
        Args: { p_grant_id: string; p_reason?: string };
        Returns: undefined;
      };
      set_booking_participants: {
        Args: { p_booking_id: string; p_participants: Json };
        Returns: Json;
      };
      slugify_document_filename_part: {
        Args: { value: string };
        Returns: string;
      };
      submit_referral_contact: {
        Args: {
          p_email: string;
          p_expires_at: string;
          p_first_name: string;
          p_last_name: string;
          p_marketing_consent: boolean;
          p_phone: string;
          p_preferred_locale: string;
          p_verification_token_hash: string;
          p_visit_token: string;
          p_whatsapp_opt_in: boolean;
        };
        Returns: Json;
      };
      verify_referral_contact: {
        Args: {
          p_session_token_hash: string;
          p_verification_token_hash: string;
        };
        Returns: Json;
      };
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
      booking_story_consent_status: "pending" | "granted" | "revoked";
      booking_story_media_role:
        | "cover"
        | "gallery"
        | "highlight"
        | "video"
        | "thumbnail";
      booking_story_status: "draft" | "published" | "archived";
      media_asset_status: "draft" | "published" | "archived";
      media_focal_unit: "percent";
      media_visibility: "public" | "authenticated" | "private";
      partner_outreach_channel:
        | "in_person"
        | "phone"
        | "email"
        | "whatsapp"
        | "instagram"
        | "facebook"
        | "linkedin"
        | "website_form"
        | "other";
      partner_outreach_status:
        | "planned"
        | "contacted"
        | "follow_up_due"
        | "interested"
        | "meeting_scheduled"
        | "proposal_sent"
        | "onboarding"
        | "won"
        | "not_interested"
        | "no_response"
        | "paused";
      partner_payout_item_status: "pending" | "approved" | "paid" | "cancelled";
      partner_payout_status:
        | "draft"
        | "ready"
        | "processing"
        | "paid"
        | "cancelled";
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
      booking_story_consent_status: ["pending", "granted", "revoked"],
      booking_story_media_role: [
        "cover",
        "gallery",
        "highlight",
        "video",
        "thumbnail"
      ],
      booking_story_status: ["draft", "published", "archived"],
      media_asset_status: ["draft", "published", "archived"],
      media_focal_unit: ["percent"],
      media_visibility: ["public", "authenticated", "private"],
      partner_outreach_channel: [
        "in_person",
        "phone",
        "email",
        "whatsapp",
        "instagram",
        "facebook",
        "linkedin",
        "website_form",
        "other"
      ],
      partner_outreach_status: [
        "planned",
        "contacted",
        "follow_up_due",
        "interested",
        "meeting_scheduled",
        "proposal_sent",
        "onboarding",
        "won",
        "not_interested",
        "no_response",
        "paused"
      ],
      partner_payout_item_status: ["pending", "approved", "paid", "cancelled"],
      partner_payout_status: [
        "draft",
        "ready",
        "processing",
        "paid",
        "cancelled"
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
