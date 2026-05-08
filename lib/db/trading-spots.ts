import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/types/database";
import type { TradingSpot, ProfileTradingSpot } from "@/types/app";
import { haversineDistance } from "@/lib/utils/geo";

type Client = SupabaseClient<Database>;

type SpotFilters = {
  city?: string;
  countryCode?: string;
};

type SuggestSpotInput = {
  name: string;
  description?: string;
  address?: string;
  city: string;
  country_code: string;
  lat: number;
  lng: number;
};

/** Devuelve todos los spots verificados, con filtros opcionales de ciudad y país */
export async function getVerifiedSpots(
  client: Client,
  filters: SpotFilters = {},
): Promise<TradingSpot[]> {
  let query = client
    .from("trading_spots")
    .select("*")
    .eq("is_verified", true)
    .order("city")
    .order("name");

  if (filters.countryCode)
    query = query.eq("country_code", filters.countryCode);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Devuelve spots verificados cercanos a unas coordenadas, dentro de un radio en km.
 * Filtra primero por país para reducir el volumen, luego aplica haversine client-side.
 * TODO: Migrar a PostGIS ST_DWithin cuando se active la extensión en Supabase.
 */
export async function getNearbySpots(
  client: Client,
  lat: number,
  lng: number,
  radiusKm: number = 20,
  countryCode?: string,
): Promise<(TradingSpot & { distance_km: number })[]> {
  const spots = await getVerifiedSpots(client, { countryCode });

  return spots
    .map((spot) => ({
      ...spot,
      distance_km: haversineDistance(lat, lng, spot.lat, spot.lng),
    }))
    .filter((spot) => spot.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}

/** Devuelve los spots que un usuario ha marcado como lugares donde intercambia */
export async function getProfileSpots(
  client: Client,
  profileId: string,
): Promise<(ProfileTradingSpot & { spot: TradingSpot })[]> {
  const { data, error } = await client
    .from("profile_trading_spots")
    .select("*, spot:trading_spots(*)")
    .eq("profile_id", profileId)
    .eq("is_active", true)
    .order("created_at");

  if (error) throw error;
  return data as (ProfileTradingSpot & { spot: TradingSpot })[];
}

/** El usuario sugiere un nuevo lugar de intercambio (queda pendiente de verificación) */
export async function suggestSpot(
  client: Client,
  profileId: string,
  input: SuggestSpotInput,
): Promise<TradingSpot> {
  const payload: TablesInsert<"trading_spots"> = {
    ...input,
    suggested_by: profileId,
    is_verified: false,
  };

  const { data, error } = await client
    .from("trading_spots")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(payload as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Agrega un spot al perfil del usuario (donde acostumbra intercambiar) */
export async function addSpotToProfile(
  client: Client,
  profileId: string,
  tradingSpotId: string,
  notes?: string,
): Promise<ProfileTradingSpot> {
  const payload: TablesInsert<"profile_trading_spots"> = {
    profile_id: profileId,
    trading_spot_id: tradingSpotId,
    notes,
    is_active: true,
  };

  const { data, error } = await client
    .from("profile_trading_spots")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(payload as any, { onConflict: "profile_id,trading_spot_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Remueve un spot del perfil del usuario */
export async function removeSpotFromProfile(
  client: Client,
  profileId: string,
  tradingSpotId: string,
): Promise<void> {
  const { error } = await client
    .from("profile_trading_spots")
    .delete()
    .eq("profile_id", profileId)
    .eq("trading_spot_id", tradingSpotId);

  if (error) throw error;
}
