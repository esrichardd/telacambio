import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/profiles";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileById(supabase, user.id);

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return <OnboardingShell userId={user.id} />;
}
