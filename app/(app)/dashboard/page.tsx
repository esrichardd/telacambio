import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbumsCached } from "@/lib/db/albums";
import { getOrCreateDashboardSummary } from "@/lib/db/collection-stickers";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AlbumCard from "@/components/dashboard/AlbumCard";
import StatsRow from "@/components/dashboard/StatsRow";
import TradingPanel from "@/components/dashboard/TradingPanel";

export default async function DashboardPage() {
  console.time("dashboard:total"); // PERF-INSTRUMENT

  // Memoized — layout already called this, so no extra network hit
  console.time("dashboard:auth+profile"); // PERF-INSTRUMENT
  const { user, profile } = await getCurrentProfile();
  console.timeEnd("dashboard:auth+profile"); // PERF-INSTRUMENT

  const supabase = await createClient();

  // Álbum activo — catalog data, served from cache after first request
  console.time("dashboard:albums"); // PERF-INSTRUMENT
  const albums = await getActiveAlbumsCached();
  console.timeEnd("dashboard:albums"); // PERF-INSTRUMENT
  const album = albums[0];

  // Single RPC replaces two serial queries:
  //   getOrCreateCollection (~200ms) → getCollectionSummary (~190ms)
  console.time("dashboard:summary"); // PERF-INSTRUMENT
  const dashboardData = album
    ? await getOrCreateDashboardSummary(supabase, user.id, album.id)
    : null;
  console.timeEnd("dashboard:summary"); // PERF-INSTRUMENT
  console.timeEnd("dashboard:total"); // PERF-INSTRUMENT

  const summary = dashboardData?.summary ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Glow de fondo sutil */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-28">
        {/* Header con avatar y nombre */}
        <DashboardHeader profile={profile} />

        <div className="flex flex-col gap-4">
          {/* Tarjeta del álbum con barra de progreso */}
          {album && summary && <AlbumCard album={album} summary={summary} />}

          {/* Grid de estadísticas */}
          {summary && <StatsRow summary={summary} />}

          {/* Panel de intercambios */}
          <TradingPanel profile={profile} />
        </div>
      </div>
    </div>
  );
}
