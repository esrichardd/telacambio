import type { Sticker } from "@/types/app";
import { sortSectionsByAlbumOrder } from "@/lib/constants/album-order";

interface ProfileStickersProps {
  groupedStickers: Record<string, Sticker[]>;
  ownerOwned: { sticker_id: string; quantity: number }[];
}

function StickerChips({ stickers }: { stickers: Sticker[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {stickers.map((s) => (
        <span
          key={s.id}
          title={s.name ?? s.code}
          className="px-1.5 py-0.5 rounded text-[11px] font-mono text-muted border border-border bg-surface-subtle"
        >
          {s.number ?? s.code}
        </span>
      ))}
    </div>
  );
}

interface SectionListProps {
  bySection: Record<string, Sticker[]>;
  total: number;
}

function SectionList({ bySection, total }: SectionListProps) {
  const sections = sortSectionsByAlbumOrder(Object.keys(bySection));

  if (total === 0) {
    return <p className="text-sm text-muted italic mt-3">Ninguna.</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {sections.map((section) => (
        <div key={section} className="flex gap-2 items-start">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider w-8 mt-1 flex-shrink-0">
            {section}
          </span>
          <StickerChips stickers={bySection[section]} />
        </div>
      ))}
    </div>
  );
}

export default function ProfileStickers({
  groupedStickers,
  ownerOwned,
}: ProfileStickersProps) {
  // Build a map of sticker_id → quantity for O(1) lookups
  const ownerMap = new Map(ownerOwned.map((s) => [s.sticker_id, s.quantity]));

  // Compute duplicates (qty >= 2) and missing (qty === 0) grouped by section
  const duplicatesBySection: Record<string, Sticker[]> = {};
  const missingBySection: Record<string, Sticker[]> = {};
  let totalDuplicates = 0;
  let totalMissing = 0;

  for (const [section, stickers] of Object.entries(groupedStickers)) {
    for (const sticker of stickers) {
      const qty = ownerMap.get(sticker.id) ?? 0;

      if (qty >= 2) {
        if (!duplicatesBySection[section]) duplicatesBySection[section] = [];
        duplicatesBySection[section].push(sticker);
        totalDuplicates++;
      }

      if (qty === 0) {
        if (!missingBySection[section]) missingBySection[section] = [];
        missingBySection[section].push(sticker);
        totalMissing++;
      }
    }
  }

  if (totalDuplicates === 0 && totalMissing === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10 flex flex-col gap-3">
      {/* Repetidas disponibles */}
      <details
        open
        className="group rounded-xl border border-border bg-surface overflow-hidden"
      >
        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-surface-subtle transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Sus repetidas disponibles
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-subtle border border-border text-xs text-muted font-medium">
              {totalDuplicates}
            </span>
          </div>
          {/* Chevron that flips when open */}
          <svg
            className="w-4 h-4 text-muted transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div className="px-5 pb-5 border-t border-border">
          <SectionList
            bySection={duplicatesBySection}
            total={totalDuplicates}
          />
        </div>
      </details>

      {/* Le faltan */}
      <details
        open
        className="group rounded-xl border border-border bg-surface overflow-hidden"
      >
        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-surface-subtle transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Le faltan
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-subtle border border-border text-xs text-muted font-medium">
              {totalMissing}
            </span>
          </div>
          <svg
            className="w-4 h-4 text-muted transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div className="px-5 pb-5 border-t border-border">
          <SectionList bySection={missingBySection} total={totalMissing} />
        </div>
      </details>
    </div>
  );
}
