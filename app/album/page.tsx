import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/db/profiles";
import { getActiveAlbums } from "@/lib/db/albums";
import { getOrCreateCollection } from "@/lib/db/collections";
import { getCollectionStickers, } from "@/lib/db/collection-stickers";
import { getStickersByAlbumGrouped } from "@/lib/db/stickers";
import AlbumView from "@/components/album/AlbumView";

export default async function AlbumPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfileById(supabase, user.id);
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const albums = await getActiveAlbums(supabase);
  const album = albums[0];
  if (!album) redirect("/dashboard");

  const [collection, groupedStickers] = await Promise.all([
    getOrCreateCollection(supabase, user.id, album.id),
    getStickersByAlbumGrouped(supabase, album.id),
  ]);

  const ownedStickers = await getCollectionStickers(supabase, collection.id);

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
