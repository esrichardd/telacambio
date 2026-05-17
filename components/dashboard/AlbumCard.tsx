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
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border text-muted text-sm cursor-not-allowed select-none"
        title="Próximamente"
      >
        <span>{isEmpty ? "Comenzar a registrar barajitas" : "Administrar mi álbum"}</span>
        <span className="text-xs bg-surface-subtle border border-border px-2 py-0.5 rounded-full">
          Próximamente
        </span>
      </div>
    </div>
  );
}
