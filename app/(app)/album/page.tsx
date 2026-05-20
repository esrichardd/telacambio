import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getActiveAlbumsCached } from "@/lib/db/albums";
import AlbumData from "@/components/album/AlbumData";
import AlbumSkeleton from "@/components/album/AlbumSkeleton";

export default async function AlbumPage() {
  // getActiveAlbumsCached is served from cross-request cache — fast.
  // redirect() must happen before the Suspense boundary, so we resolve
  // the album here before handing off to AlbumData.
  const albums = await getActiveAlbumsCached();
  const album = albums[0];
  if (!album) redirect("/dashboard");

  return (
    <Suspense fallback={<AlbumSkeleton />}>
      <AlbumData album={album} />
    </Suspense>
  );
}
