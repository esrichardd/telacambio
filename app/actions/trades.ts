"use server";

import { createClient } from "@/lib/supabase/server";
import { createTrade, acceptTrade, rejectTrade, cancelTrade } from "@/lib/db/trades";
import type { TradeDirection } from "@/types/app";

export type ProposeTradeInput = {
  receiverId: string;
  albumId: string;
  stickers: {
    sticker_id: string;
    direction: TradeDirection;
  }[];
  message?: string;
};

export type ProposeTradeResult =
  | { success: true; tradeId: string }
  | { success: false; error: string };

/**
 * Server Action: creates a trade proposal in the database.
 * Validates the authenticated user is the proposer.
 */
export async function proposeTradeAction(
  input: ProposeTradeInput,
): Promise<ProposeTradeResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Debes iniciar sesión para proponer un intercambio.",
      };
    }

    const trade = await createTrade(supabase, user.id, {
      receiver_id: input.receiverId,
      album_id: input.albumId,
      stickers: input.stickers,
      message: input.message,
    });

    return { success: true, tradeId: trade.id };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Error al enviar la propuesta.";
    return { success: false, error: msg };
  }
}

export type TradeActionResult =
  | { success: true }
  | { success: false; error: string };

/** Server Action: accepts a pending trade (receiver only). */
export async function acceptTradeAction(
  tradeId: string,
): Promise<TradeActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado." };
    await acceptTrade(supabase, tradeId);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al aceptar.",
    };
  }
}

/** Server Action: rejects a pending trade (receiver only). */
export async function rejectTradeAction(
  tradeId: string,
): Promise<TradeActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado." };
    await rejectTrade(supabase, tradeId);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al rechazar.",
    };
  }
}

/** Server Action: cancels a pending trade (proposer only). */
export async function cancelTradeAction(
  tradeId: string,
): Promise<TradeActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "No autenticado." };
    await cancelTrade(supabase, tradeId);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al cancelar.",
    };
  }
}
