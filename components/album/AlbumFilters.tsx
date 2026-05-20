export type FilterState = "all" | "missing" | "repeated";

const FILTERS: { value: FilterState; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "missing", label: "Me faltan" },
  { value: "repeated", label: "Repetidas" },
];

interface AlbumFiltersProps {
  active: FilterState;
  onChange: (f: FilterState) => void;
  counts: Record<FilterState, number>;
}

export default function AlbumFilters({
  active,
  onChange,
  counts,
}: AlbumFiltersProps) {
  return (
    <div className="flex justify-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`
            flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            border transition-all duration-150
            ${
              active === value
                ? "bg-brand text-white border-brand"
                : "bg-surface border-border text-muted hover:text-foreground hover:border-border/80"
            }
          `}
        >
          {label}
          <span
            className={`
              text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums
              ${active === value ? "bg-white/20" : "bg-surface-subtle"}
            `}
          >
            {counts[value]}
          </span>
        </button>
      ))}
    </div>
  );
}
