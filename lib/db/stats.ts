import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CollectionStats } from "@/types/app";

type Client = SupabaseClient<Database>;

// Shape returned by the get_collection_stats RPC.
// TODO: remove this once types/database.ts is regenerated after migration 008.
type StatsRpcRow = {
  percentage: number;
  owned: number;
  missing: number;
  available: number;
  owned_specials: number;
  total_specials: number;
  days_collecting: number | null;
  current_streak: number | null;
  top_repeated: CollectionStats["topRepeated"] | null;
  section_progress: CollectionStats["sectionProgress"] | null;
};

/**
 * Calls the get_collection_stats RPC and maps snake_case DB fields
 * to the CollectionStats domain type.
 *
 * Not cached with unstable_cache — collection data changes on every
 * sticker update, so cross-request caching would show stale stats.
 */
export async function getCollectionStats(
  client: Client,
  collectionId: string,
  albumId: string,
): Promise<CollectionStats> {
  // @ts-expect-error — RPC not yet in generated types; remove after running
  // `pnpm supabase gen types typescript --linked > types/database.ts`
  const { data, error } = (await client.rpc("get_collection_stats", {
    p_collection_id: collectionId,
    p_album_id: albumId,
  })) as { data: StatsRpcRow[] | null; error: unknown };

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("get_collection_stats returned no rows.");
  }

  const row = data[0];

  return {
    percentage: row.percentage,
    owned: row.owned,
    missing: row.missing,
    available: row.available,
    ownedSpecials: row.owned_specials,
    totalSpecials: row.total_specials,
    daysCollecting: row.days_collecting ?? 0,
    currentStreak: row.current_streak ?? 0,
    topRepeated: row.top_repeated ?? [],
    sectionProgress: row.section_progress ?? [],
  };
}
