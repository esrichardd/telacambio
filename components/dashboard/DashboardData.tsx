import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbumsCached } from "@/lib/db/albums";
import { getOrCreateDashboardSummary } from "@/lib/db/collection-stickers";
import AlbumCard from "./AlbumCard";
import StatsRow from "./StatsRow";

// Server Component — contains the slow queries (album catalog + RPC summary).
// Rendered inside a <Suspense> in page.tsx so the skeleton streams immediately
// while these resolve. getActiveAlbumsCached, getCurrentProfile, and createClient
// run in parallel; only getOrCreateDashboardSummary is serial (needs album.id).
export default async function DashboardData() {
  const [albums, { user }, supabase] = await Promise.all([
    getActiveAlbumsCached(),
    getCurrentProfile(),
    createClient(),
  ]);

  const album = albums[0];
  if (!album) return null;

  const dashboardData = await getOrCreateDashboardSummary(
    supabase,
    user.id,
    album.id,
  );
  const summary = dashboardData?.summary ?? null;
  if (!summary) return null;

  return (
    <>
      <AlbumCard album={album} summary={summary} />
      <StatsRow summary={summary} />
    </>
  );
}
