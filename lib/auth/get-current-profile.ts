import { cache } from "react";
import { redirect } from "next/navigation";
import { getProfileByIdCached } from "@/lib/db/profiles";
import { getAuthUser } from "./get-auth-user";
import type { Profile } from "@/types/app";
import type { User } from "@supabase/supabase-js";

type AuthedSession = { user: User; profile: Profile };

/**
 * Returns { user, profile } for the authenticated user.
 * Redirects to /login if there is no session or no profile row.
 * Redirects to /onboarding if onboarding is not completed.
 * Memoized per-request with React cache().
 *
 * Auth cost:    ~0ms  (user.id read from x-user-id header set by proxy.ts)
 * Profile cost: ~0ms  (unstable_cache hit after first request per user)
 *
 * Do NOT use this in:
 *   - app/[username]/page.tsx  (auth is optional there)
 *   - app/onboarding/page.tsx  (onboarding_completed is false there by definition)
 *   - app/auth/callback/route.ts
 */
export const getCurrentProfile = cache(async (): Promise<AuthedSession> => {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const profile = await getProfileByIdCached(user.id);

  if (!profile) redirect("/login");
  if (!profile.onboarding_completed) redirect("/onboarding");

  return { user, profile };
});
