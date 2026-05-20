type Props =
  | { skeleton: true }
  | { skeleton?: false; owned: number; total: number };

export default function SpecialsCard(props: Props) {
  if (props.skeleton) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-20 bg-surface-subtle rounded-full animate-pulse" />
          <div className="h-4 w-12 bg-surface-subtle rounded-full animate-pulse" />
        </div>
        <div className="h-1.5 w-full bg-surface-subtle rounded-full animate-pulse" />
        <div className="h-3 w-36 bg-surface-subtle rounded-full animate-pulse" />
      </div>
    );
  }

  const { owned, total } = props;
  const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
  const missing = total - owned;

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-medium">Especiales</span>
        <span className="text-sm tabular-nums">
          <span className="text-brand font-medium">{owned}</span>
          <span className="text-muted"> / {total}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-1.5 bg-brand rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-muted/60 text-xs">
        {missing > 0
          ? `${missing} especiales por conseguir`
          : "¡Tienes todas las especiales!"}
      </p>
    </div>
  );
}
