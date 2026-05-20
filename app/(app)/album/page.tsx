import { Suspense } from "react";
import AlbumData from "@/components/album/AlbumData";
import AlbumSkeleton from "@/components/album/AlbumSkeleton";

// No awaits here — the page returns the Suspense boundary immediately so the
// skeleton streams to the client while AlbumData resolves the album, collection,
// and stickers queries in parallel (including the redirect check if no album exists).
export default function AlbumPage() {
  return (
    <Suspense fallback={<AlbumSkeleton />}>
      <AlbumData />
    </Suspense>
  );
}
