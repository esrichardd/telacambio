import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbumsCached } from "@/lib/db/albums";
import { getOrCreateDashboardSummary } from "@/lib/db/collection-stickers";
import { getCollectionStats } from "@/lib/db/stats";
import EstadisticasView from "./EstadisticasView";

// Server Component — contains the slow queries for the stats page.
// Rendered inside a <Suspense> in page.tsx so the skeleton streams immediately.
//
// Query plan:
//   1. getActiveAlbumsCached + getCurrentProfile + createClient — parallel (~0ms profile, ~cached albums)
//   2. getOrCreateDashboardSummary — needs album.id and user.id (serial, reuses existing RPC)
//   3. getCollectionStats — needs collectionId and albumId (serial, new RPC)
export default async function EstadisticasData() {
  const [albums, { user }, supabase] = await Promise.all([
    getActiveAlbumsCached(),
    getCurrentProfile(),
    createClient(),
  ]);

  const album = albums[0];
  if (!album) return null;

  const { collectionId } = await getOrCreateDashboardSummary(
    supabase,
    user.id,
    album.id,
  );

  const stats = await getCollectionStats(supabase, collectionId, album.id);

  return <EstadisticasView stats={stats} />;
}
