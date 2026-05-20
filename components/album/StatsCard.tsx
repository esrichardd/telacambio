import type { FilterState } from "./AlbumFilters";

type StatsCardProps =
  | { skeleton: true }
  | {
      skeleton?: false;
      albumName: string;
      percentage: number;
      counts: Record<FilterState, number>;
      specialsOwned: number;
      specialStickersCount: number;
      totalStickers: number;
    };

export default function StatsCard(props: StatsCardProps) {
  if (props.skeleton) {
    return (
      <div className="mt-5 mb-8 rounded-2xl bg-surface border border-border p-5">
        {/* Top row — percentage + owned count */}
        <div className="flex items-end justify-between mb-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-20 rounded bg-surface-subtle animate-pulse" />
            <div className="h-10 w-20 rounded-lg bg-surface-subtle animate-pulse" />
            <div className="h-3 w-16 rounded bg-surface-subtle animate-pulse" />
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <div className="h-8 w-12 rounded-lg bg-surface-subtle animate-pulse" />
            <div className="h-3 w-14 rounded bg-surface-subtle animate-pulse" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-surface-subtle animate-pulse" />

        {/* 4-col grid */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-surface-subtle animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const {
    albumName,
    percentage,
    counts,
    specialsOwned,
    specialStickersCount,
    totalStickers,
  } = props;

  return (
    <div className="mt-5 mb-8 rounded-2xl bg-surface border border-border p-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-muted mb-0.5">{albumName}</p>
          <p className="text-4xl font-black text-brand leading-none">
            {percentage}
            <span className="text-2xl">%</span>
          </p>
          <p className="text-xs text-muted mt-1">completado</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {counts.owned}
          </p>
          <p className="text-xs text-muted">de {totalStickers}</p>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="text-center p-2 rounded-xl bg-surface-subtle">
          <p className="text-base font-bold text-brand tabular-nums">
            {counts.owned}
          </p>
          <p className="text-[10px] text-muted mt-0.5">tengo</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-surface-subtle">
          <p className="text-base font-bold text-foreground tabular-nums">
            {counts.missing}
          </p>
          <p className="text-[10px] text-muted mt-0.5">me faltan</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-surface-subtle">
          <p className="text-base font-bold text-amber-400 tabular-nums">
            {counts.repeated}
          </p>
          <p className="text-[10px] text-muted mt-0.5">repetidas</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-yellow-500/10 border border-yellow-600/20">
          <p className="text-base font-bold text-yellow-300 tabular-nums">
            {specialsOwned}
            <span className="text-[10px] font-normal text-yellow-600/70">
              /{specialStickersCount}
            </span>
          </p>
          <p className="text-[10px] text-yellow-600/80 mt-0.5">✦ especiales</p>
        </div>
      </div>
    </div>
  );
}
