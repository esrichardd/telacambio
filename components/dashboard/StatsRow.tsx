import type { CollectionSummary } from "@/types/app";

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

interface StatsRowProps {
  summary: CollectionSummary;
}

export default function StatsRow({ summary }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard value={summary.owned} label="Tengo" highlight />
      <StatCard value={summary.missing} label="Me faltan" />
      <StatCard value={summary.repeated} label="Repetidas" />
      <StatCard value={summary.available} label="Para cambio" />
    </div>
  );
}
