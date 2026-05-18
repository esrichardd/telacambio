import Link from "next/link";
import type { Album } from "@/types/app";
import type { CollectionSummary } from "@/types/app";

interface AlbumCardProps {
  album: Album;
  summary: CollectionSummary;
}

export default function AlbumCard({ album, summary }: AlbumCardProps) {
  const { owned, total, percentage } = summary;
  const isEmpty = owned === 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide font-medium">
            Tu álbum
          </p>
          <h2 className="text-base font-bold text-foreground mt-0.5">
            {album.name}
          </h2>
        </div>
        <span className="text-3xl font-black text-brand tabular-nums">
          {percentage}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="flex flex-col gap-1.5">
        <div className="h-2 bg-surface-subtle rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted">
          {isEmpty ? (
            "Aún no has registrado ninguna barajita"
          ) : (
            <>
              <span className="text-foreground font-semibold">
                {owned.toLocaleString("es-CO")}
              </span>{" "}
              de {total.toLocaleString("es-CO")} barajitas
            </>
          )}
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/album"
        className="flex items-center justify-between px-4 py-3 rounded-xl border border-brand/30 bg-brand/5 hover:bg-brand/10 transition-colors text-sm"
      >
        <span className="text-foreground font-medium">
          {isEmpty ? "Comenzar a registrar barajitas" : "Ver mi álbum"}
        </span>
        <span className="text-brand text-xs font-semibold">Abrir →</span>
      </Link>
    </div>
  );
}
