import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbumsCached } from "@/lib/db/albums";
import { getCollectionWithStickers } from "@/lib/db/collections";
import { getStickersByAlbumGroupedCached } from "@/lib/db/stickers";
import AlbumView from "@/components/album/AlbumView";
export default async function AlbumPage() {

  // Memoized — layout already called this, so no extra network hit
  const { user } = await getCurrentProfile();

  const supabase = await createClient();

  // Catalog data — served from cache after first request
  const albums = await getActiveAlbumsCached();
  const album = albums[0];
  if (!album) redirect("/dashboard");

  // [collection+stickers] and [groupedStickers catalog] run in parallel.
  // getCollectionWithStickers fetches collection + owned stickers in a single
  // round-trip (SELECT with join), replacing the previous serial pattern:
  //   getOrCreateCollection → getCollectionStickers (two sequential queries).
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
