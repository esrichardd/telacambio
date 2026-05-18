import type { Sticker } from "@/types/app";
import { sortSectionsByAlbumOrder } from "@/lib/constants/album-order";
import ProposeTradeSheet, { type ProposalData } from "./ProposeTradeSheet";

interface PotentialTradesProps {
  /** Barajitas que el dueño del perfil tiene repetidas y al visitante le faltan */
  theyCanGive: Sticker[];
  /** Barajitas que el visitante tiene repetidas y al dueño le faltan */
  youCanGive: Sticker[];
  ownerUsername: string;
  /** Present only when the visitor is logged in — enables propose-trade UI */
  proposalData?: ProposalData;
}

// Groups stickers by section for compact display
function groupBySection(stickers: Sticker[]): Record<string, Sticker[]> {
  return stickers.reduce(
    (acc, s) => {
      if (!acc[s.section]) acc[s.section] = [];
      acc[s.section].push(s);
      return acc;
    },
    {} as Record<string, Sticker[]>,
  );
}

function StickerCodeList({ stickers }: { stickers: Sticker[] }) {
  const grouped = groupBySection(stickers);
  const sections = sortSectionsByAlbumOrder(Object.keys(grouped));

  return (
    <div className="flex flex-col gap-2 mt-3">
      {sections.map((section) => (
        <div key={section} className="flex flex-wrap gap-1 items-start">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider w-8 mt-1 flex-shrink-0">
            {section}
          </span>
          <div className="flex flex-wrap gap-1">
            {grouped[section].map((s) => (
              <span
                key={s.id}
                title={s.name ?? s.code}
                className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-brand/8 border border-brand/20 text-brand"
              >
                {s.number ?? s.code}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PotentialTrades({
  theyCanGive,
  youCanGive,
  ownerUsername,
  proposalData,
}: PotentialTradesProps) {
  const total = theyCanGive.length + youCanGive.length;

  // No matches: show empty state
  if (total === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-6">
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <p className="text-sm font-medium text-foreground mb-1">
            Sin cambios potenciales
          </p>
          <p className="text-xs text-muted">
            No hay cruces entre lo que les sobra y lo que les falta a cada uno.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-foreground">
          Podemos intercambiar
        </span>
        <span className="px-2 py-0.5 rounded-full bg-brand/15 border border-brand/25 text-brand text-xs font-semibold">
          {total}
        </span>
        <span className="text-xs text-muted ml-auto">
          basado en tu colección
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {/* They can give */}
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-brand">
              @{ownerUsername} te puede dar
            </span>
            <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
              {theyCanGive.length}
            </span>
          </div>
          <p className="text-[11px] text-muted">
            Tiene repetidas de lo que te falta.
          </p>
          {theyCanGive.length > 0 ? (
            <StickerCodeList stickers={theyCanGive} />
          ) : (
            <p className="text-xs text-muted mt-3 italic">Ninguna en común.</p>
          )}
        </div>

        {/* You can give */}
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-brand">
              Tú le puedes dar
            </span>
            <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
              {youCanGive.length}
            </span>
          </div>
          <p className="text-[11px] text-muted">
            Tienes repetidas de lo que a ellos les falta.
          </p>
          {youCanGive.length > 0 ? (
            <StickerCodeList stickers={youCanGive} />
          ) : (
            <p className="text-xs text-muted mt-3 italic">Ninguna en común.</p>
          )}
        </div>
      </div>

      {/* Propose trade button — only when viewer is logged in */}
      {proposalData && (
        <ProposeTradeSheet
          theyCanGive={theyCanGive}
          youCanGive={youCanGive}
          proposalData={proposalData}
        />
      )}
    </div>
  );
}
