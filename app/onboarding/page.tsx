import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getProfileById } from "@/lib/db/profiles";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

export default async function OnboardingPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const profile = await getProfileById(supabase, user.id);

  if (profile?.onboarding_completed) redirect("/dashboard");

  return <OnboardingShell userId={user.id} />;
}
