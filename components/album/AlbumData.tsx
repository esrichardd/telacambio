import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getCollectionWithStickers } from "@/lib/db/collections";
import { getStickersByAlbumGroupedCached } from "@/lib/db/stickers";
import type { Album } from "@/types/app";
import AlbumView from "./AlbumView";

interface AlbumDataProps {
  album: Album;
}

// Server Component — contiene las queries lentas (colección + stickers del usuario).
// Se renderiza dentro de un <Suspense> en page.tsx para que el skeleton
// aparezca inmediatamente mientras estas queries resuelven.
export default async function AlbumData({ album }: AlbumDataProps) {
  const [{ user }, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

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
