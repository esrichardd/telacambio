type Props =
  | { skeleton: true }
  | { skeleton?: false; daysCollecting: number; streak: number };

export default function TimelineRow(props: Props) {
  if (props.skeleton) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-2"
          >
            <div className="w-5 h-5 bg-surface-subtle rounded-full animate-pulse" />
            <div className="h-8 w-12 bg-surface-subtle rounded-full animate-pulse" />
            <div className="h-3 w-24 bg-surface-subtle rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const { daysCollecting, streak } = props;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {/* Days collecting */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-1">
        {/* Calendar icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p className="text-foreground text-3xl font-bold tabular-nums leading-none mt-1">
          {daysCollecting > 0 ? daysCollecting.toLocaleString("es") : "—"}
        </p>
        <p className="text-muted text-xs text-center leading-tight mt-0.5">
          {daysCollecting === 0 ? "Hoy empezaste" : "días coleccionando"}
        </p>
      </div>

      {/* Current streak */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col items-center gap-1">
        {/* Flame icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={streak > 0 ? "var(--color-brand)" : "var(--color-muted)"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2c0 0-5 4-5 9a5 5 0 0 0 10 0c0-3-2-5-2-5s-1 2-3 2c0 0 2-3 0-6z" />
        </svg>
        <p className="text-foreground text-3xl font-bold tabular-nums leading-none mt-1">
          {streak > 0 ? streak : "—"}
        </p>
        <p className="text-muted text-xs text-center leading-tight mt-0.5">
          {streak === 0 ? "Sin racha activa" : "racha actual"}
        </p>
      </div>
    </div>
  );
}
