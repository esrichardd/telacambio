import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Sticker } from "@/types/app";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername } from "@/lib/db/profiles";
import { getActiveAlbums } from "@/lib/db/albums";
import { getCollection } from "@/lib/db/collections";
import {
  getCollectionSummary,
  getCollectionStickers,
} from "@/lib/db/collection-stickers";
import { getStickersByAlbumGrouped } from "@/lib/db/stickers";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PotentialTrades from "@/components/profile/PotentialTrades";
import ProfileStickers from "@/components/profile/ProfileStickers";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} · TeLaCambio`,
    description: `Mira la colección de @${username} en TeLaCambio`,
  };
}

// ─── Cálculo de cambios potenciales ──────────────────────────────────────────

interface TradeMatch {
  theyCanGive: Sticker[]; // owner tiene repetidas, visitor las necesita
  youCanGive: Sticker[]; // visitor tiene repetidas, owner las necesita
}

function computeTradeMatches(
  allStickers: Sticker[],
  ownerOwned: { sticker_id: string; quantity: number }[],
  visitorOwned: { sticker_id: string; quantity: number }[],
): TradeMatch {
  const ownerMap = new Map(ownerOwned.map((s) => [s.sticker_id, s.quantity]));
  const visitorMap = new Map(
    visitorOwned.map((s) => [s.sticker_id, s.quantity]),
  );

  const theyCanGive: Sticker[] = [];
  const youCanGive: Sticker[] = [];

  for (const sticker of allStickers) {
    const ownerQty = ownerMap.get(sticker.id) ?? 0;
    const visitorQty = visitorMap.get(sticker.id) ?? 0;

    // El dueño la tiene repetida y al visitante le falta
    if (ownerQty >= 2 && visitorQty === 0) {
      theyCanGive.push(sticker);
    }

    // El visitante la tiene repetida y al dueño le falta
    if (visitorQty >= 2 && ownerQty === 0) {
      youCanGive.push(sticker);
    }
  }

  return { theyCanGive, youCanGive };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  // Sesión del visitante (no redirige si no hay sesión)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Perfil del dueño de la página
  const profile = await getProfileByUsername(supabase, username);
  if (!profile) notFound();

  // Evitar que alguien vea cambios potenciales contra sí mismo
  const isSelf = user?.id === profile.id;

  // Álbum activo (Mundial 2026)
  const albums = await getActiveAlbums(supabase);
  const album = albums[0] ?? null;

  // ── Colección del dueño ──────────────────────────────────────────────────
  let summary = null;
  let groupedStickers: Record<string, Sticker[]> = {};
  let ownerOwned: { sticker_id: string; quantity: number }[] = [];

  if (album) {
    const ownerCollection = await getCollection(supabase, profile.id, album.id);
    if (ownerCollection) {
      const [summaryData, rawOwned, grouped] = await Promise.all([
        getCollectionSummary(
          supabase,
          ownerCollection.id,
          album.total_stickers,
        ),
        getCollectionStickers(supabase, ownerCollection.id),
        getStickersByAlbumGrouped(supabase, album.id),
      ]);
      summary = summaryData;
      ownerOwned = rawOwned.map((s) => ({
        sticker_id: s.sticker_id,
        quantity: s.quantity,
      }));
      groupedStickers = grouped;
    }
  }

  // ── Colección del visitante (solo si está logueado y no es el dueño) ──────
  let tradeMatch: TradeMatch | null = null;

  if (user && !isSelf && album && Object.keys(groupedStickers).length > 0) {
    const visitorCollection = await getCollection(supabase, user.id, album.id);
    if (visitorCollection) {
      const visitorOwned = await getCollectionStickers(
        supabase,
        visitorCollection.id,
      );
      const allStickers = Object.values(groupedStickers).flat();
      tradeMatch = computeTradeMatches(
        allStickers,
        ownerOwned,
        visitorOwned.map((s) => ({
          sticker_id: s.sticker_id,
          quantity: s.quantity,
        })),
      );
    }
  }

  // El WhatsApp solo llega al cliente si el visitante está logueado
  // y el perfil tiene show_whatsapp = true — nunca se expone de otra forma
  const whatsapp =
    user && profile.show_whatsapp ? profile.whatsapp_number : null;

  const hasCollection = Object.keys(groupedStickers).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Glow sutil de fondo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10">
        <ProfileHeader
          profile={profile}
          whatsapp={whatsapp}
          isLoggedIn={!!user}
          summary={summary}
        />

        {/* Cambios potenciales — solo si el visitante está logueado y no es el dueño */}
        {tradeMatch && user && album && (
          <div className="mt-6">
            <PotentialTrades
              theyCanGive={tradeMatch.theyCanGive}
              youCanGive={tradeMatch.youCanGive}
              ownerUsername={profile.username}
              proposalData={{
                receiverId: profile.id,
                albumId: album.id,
                receiverUsername: profile.username,
                receiverWhatsapp: whatsapp,
              }}
            />
          </div>
        )}

        {/* Colección compacta: repetidas disponibles + le faltan */}
        {album && hasCollection && (
          <div className="mt-6">
            <ProfileStickers
              groupedStickers={groupedStickers}
              ownerOwned={ownerOwned}
            />
          </div>
        )}

        {/* Si no tiene colección registrada aún */}
        {album && !hasCollection && (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted">
            <p className="text-4xl mb-3">🎴</p>
            <p className="text-sm">
              @{username} todavía no ha registrado barajitas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
