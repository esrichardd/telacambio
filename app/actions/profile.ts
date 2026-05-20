"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/db/profiles";
import { invalidateProfileCache } from "@/lib/cache/invalidate";
import type { TradingStatus } from "@/types/app";

async function getAuthedClient() {
  const user = await getAuthUser();
  if (!user) throw new Error("No autenticado");
  const supabase = await createClient();
  return { user, supabase };
}

export async function updateUsernameAction(username: string): Promise<void> {
  const { user, supabase } = await getAuthedClient();
  await updateProfile(supabase, user.id, { username });
  await invalidateProfileCache(user.id);
  revalidatePath("/settings");
}

export async function updateDisplayNameAction(
  displayName: string,
): Promise<void> {
  const { user, supabase } = await getAuthedClient();
  await updateProfile(supabase, user.id, {
    display_name: displayName || undefined,
  });
  await invalidateProfileCache(user.id);
  revalidatePath("/settings");
}

export async function updateLocationAction(
  countryCode: string,
  stateCode: string,
  city: string,
): Promise<void> {
  const { user, supabase } = await getAuthedClient();
  await updateProfile(supabase, user.id, {
    country_code: countryCode || undefined,
    state_code: stateCode || undefined,
    city: city || undefined,
  });
  await invalidateProfileCache(user.id);
  revalidatePath("/settings");
}

export async function updateTradingStatusAction(
  status: TradingStatus,
): Promise<void> {
  const { user, supabase } = await getAuthedClient();
  await updateProfile(supabase, user.id, { trading_status: status });
  await invalidateProfileCache(user.id);
  revalidatePath("/settings");
}

export async function updateWhatsappAction(number: string): Promise<void> {
  const { user, supabase } = await getAuthedClient();
  await updateProfile(supabase, user.id, {
    whatsapp_number: number || undefined,
  });
  await invalidateProfileCache(user.id);
  revalidatePath("/settings");
}

export async function updateShowWhatsappAction(show: boolean): Promise<void> {
  const { user, supabase } = await getAuthedClient();
  await updateProfile(supabase, user.id, { show_whatsapp: show });
  await invalidateProfileCache(user.id);
  revalidatePath("/settings");
}
