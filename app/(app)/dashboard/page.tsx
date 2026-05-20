import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AlbumCard from "@/components/dashboard/AlbumCard";
import StatsRow from "@/components/dashboard/StatsRow";
import TradingPanel from "@/components/dashboard/TradingPanel";
import DashboardData from "@/components/dashboard/DashboardData";

// DashboardHeader and TradingPanel only need profile (memoized, ~0ms) and render
// immediately. AlbumCard and StatsRow depend on the slow RPC — deferred via Suspense
// so their skeletons stream while DashboardData resolves.
export default async function DashboardPage() {
  const { profile } = await getCurrentProfile();

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
          {/* Tarjeta del álbum + grid de estadísticas — skeleton mientras carga el RPC */}
          <Suspense
            fallback={
              <>
                <AlbumCard skeleton />
                <StatsRow skeleton />
              </>
            }
          >
            <DashboardData />
          </Suspense>

          {/* Panel de intercambios — no depende del RPC, renderiza inmediatamente */}
          <TradingPanel profile={profile} />
        </div>
      </div>
    </div>
  );
}
