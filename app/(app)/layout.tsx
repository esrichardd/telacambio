import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";

// Auth + onboarding check happens here, once per request.
// getCurrentProfile is memoized with React cache() — calling it again
// inside any page in this group costs nothing (no extra network call).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getCurrentProfile();

  return (
    <>
      <AppHeader />
      {children}
      <BottomNav />
    </>
  );
}
