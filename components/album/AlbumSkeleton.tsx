import StatsCard from "./StatsCard";
import StickerSection from "./StickerSection";

export default function AlbumSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Glow de fondo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Mi álbum</h1>
        <div className="h-4 w-36 rounded bg-surface-subtle animate-pulse mt-1.5" />
      </div>

      {/* Sticky bar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b border-border">
        {/* Filtros */}
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-7 w-20 rounded-full bg-surface-subtle animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Buscador */}
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="h-9 w-full rounded-xl bg-surface-subtle animate-pulse" />
        </div>

        {/* Hint */}
        <div className="max-w-2xl mx-auto px-4 pb-2.5 flex justify-center">
          <div className="h-3 w-48 rounded bg-surface-subtle animate-pulse" />
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-28">
        <StatsCard skeleton />

        <div className="flex flex-col gap-8">
          <StickerSection skeleton skeletonTiles={20} />
          <StickerSection skeleton skeletonTiles={14} />
          <StickerSection skeleton skeletonTiles={14} />
        </div>
      </div>
    </div>
  );
}
