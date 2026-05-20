import type { SectionStat } from "@/types/app";
import { SECTION_META } from "@/lib/constants/section-names";

type Props = { skeleton: true } | { skeleton?: false; sections: SectionStat[] };

// Returns display name for a section code, falling back to the raw code.
function getSectionName(code: string): string {
  return SECTION_META[code]?.name ?? code;
}

function SectionBar({
  section,
  owned,
  total,
  variant,
}: SectionStat & { variant: "complete" | "incomplete" }) {
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-foreground text-xs truncate pr-2">
          {getSectionName(section)}
        </span>
        <span
          className={`text-xs tabular-nums shrink-0 ${
            variant === "complete" ? "text-brand" : "text-muted"
          }`}
        >
          {owned}/{total}
        </span>
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className={`h-1 rounded-full ${
            variant === "complete" ? "bg-brand" : "bg-muted/40"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SectionProgressList(props: Props) {
  if (props.skeleton) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1].map((col) => (
          <div
            key={col}
            className="bg-surface border border-border rounded-2xl p-3.5 flex flex-col gap-3"
          >
            <div className="h-3.5 w-24 bg-surface-subtle rounded-full animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-surface-subtle rounded-full animate-pulse" />
                  <div className="h-3 w-8 bg-surface-subtle rounded-full animate-pulse" />
                </div>
                <div className="h-1 w-full bg-surface-subtle rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const { sections } = props;

  // Sections with at least one sticker, sorted by completion % desc
  const withOwned = sections.filter((s) => s.owned > 0);
  const almostComplete = [...withOwned]
    .sort((a, b) => b.owned / b.total - a.owned / a.total)
    .slice(0, 3);

  // Sections sorted by completion % asc (most incomplete first)
  const mostIncomplete = [...sections]
    .sort((a, b) => a.owned / a.total - b.owned / b.total)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {/* Almost complete */}
      <div className="bg-surface border border-border rounded-2xl p-3.5 flex flex-col gap-2.5">
        <p className="text-foreground text-xs font-medium">Casi llenas</p>
        {almostComplete.length === 0 ? (
          <p className="text-muted text-xs">Sin datos aún</p>
        ) : (
          almostComplete.map((s) => (
            <SectionBar key={s.section} {...s} variant="complete" />
          ))
        )}
      </div>

      {/* Most incomplete */}
      <div className="bg-surface border border-border rounded-2xl p-3.5 flex flex-col gap-2.5">
        <p className="text-foreground text-xs font-medium">Faltan más</p>
        {mostIncomplete.length === 0 ? (
          <p className="text-muted text-xs">Sin datos aún</p>
        ) : (
          mostIncomplete.map((s) => (
            <SectionBar key={s.section} {...s} variant="incomplete" />
          ))
        )}
      </div>
    </div>
  );
}
