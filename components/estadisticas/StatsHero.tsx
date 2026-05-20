// SVG ring radius and circumference constants
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 289.03

type Props =
  | { skeleton: true }
  | {
      skeleton?: false;
      percentage: number;
      owned: number;
      total: number;
      missing: number;
    };

export default function StatsHero(props: Props) {
  if (props.skeleton) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-5">
        {/* Ring placeholder */}
        <div className="w-24 h-24 rounded-full bg-surface-subtle animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-8 w-20 bg-surface-subtle rounded-full animate-pulse" />
          <div className="h-3 w-32 bg-surface-subtle rounded-full animate-pulse" />
          <div className="h-1 w-full bg-surface-subtle rounded-full animate-pulse" />
          <div className="h-3 w-24 bg-surface-subtle rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  const { percentage, owned, total, missing } = props;

  // Stroke offset: full circle minus the filled portion
  const dashOffset = CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-5">
      {/* Progress ring */}
      <svg
        width="96"
        height="96"
        viewBox="0 0 100 100"
        className="shrink-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Text alongside the ring */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div>
          <p className="text-foreground text-2xl font-bold leading-none tabular-nums">
            {percentage}%
          </p>
          <p className="text-muted text-xs mt-1">
            {owned.toLocaleString("es")} de {total.toLocaleString("es")}{" "}
            barajitas
          </p>
        </div>
        {/* Mini progress bar */}
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-1 bg-brand rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-muted/60 text-xs">
          {missing.toLocaleString("es")} todavía te faltan
        </p>
      </div>
    </div>
  );
}
