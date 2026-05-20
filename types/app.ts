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
  ownedSpecials: number; // barajitas especiales que tiene (FWC o #1 de selección)
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

// -----------------------------------------------------------------------------
// Tipos de intercambios (trades)
// Requieren que types/database.ts esté regenerado tras aplicar las migraciones
// 004_trades_schema.sql, 005_trades_rls.sql y 006_accept_trade_fn.sql
// -----------------------------------------------------------------------------

export type Trade = Tables<"trades">;
export type TradeSticker = Tables<"trade_stickers">;
export type TradeStatus = Enums<"trade_status_type">;
export type TradeDirection = Enums<"trade_direction_type">;

/** Trade enriquecido con perfiles de los participantes y barajitas detalladas.
 *  Resultado de getReceivedTrades() y getSentTrades(). */
export type TradeWithDetails = Trade & {
  proposer: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  receiver: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  stickers: (TradeSticker & { sticker: Sticker })[];
};

// -----------------------------------------------------------------------------
// Estadísticas de colección — resultado del RPC get_collection_stats
// -----------------------------------------------------------------------------

/** One repeated sticker entry returned by the RPC top_repeated JSONB array */
export type TopRepeatedSticker = {
  code: string;
  name: string | null;
  section: string;
  quantity: number;
};

/** Progress for a single album section */
export type SectionStat = {
  section: string;
  owned: number;
  total: number;
};

/** Full stats payload for the /estadisticas page */
export type CollectionStats = {
  percentage: number;
  owned: number;
  missing: number;
  available: number; // units available to trade (sum of quantity - 1)
  ownedSpecials: number;
  totalSpecials: number;
  daysCollecting: number; // 0 if collection is empty
  currentStreak: number; // 0 if no activity today or yesterday
  topRepeated: TopRepeatedSticker[];
  sectionProgress: SectionStat[];
};
