import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbumsCached } from "@/lib/db/albums";
import { getCollectionWithStickers } from "@/lib/db/collections";
import { getStickersByAlbumGroupedCached } from "@/lib/db/stickers";
import AlbumView from "./AlbumView";

// Server Component — resolves the active album, user collection, and stickers.
// Rendered inside a <Suspense> in page.tsx so the skeleton streams immediately
// while all three queries resolve (including the album catalog lookup).
export default async function AlbumData() {
  const [albums, { user }, supabase] = await Promise.all([
    getActiveAlbumsCached(),
    getCurrentProfile(),
    createClient(),
  ]);

  const album = albums[0];
  if (!album) redirect("/dashboard");

  const [{ collection, stickers: ownedStickers }, groupedStickers] =
    await Promise.all([
      getCollectionWithStickers(supabase, user.id, album.id),
      getStickersByAlbumGroupedCached(album.id),
    ]);

  return (
    <AlbumView
      album={album}
      collectionId={collection.id}
      groupedStickers={groupedStickers}
      initialOwned={ownedStickers.map((s) => ({
        sticker_id: s.sticker_id,
        quantity: s.quantity,
      }))}
    />
  );
}
