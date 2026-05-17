import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/profiles";
import { getActiveAlbums } from "@/lib/db/albums";
import { getOrCreateCollection } from "@/lib/db/collections";
import { getCollectionSummary } from "@/lib/db/collection-stickers";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AlbumCard from "@/components/dashboard/AlbumCard";
import StatsRow from "@/components/dashboard/StatsRow";
import TradingPanel from "@/components/dashboard/TradingPanel";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfileById(supabase, user.id);

  if (!profile) redirect("/login");
  if (!profile.onboarding_completed) redirect("/onboarding");

  // Álbum activo — por ahora solo existe Mundial 2026
  const albums = await getActiveAlbums(supabase);
  const album = albums[0];

  // Colección del usuario para ese álbum (se crea si no existe)
  const collection = album
    ? await getOrCreateCollection(supabase, user.id, album.id)
    : null;

  // Resumen de la colección
  const summary = collection && album
    ? await getCollectionSummary(supabase, collection.id, album.total_stickers)
    : null;

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

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-10 pb-16">
        {/* Header con avatar y nombre */}
        <DashboardHeader profile={profile} />

        <div className="flex flex-col gap-4">
          {/* Tarjeta del álbum con barra de progreso */}
          {album && summary && (
            <AlbumCard album={album} summary={summary} />
          )}

          {/* Grid de estadísticas */}
          {summary && <StatsRow summary={summary} />}

          {/* Panel de intercambios */}
          <TradingPanel profile={profile} />
        </div>
      </div>
    </div>
  );
}
