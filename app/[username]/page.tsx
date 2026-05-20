import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Sticker } from "@/types/app";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { getProfileByUsername } from "@/lib/db/profiles";
import { getActiveAlbumsCached } from "@/lib/db/albums";
import { getCollection } from "@/lib/db/collections";
import { getCollectionStickers } from "@/lib/db/collection-stickers";
import { getStickersByAlbumGroupedCached } from "@/lib/db/stickers";
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

  // [1+2+3] visitor auth + owner profile + albums in parallel — all independent.
  // getActiveAlbumsCached is a cache hit after first request — no reason to serialize it.
  const [user, profile, albums] = await Promise.all([
    getAuthUser(),
    getProfileByUsername(supabase, username),
    getActiveAlbumsCached(),
  ]);
  if (!profile) notFound();

  const isSelf = user?.id === profile.id;
  const album = albums[0] ?? null;

  // [4a+4b+4c] owner collection + visitor collection (if applicable) + grouped stickers — all in parallel.
  // groupedStickers is a cache hit; visitor collection uses Promise.resolve(null) when not needed.
  const [ownerCollection, visitorCollection, groupedStickers] = album
    ? await Promise.all([
        getCollection(supabase, profile.id, album.id),
        user && !isSelf
          ? getCollection(supabase, user.id, album.id)
          : Promise.resolve(null),
        getStickersByAlbumGroupedCached(album.id),
      ])
    : [null, null, {} as Record<string, Sticker[]>];

  // [5a+5b] owner stickers + visitor stickers in parallel.
  // Visitor stickers are fetched here instead of a separate serial step (old [6]).
  // summary is derived from ownerOwned in JS — no extra DB round-trip needed.
  let ownerOwned: { sticker_id: string; quantity: number }[] = [];
  let visitorOwned: { sticker_id: string; quantity: number }[] = [];

  if (ownerCollection && album) {
    const needsVisitorStickers =
      user &&
      !isSelf &&
      visitorCollection &&
      Object.keys(groupedStickers).length > 0;

    const [rawOwned, rawVisitorOwned] = await Promise.all([
      getCollectionStickers(supabase, ownerCollection.id),
      needsVisitorStickers
        ? getCollectionStickers(supabase, visitorCollection!.id)
        : Promise.resolve([]),
    ]);

    ownerOwned = rawOwned.map((s) => ({
      sticker_id: s.sticker_id,
      quantity: s.quantity,
    }));
    visitorOwned = rawVisitorOwned.map((s) => ({
      sticker_id: s.sticker_id,
      quantity: s.quantity,
    }));
  }

  // Derived from ownerOwned — same computation as getCollectionSummary without the DB round-trip.
  const summary =
    ownerCollection && album
      ? {
          total: album.total_stickers,
          owned: ownerOwned.length,
          missing: album.total_stickers - ownerOwned.length,
          repeated: ownerOwned.filter((s) => s.quantity >= 2).length,
          available: ownerOwned.reduce(
            (sum, s) => sum + Math.max(0, s.quantity - 1),
            0,
          ),
          percentage:
            album.total_stickers > 0
              ? Math.round((ownerOwned.length / album.total_stickers) * 100)
              : 0,
        }
      : null;

  // Trade matches computed from already-fetched data — no extra queries.
  let tradeMatch: TradeMatch | null = null;

  if (
    user &&
    !isSelf &&
    ownerCollection &&
    visitorCollection &&
    Object.keys(groupedStickers).length > 0
  ) {
    const allStickers = Object.values(groupedStickers).flat();
    tradeMatch = computeTradeMatches(allStickers, ownerOwned, visitorOwned);
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
