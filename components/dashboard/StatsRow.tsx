import type { CollectionSummary } from "@/types/app";

type StatsRowProps =
  | { skeleton: true }
  | { skeleton?: false; summary: CollectionSummary };

interface StatCardProps {
  value: number;
  label: string;
  highlight?: boolean;
}

function StatCard({ value, label, highlight }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-0.5">
      <span
        className={`text-2xl font-bold tabular-nums ${highlight ? "text-brand" : "text-foreground"}`}
      >
        {value.toLocaleString("es-CO")}
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default function StatsRow(props: StatsRowProps) {
  if (props.skeleton) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-1.5"
          >
            <div className="h-7 w-16 bg-surface-subtle rounded-full animate-pulse" />
            <div className="h-3 w-12 bg-surface-subtle rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const { summary } = props;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard value={summary.owned} label="Tengo" highlight />
      <StatCard value={summary.missing} label="Me faltan" />
      <StatCard value={summary.repeated} label="Repetidas" />
      <StatCard value={summary.available} label="Para cambio" />
    </div>
  );
}
