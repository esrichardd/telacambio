/**
 * Tipos generados automáticamente por el Supabase CLI.
 *
 * ⚠️ NO editar este archivo a mano.
 *
 * Para regenerar después de cambios en la DB:
 *   pnpm supabase gen types typescript --project-id TU_PROJECT_ID > types/database.ts
 *
 * O si usas la CLI linkeada al proyecto:
 *   pnpm supabase gen types typescript --linked > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          total_stickers: number;
          cover_image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          total_stickers: number;
          cover_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          total_stickers?: number;
          cover_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      stickers: {
        Row: {
          id: string;
          album_id: string;
          code: string;
          name: string | null;
          section: string;
          number: number | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          code: string;
          name?: string | null;
          section: string;
          number?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          code?: string;
          name?: string | null;
          section?: string;
          number?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          whatsapp_number: string | null;
          show_whatsapp: boolean;
          city: string | null;
          country_code: string | null;
          lat: number | null;
          lng: number | null;
          trading_status: Database["public"]["Enums"]["trading_status_type"];
          preferred_contact: Database["public"]["Enums"]["preferred_contact_type"];
          is_public: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          show_whatsapp?: boolean;
          city?: string | null;
          country_code?: string | null;
          lat?: number | null;
          lng?: number | null;
          trading_status?: Database["public"]["Enums"]["trading_status_type"];
          preferred_contact?: Database["public"]["Enums"]["preferred_contact_type"];
          is_public?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          show_whatsapp?: boolean;
          city?: string | null;
          country_code?: string | null;
          lat?: number | null;
          lng?: number | null;
          trading_status?: Database["public"]["Enums"]["trading_status_type"];
          preferred_contact?: Database["public"]["Enums"]["preferred_contact_type"];
          is_public?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          profile_id: string;
          album_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          album_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          album_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_stickers: {
        Row: {
          id: string;
          collection_id: string;
          sticker_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          sticker_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          sticker_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      trading_spots: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string | null;
          city: string;
          country_code: string;
          lat: number;
          lng: number;
          suggested_by: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          address?: string | null;
          city: string;
          country_code: string;
          lat: number;
          lng: number;
          suggested_by?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          city?: string;
          country_code?: string;
          lat?: number;
          lng?: number;
          suggested_by?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
      };
      profile_trading_spots: {
        Row: {
          id: string;
          profile_id: string;
          trading_spot_id: string;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          trading_spot_id: string;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          trading_spot_id?: string;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          album_id: string;
          name: string;
          description: string | null;
          invite_code: string;
          owner_id: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          name: string;
          description?: string | null;
          invite_code?: string;
          owner_id: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          name?: string;
          description?: string | null;
          invite_code?: string;
          owner_id?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          collection_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          collection_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          collection_id?: string;
          joined_at?: string;
        };
      };
    };
    Enums: {
      trading_status_type: "active" | "paused" | "not_trading";
      preferred_contact_type: "whatsapp" | "in_app" | "any";
    };
  };
};

// Helpers para acceder a los tipos de filas sin escribir Database['public']['Tables'][...]['Row']
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
