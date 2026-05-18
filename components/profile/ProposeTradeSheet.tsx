"use client";

import { useState, useTransition } from "react";
import type { Sticker } from "@/types/app";
import type { TradeDirection } from "@/types/app";
import { proposeTradeAction } from "@/app/actions/trades";
import {
  buildTradeProposalMessage,
  buildWhatsAppLink,
} from "@/lib/utils/whatsapp";
import { sortSectionsByAlbumOrder } from "@/lib/constants/album-order";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProposalData = {
  receiverId: string;
  albumId: string;
  receiverUsername: string;
  receiverWhatsapp: string | null;
};

interface Props {
  /** Stickers the owner has repeated → visitor can choose to receive */
  theyCanGive: Sticker[];
  /** Stickers the visitor has repeated → visitor can choose to give */
  youCanGive: Sticker[];
  proposalData: ProposalData;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// ─── Selectable chip list ──────────────────────────────────────────────────────

function SelectableStickerList({
  stickers,
  selected,
  onToggle,
}: {
  stickers: Sticker[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const grouped = groupBySection(stickers);
  const sections = sortSectionsByAlbumOrder(Object.keys(grouped));

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section) => (
        <div key={section} className="flex flex-wrap gap-1.5 items-start">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider w-8 mt-1 flex-shrink-0">
            {section}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {grouped[section].map((s) => {
              const active = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onToggle(s.id)}
                  title={s.name ?? s.code}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                    active
                      ? "bg-brand text-white border border-brand"
                      : "bg-brand/8 border border-brand/20 text-brand hover:bg-brand/15"
                  }`}
                >
                  {s.number ?? s.code}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProposeTradeSheet({
  theyCanGive,
  youCanGive,
  proposalData,
}: Props) {
  const [open, setOpen] = useState(false);
  // stickers visitor will receive (direction = receiver_gives)
  const [selectedReceive, setSelectedReceive] = useState<Set<string>>(
    new Set(),
  );
  // stickers visitor will give (direction = proposer_gives)
  const [selectedGive, setSelectedGive] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = selectedReceive.size > 0 && selectedGive.size > 0;

  function toggle(prev: Set<string>, id: string): Set<string> {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  function handleOpen() {
    setOpen(true);
    setError(null);
    setSubmitted(false);
  }

  function handleClose() {
    if (isPending) return;
    setOpen(false);
  }

  function handleSubmit() {
    setError(null);

    const stickers: { sticker_id: string; direction: TradeDirection }[] = [
      ...Array.from(selectedReceive).map((id) => ({
        sticker_id: id,
        direction: "receiver_gives" as TradeDirection,
      })),
      ...Array.from(selectedGive).map((id) => ({
        sticker_id: id,
        direction: "proposer_gives" as TradeDirection,
      })),
    ];

    startTransition(async () => {
      const result = await proposeTradeAction({
        receiverId: proposalData.receiverId,
        albumId: proposalData.albumId,
        stickers,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Open WhatsApp if receiver has a number
      if (proposalData.receiverWhatsapp) {
        const iGive = youCanGive.filter((s) => selectedGive.has(s.id));
        const iReceive = theyCanGive.filter((s) => selectedReceive.has(s.id));
        const message = buildTradeProposalMessage(
          proposalData.receiverUsername,
          iGive,
          iReceive,
        );
        const waLink = buildWhatsAppLink(
          proposalData.receiverWhatsapp,
          message,
        );
        window.open(waLink, "_blank", "noopener,noreferrer");
      }

      setSubmitted(true);
      setOpen(false);
      setSelectedReceive(new Set());
      setSelectedGive(new Set());
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full mt-4 py-2.5 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
      >
        Proponer intercambio
      </button>

      {submitted && (
        <p className="text-xs text-brand text-center mt-2 font-medium">
          ✓ Propuesta guardada
        </p>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={handleClose} />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Proponer intercambio
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-subtle transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="overflow-y-auto px-5 py-4 space-y-6"
          style={{ maxHeight: "calc(85dvh - 64px - 96px)" }}
        >
          {/* Section: they give → visitor receives */}
          {theyCanGive.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  @{proposalData.receiverUsername} te da
                </span>
                {selectedReceive.size > 0 && (
                  <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                    {selectedReceive.size} seleccionadas
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted mb-3">
                Toca las barajitas que quieres recibir.
              </p>
              <SelectableStickerList
                stickers={theyCanGive}
                selected={selectedReceive}
                onToggle={(id) =>
                  setSelectedReceive((prev) => toggle(prev, id))
                }
              />
            </div>
          )}

          {/* Section: visitor gives */}
          {youCanGive.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  Tú le das
                </span>
                {selectedGive.size > 0 && (
                  <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                    {selectedGive.size} seleccionadas
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted mb-3">
                Toca las barajitas que le quieres dar.
              </p>
              <SelectableStickerList
                stickers={youCanGive}
                selected={selectedGive}
                onToggle={(id) => setSelectedGive((prev) => toggle(prev, id))}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          {error && (
            <p className="text-xs text-red-400 mb-3 text-center">{error}</p>
          )}

          {/* Summary pill */}
          {(selectedGive.size > 0 || selectedReceive.size > 0) && (
            <div className="flex justify-center mb-3">
              <span className="text-xs text-muted bg-surface-subtle border border-border rounded-full px-3 py-1">
                Das{" "}
                <span className="font-semibold text-foreground">
                  {selectedGive.size}
                </span>{" "}
                · Recibes{" "}
                <span className="font-semibold text-foreground">
                  {selectedReceive.size}
                </span>
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={!canSubmit || isPending}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-full text-sm font-semibold transition-colors ${
              canSubmit && !isPending
                ? "bg-brand text-white hover:bg-brand-dark"
                : "bg-brand/15 text-brand/40 cursor-not-allowed"
            }`}
          >
            {isPending
              ? "Guardando..."
              : proposalData.receiverWhatsapp
                ? "Guardar y enviar por WhatsApp"
                : "Guardar propuesta"}
          </button>

          {!canSubmit && !isPending && (
            <p className="text-[11px] text-muted text-center mt-2">
              Selecciona al menos una barajita en cada sección
            </p>
          )}
        </div>
      </div>
    </>
  );
}
