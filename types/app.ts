import type { Tables, Enums } from "./database";

// -----------------------------------------------------------------------------
// Re-exports convenientes de tipos de DB
// -----------------------------------------------------------------------------

export type Album = Tables<"albums">;
export type Sticker = Tables<"stickers">;
export type Profile = Tables<"profiles">;
export type Collection = Tables<"collections">;
export type CollectionSticker = Tables<"collection_stickers">;
export type TradingSpot = Tables<"trading_spots">;
export type ProfileTradingSpot = Tables<"profile_trading_spots">;
export type Group = Tables<"groups">;
export type GroupMember = Tables<"group_members">;

export type TradingStatus = Enums<"trading_status_type">;
export type PreferredContact = Enums<"preferred_contact_type">;

// -----------------------------------------------------------------------------
// Estados derivados de barajitas
// El estado NO se almacena en DB — se calcula a partir de `quantity`
// -----------------------------------------------------------------------------

export type StickerStatus = "me_falta" | "la_tengo" | "repetida";

export function deriveStickerStatus(quantity: number | null): StickerStatus {
  if (!quantity || quantity === 0) return "me_falta";
  if (quantity === 1) return "la_tengo";
  return "repetida";
}

// -----------------------------------------------------------------------------
// Tipos compuestos — combinan datos de varias tablas para la UI
// -----------------------------------------------------------------------------

/** Barajita enriquecida con su estado en la colección del usuario */
export type StickerWithStatus = Sticker & {
  status: StickerStatus;
  quantity: number;
  available_to_trade: number; // quantity - 1 (0 si no es repetida)
};

/** Resumen numérico de una colección — para el header del álbum */
export type CollectionSummary = {
  total: number; // total de barajitas del álbum
  owned: number; // barajitas que tiene (quantity >= 1)
  missing: number; // barajitas que le faltan
  repeated: number; // barajitas con quantity >= 2
  available: number; // unidades disponibles para cambio (sum de quantity-1)
  percentage: number; // owned / total * 100
};

/** Perfil público con resumen de su colección activa */
export type PublicProfile = Profile & {
  collection?: Collection & {
    summary: CollectionSummary;
  };
  trading_spots?: (ProfileTradingSpot & {
    spot: TradingSpot;
  })[];
};

/** Miembro de un grupo con su colección y resumen */
export type GroupMemberWithCollection = GroupMember & {
  collection: Collection & {
    profile: Pick<
      Profile,
      "id" | "username" | "display_name" | "avatar_url" | "trading_status"
    >;
    summary: CollectionSummary;
  };
};

/** Grupo con sus miembros — para la vista de grupo */
export type GroupWithMembers = Group & {
  members: GroupMemberWithCollection[];
  album: Album;
};

// -----------------------------------------------------------------------------
// Tipos de formularios / inputs
// -----------------------------------------------------------------------------

/** Datos que el usuario completa en el onboarding */
export type OnboardingData = {
  username: string;
  display_name: string;
  whatsapp_number?: string;
  show_whatsapp: boolean;
  city?: string;
  country_code?: string;
  state_code?: string;
  trading_status: TradingStatus;
};

/** Input para agregar o actualizar una barajita en la colección */
export type UpsertStickerInput = {
  collection_id: string;
  sticker_id: string;
  quantity: number;
};
