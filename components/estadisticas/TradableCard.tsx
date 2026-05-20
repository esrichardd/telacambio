type Props = { skeleton: true } | { skeleton?: false; available: number };

export default function TradableCard(props: Props) {
  if (props.skeleton) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-subtle animate-pulse shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-8 w-16 bg-surface-subtle rounded-full animate-pulse" />
          <div className="h-3 w-40 bg-surface-subtle rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  const { available } = props;

  return (
    <div className="bg-surface border border-brand/20 rounded-2xl p-4 flex items-center gap-4">
      {/* Icon container */}
      <div className="bg-brand/8 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>

      <div>
        <p className="text-brand text-3xl font-bold leading-none tabular-nums">
          {available.toLocaleString("es")}
        </p>
        <p className="text-muted text-xs mt-1.5">
          barajitas disponibles para cambio
        </p>
      </div>
    </div>
  );
}
