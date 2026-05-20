import type { TopRepeatedSticker } from "@/types/app";

type Props =
  | { skeleton: true }
  | { skeleton?: false; items: TopRepeatedSticker[] };

export default function TopRepeatedList(props: Props) {
  if (props.skeleton) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3">
        <div className="h-4 w-28 bg-surface-subtle rounded-full animate-pulse" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-surface-subtle rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const { items } = props;

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-foreground text-sm font-medium">Más repetidas</p>

      {items.length === 0 ? (
        <p className="text-muted text-xs">Aún no tienes repetidas</p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {items.map((sticker) => (
            <div
              key={sticker.code}
              className="bg-surface-subtle border border-border rounded-lg px-2.5 py-1.5 flex items-center gap-2"
            >
              <span className="text-foreground text-xs font-medium">
                {sticker.code}
              </span>
              <span className="bg-brand/8 text-brand text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none tabular-nums">
                ×{sticker.quantity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
