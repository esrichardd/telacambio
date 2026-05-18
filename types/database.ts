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
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      albums: {
        Row: {
          cover_image_url: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          slug: string;
          total_stickers: number;
        };
        Insert: {
          cover_image_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          slug: string;
          total_stickers: number;
        };
        Update: {
          cover_image_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          slug?: string;
          total_stickers?: number;
        };
        Relationships: [];
      };
      collection_stickers: {
        Row: {
          collection_id: string;
          created_at: string | null;
          id: string;
          quantity: number;
          sticker_id: string;
          updated_at: string | null;
        };
        Insert: {
          collection_id: string;
          created_at?: string | null;
          id?: string;
          quantity?: number;
          sticker_id: string;
          updated_at?: string | null;
        };
        Update: {
          collection_id?: string;
          created_at?: string | null;
          id?: string;
          quantity?: number;
          sticker_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "collection_stickers_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_stickers_sticker_id_fkey";
            columns: ["sticker_id"];
            isOneToOne: false;
            referencedRelation: "stickers";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          album_id: string;
          created_at: string | null;
          id: string;
          profile_id: string;
          updated_at: string | null;
        };
        Insert: {
          album_id: string;
          created_at?: string | null;
          id?: string;
          profile_id: string;
          updated_at?: string | null;
        };
        Update: {
          album_id?: string;
          created_at?: string | null;
          id?: string;
          profile_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "collections_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collections_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          collection_id: string;
          group_id: string;
          id: string;
          joined_at: string | null;
        };
        Insert: {
          collection_id: string;
          group_id: string;
          id?: string;
          joined_at?: string | null;
        };
        Update: {
          collection_id?: string;
          group_id?: string;
          id?: string;
          joined_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      groups: {
        Row: {
          album_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          invite_code: string;
          is_active: boolean | null;
          name: string;
          owner_id: string;
        };
        Insert: {
          album_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          invite_code?: string;
          is_active?: boolean | null;
          name: string;
          owner_id: string;
        };
        Update: {
          album_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          invite_code?: string;
          is_active?: boolean | null;
          name?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "groups_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_trading_spots: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          notes: string | null;
          profile_id: string;
          trading_spot_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          notes?: string | null;
          profile_id: string;
          trading_spot_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          notes?: string | null;
          profile_id?: string;
          trading_spot_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_trading_spots_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_trading_spots_trading_spot_id_fkey";
            columns: ["trading_spot_id"];
            isOneToOne: false;
            referencedRelation: "trading_spots";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          country_code: string | null;
          created_at: string | null;
          display_name: string | null;
          id: string;
          is_public: boolean | null;
          lat: number | null;
          lng: number | null;
          onboarding_completed: boolean | null;
          preferred_contact:
            | Database["public"]["Enums"]["preferred_contact_type"]
            | null;
          show_whatsapp: boolean | null;
          state_code: string | null;
          trading_status:
            | Database["public"]["Enums"]["trading_status_type"]
            | null;
          updated_at: string | null;
          username: string;
          whatsapp_number: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          country_code?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id: string;
          is_public?: boolean | null;
          lat?: number | null;
          lng?: number | null;
          onboarding_completed?: boolean | null;
          preferred_contact?:
            | Database["public"]["Enums"]["preferred_contact_type"]
            | null;
          show_whatsapp?: boolean | null;
          state_code?: string | null;
          trading_status?:
            | Database["public"]["Enums"]["trading_status_type"]
            | null;
          updated_at?: string | null;
          username: string;
          whatsapp_number?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          country_code?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
          is_public?: boolean | null;
          lat?: number | null;
          lng?: number | null;
          onboarding_completed?: boolean | null;
          preferred_contact?:
            | Database["public"]["Enums"]["preferred_contact_type"]
            | null;
          show_whatsapp?: boolean | null;
          state_code?: string | null;
          trading_status?:
            | Database["public"]["Enums"]["trading_status_type"]
            | null;
          updated_at?: string | null;
          username?: string;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      stickers: {
        Row: {
          album_id: string;
          code: string;
          created_at: string | null;
          id: string;
          image_url: string | null;
          name: string | null;
          number: number | null;
          section: string;
        };
        Insert: {
          album_id: string;
          code: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string | null;
          number?: number | null;
          section: string;
        };
        Update: {
          album_id?: string;
          code?: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string | null;
          number?: number | null;
          section?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stickers_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
        ];
      };
      trade_stickers: {
        Row: {
          created_at: string | null;
          direction: Database["public"]["Enums"]["trade_direction_type"];
          id: string;
          sticker_id: string;
          trade_id: string;
        };
        Insert: {
          created_at?: string | null;
          direction: Database["public"]["Enums"]["trade_direction_type"];
          id?: string;
          sticker_id: string;
          trade_id: string;
        };
        Update: {
          created_at?: string | null;
          direction?: Database["public"]["Enums"]["trade_direction_type"];
          id?: string;
          sticker_id?: string;
          trade_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trade_stickers_sticker_id_fkey";
            columns: ["sticker_id"];
            isOneToOne: false;
            referencedRelation: "stickers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trade_stickers_trade_id_fkey";
            columns: ["trade_id"];
            isOneToOne: false;
            referencedRelation: "trades";
            referencedColumns: ["id"];
          },
        ];
      };
      trades: {
        Row: {
          album_id: string;
          created_at: string | null;
          id: string;
          message: string | null;
          proposer_id: string;
          receiver_id: string;
          status: Database["public"]["Enums"]["trade_status_type"];
          updated_at: string | null;
        };
        Insert: {
          album_id: string;
          created_at?: string | null;
          id?: string;
          message?: string | null;
          proposer_id: string;
          receiver_id: string;
          status?: Database["public"]["Enums"]["trade_status_type"];
          updated_at?: string | null;
        };
        Update: {
          album_id?: string;
          created_at?: string | null;
          id?: string;
          message?: string | null;
          proposer_id?: string;
          receiver_id?: string;
          status?: Database["public"]["Enums"]["trade_status_type"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trades_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trades_proposer_id_fkey";
            columns: ["proposer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trades_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trading_spots: {
        Row: {
          address: string | null;
          city: string;
          country_code: string;
          created_at: string | null;
          description: string | null;
          id: string;
          is_verified: boolean | null;
          lat: number;
          lng: number;
          name: string;
          suggested_by: string | null;
        };
        Insert: {
          address?: string | null;
          city: string;
          country_code: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_verified?: boolean | null;
          lat: number;
          lng: number;
          name: string;
          suggested_by?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string;
          country_code?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_verified?: boolean | null;
          lat?: number;
          lng?: number;
          name?: string;
          suggested_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trading_spots_suggested_by_fkey";
            columns: ["suggested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_trade: { Args: { p_trade_id: string }; Returns: Json };
    };
    Enums: {
      preferred_contact_type: "whatsapp" | "in_app" | "any";
      trade_direction_type: "proposer_gives" | "receiver_gives";
      trade_status_type: "pending" | "accepted" | "rejected" | "cancelled";
      trading_status_type: "active" | "paused" | "not_trading";
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      preferred_contact_type: ["whatsapp", "in_app", "any"],
      trade_direction_type: ["proposer_gives", "receiver_gives"],
      trade_status_type: ["pending", "accepted", "rejected", "cancelled"],
      trading_status_type: ["active", "paused", "not_trading"],
    },
  },
} as const;
