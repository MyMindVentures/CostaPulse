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
      partners: {
        Row: {
          address_line_1: string | null;
          address_line_2: string | null;
          attribution_window_hours: number;
          business_type: string | null;
          city: string | null;
          contact_name: string | null;
          country_code: string | null;
          created_at: string;
          email: string | null;
          id: string;
          is_featured: boolean;
          location_id: string | null;
          name: string;
          owner_profile_id: string | null;
          phone: string | null;
          postal_code: string | null;
          province: string | null;
          published_at: string;
          referral_code: string;
          slug: string;
          status: Database["public"]["Enums"]["partner_status"];
          updated_at: string;
          voucher_percent_basis_points: number;
          website_url: string | null;
        };
        Insert: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          attribution_window_hours?: number;
          business_type?: string | null;
          city?: string | null;
          contact_name?: string | null;
          country_code?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_featured?: boolean;
          location_id?: string | null;
          name: string;
          owner_profile_id?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          province?: string | null;
          published_at?: string;
          referral_code?: string;
          slug: string;
          status?: Database["public"]["Enums"]["partner_status"];
          updated_at?: string;
          voucher_percent_basis_points?: number;
          website_url?: string | null;
        };
        Update: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          attribution_window_hours?: number;
          business_type?: string | null;
          city?: string | null;
          contact_name?: string | null;
          country_code?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_featured?: boolean;
          location_id?: string | null;
          name?: string;
          owner_profile_id?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          province?: string | null;
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
          address_line_1: string | null;
          address_line_2: string | null;
          attribution_window_hours: number;
          business_type: string | null;
          city: string | null;
          contact_name: string | null;
          country_code: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          owner_profile_id: string | null;
          phone: string | null;
          postal_code: string | null;
          province: string | null;
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
      cancel_booking_voucher: {
        Args: { p_booking_id: string; p_reason?: string };
        Returns: Json;
      };
      confirm_paid_booking: {
        Args: { p_booking_id: string; p_provider_payment_id?: string };
        Returns: Json;
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
          address_line_1: string | null;
          attributed_booking_count: number;
          category: string | null;
          city: string;
          conversion_rate: number;
          country_code: string;
          directions_url: string | null;
          image_alt_text: string | null;
          image_bucket_id: string | null;
          image_storage_path: string | null;
          is_featured: boolean;
          latitude: number;
          location_id: string;
          location_name: string;
          location_slug: string;
          logo_alt_text: string | null;
          logo_bucket_id: string | null;
          logo_storage_path: string | null;
          longitude: number;
          map_zoom: number;
          most_booked_experience_name: string | null;
          most_booked_experience_slug: string | null;
          name: string;
          partner_id: string;
          phone: string | null;
          postal_code: string | null;
          province: string | null;
          published_at: string;
          qr_scan_count: number;
          short_description: string | null;
          slug: string;
          total_booking_count: number;
          total_partner_count: number;
          total_qr_scan_count: number;
          website_url: string | null;
        }[];
      };
      get_public_referral_landing: {
        Args: { p_locale?: string; p_visit_token: string };
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
      mark_booking_payment_processing: {
        Args: { p_booking_id: string; p_provider_payment_id?: string };
        Returns: Json;
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
      set_booking_participants: {
        Args: { p_booking_id: string; p_participants: Json };
        Returns: Json;
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
