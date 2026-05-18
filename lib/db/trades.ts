import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/types/database";
import type { Trade, TradeWithDetails } from "@/types/app";

type Client = SupabaseClient<Database>;

// Select fragment shared by getReceivedTrades and getSentTrades
// Joins proposer/receiver profiles and all sticker details
const TRADE_SELECT = `
  *,
  proposer:profiles!trades_proposer_id_fkey(id, username, display_name, avatar_url),
  receiver:profiles!trades_receiver_id_fkey(id, username, display_name, avatar_url),
  stickers:trade_stickers(*, sticker:stickers(*))
` as const;

export type CreateTradeInput = {
  receiver_id: string;
  album_id: string;
  message?: string;
  stickers: {
    sticker_id: string;
    direction: "proposer_gives" | "receiver_gives";
  }[];
};

/**
 * Creates a trade proposal and its sticker list.
 * If the sticker insert fails the trade is cleaned up so we never leave
 * an orphaned trade row without its items.
 */
export async function createTrade(
  client: Client,
  proposerId: string,
  input: CreateTradeInput,
): Promise<Trade> {
  const { data: trade, error: tradeError } = await client
    .from("trades")
    .insert({
      proposer_id: proposerId,
      receiver_id: input.receiver_id,
      album_id: input.album_id,
      message: input.message ?? null,
    })
    .select()
    .single();

  if (tradeError) throw tradeError;

  const rows: TablesInsert<"trade_stickers">[] = input.stickers.map((s) => ({
    trade_id: trade.id,
    sticker_id: s.sticker_id,
    direction: s.direction,
  }));

  const { error: stickersError } = await client
    .from("trade_stickers")
    .insert(rows);

  if (stickersError) {
    // Clean up the orphaned trade before re-throwing
    await client.from("trades").delete().eq("id", trade.id);
    throw stickersError;
  }

  return trade;
}

/**
 * Returns pending trades received by a user, enriched with proposer info
 * and full sticker details. Used to render the inbox in /intercambios.
 */
export async function getReceivedTrades(
  client: Client,
  profileId: string,
): Promise<TradeWithDetails[]> {
  const { data, error } = await client
    .from("trades")
    .select(TRADE_SELECT)
    .eq("receiver_id", profileId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as TradeWithDetails[];
}

/**
 * Returns all trades sent by a user (all statuses), newest first.
 * Used to show the history of outgoing proposals.
 */
export async function getSentTrades(
  client: Client,
  profileId: string,
): Promise<TradeWithDetails[]> {
  const { data, error } = await client
    .from("trades")
    .select(TRADE_SELECT)
    .eq("proposer_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as TradeWithDetails[];
}

/**
 * Accepts a pending trade by calling the accept_trade() PostgreSQL function.
 * The RPC handles the atomic transfer of stickers between both collections.
 * Throws with the server error message if stickers are no longer available.
 */
export async function acceptTrade(
  client: Client,
  tradeId: string,
): Promise<void> {
  const { error } = await client.rpc("accept_trade", { p_trade_id: tradeId });
  if (error) throw error;
}

/**
 * Rejects a pending trade. Only the receiver can do this (enforced by RLS).
 */
export async function rejectTrade(
  client: Client,
  tradeId: string,
): Promise<void> {
  const { error } = await client
    .from("trades")
    .update({ status: "rejected" })
    .eq("id", tradeId)
    .eq("status", "pending");

  if (error) throw error;
}

/**
 * Cancels a pending trade. Only the proposer can do this (enforced by RLS).
 */
export async function cancelTrade(
  client: Client,
  tradeId: string,
): Promise<void> {
  const { error } = await client
    .from("trades")
    .update({ status: "cancelled" })
    .eq("id", tradeId)
    .eq("status", "pending");

  if (error) throw error;
}

/**
 * Returns the count of pending trades received by a user.
 * Used for the notification badge on the BottomNav intercambios icon.
 */
export async function getPendingTradesCount(
  client: Client,
  profileId: string,
): Promise<number> {
  const { count, error } = await client
    .from("trades")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", profileId)
    .eq("status", "pending");

  if (error) throw error;
  return count ?? 0;
}
