"use client";

import { useState, useTransition } from "react";
import type { TradeWithDetails, TradeStatus } from "@/types/app";
import {
  acceptTradeAction,
  rejectTradeAction,
  cancelTradeAction,
} from "@/app/actions/trades";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  receivedTrades: TradeWithDetails[];
  sentTrades: TradeWithDetails[];
  pendingCount: number;
}

type Tab = "received" | "sent";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(displayName: string | null, username: string): string {
  const name = (displayName ?? username).trim();
  const parts = name.split(/\s+/);
  return parts
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return mins <= 1 ? "ahora" : `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return `hace ${days}d`;
}

const STATUS_LABEL: Record<TradeStatus, string> = {
  pending: "pendiente",
  accepted: "aceptada",
  rejected: "rechazada",
  cancelled: "cancelada",
};

const STATUS_CLASS: Record<TradeStatus, string> = {
  pending: "bg-surface-subtle border-border text-muted",
  accepted: "bg-brand/10 border-brand/25 text-brand",
  rejected: "bg-red-500/10 border-red-500/25 text-red-400",
  cancelled: "bg-surface-subtle border-border text-muted",
};

// ─── Sticker chip list (read-only) ─────────────────────────────────────────────

function StickerChips({
  codes,
  variant,
}: {
  codes: string[];
  variant: "give" | "receive";
}) {
  if (codes.length === 0) return null;
  const cls =
    variant === "receive"
      ? "bg-brand/8 border border-brand/20 text-brand"
      : "bg-surface-subtle border border-border text-muted";

  return (
    <div className="flex flex-wrap gap-1">
      {codes.map((code) => (
        <span
          key={code}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${cls}`}
        >
          {code}
        </span>
      ))}
    </div>
  );
}

// ─── Trade card ────────────────────────────────────────────────────────────────

function TradeCard({
  trade,
  perspective,
  onAction,
}: {
  trade: TradeWithDetails;
  perspective: "receiver" | "proposer";
  onAction: (id: string, action: "accept" | "reject" | "cancel") => void;
}) {
  const isPending = trade.status === "pending";
  const isAccepted = trade.status === "accepted";

  const counterpart =
    perspective === "receiver" ? trade.proposer : trade.receiver;

  // Split stickers by direction
  const theyGiveCodes = trade.stickers
    .filter((s) =>
      perspective === "receiver"
        ? s.direction === "proposer_gives"
        : s.direction === "receiver_gives",
    )
    .map((s) => s.sticker.number?.toString() ?? s.sticker.code);

  const youGiveCodes = trade.stickers
    .filter((s) =>
      perspective === "receiver"
        ? s.direction === "receiver_gives"
        : s.direction === "proposer_gives",
    )
    .map((s) => s.sticker.number?.toString() ?? s.sticker.code);

  const initials = getInitials(
    counterpart.display_name ?? null,
    counterpart.username ?? "",
  );

  const theyLabel =
    perspective === "receiver"
      ? isAccepted
        ? "Te dio"
        : "Te da"
      : isAccepted
        ? "Te dio"
        : "Te da";
  const youLabel = isAccepted ? "Le diste" : "Le das";

  return (
    <div
      className={`rounded-xl border p-3 ${
        trade.status === "accepted"
          ? "border-brand/20 bg-brand/3"
          : "border-border bg-surface-subtle"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center text-[11px] font-semibold text-brand flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground">
            @{counterpart.username}
          </span>
          <span className="text-[10px] text-muted ml-2">
            {trade.created_at ? formatRelativeTime(trade.created_at) : ""}
          </span>
        </div>
        <span
          className={`text-[10px] border rounded-full px-2 py-0.5 flex-shrink-0 ${STATUS_CLASS[trade.status]}`}
        >
          {STATUS_LABEL[trade.status]}
        </span>
      </div>

      {/* Stickers grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-background p-2">
          <p className="text-[9px] font-semibold text-brand uppercase tracking-wider mb-1.5">
            {theyLabel}
          </p>
          <StickerChips codes={theyGiveCodes} variant="receive" />
        </div>
        <div className="rounded-lg bg-background p-2">
          <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-1.5">
            {youLabel}
          </p>
          <StickerChips codes={youGiveCodes} variant="give" />
        </div>
      </div>

      {/* Actions */}
      {isPending && perspective === "receiver" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAction(trade.id, "accept")}
            className="flex-1 py-2 rounded-full bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
          >
            Aceptar
          </button>
          <button
            type="button"
            onClick={() => onAction(trade.id, "reject")}
            className="flex-1 py-2 rounded-full border border-border text-muted text-xs hover:text-foreground transition-colors"
          >
            Rechazar
          </button>
        </div>
      )}

      {isPending && perspective === "proposer" && (
        <button
          type="button"
          onClick={() => onAction(trade.id, "cancel")}
          className="w-full py-2 rounded-full border border-border text-muted text-xs hover:text-foreground transition-colors"
        >
          Cancelar propuesta
        </button>
      )}
    </div>
  );
}

// ─── Empty states ──────────────────────────────────────────────────────────────

function EmptyReceived({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-brand/8 border border-brand/15 flex items-center justify-center">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand"
        >
          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground">
        Sin propuestas recibidas
      </p>
      <p className="text-xs text-muted leading-relaxed">
        Comparte tu perfil para que otros coleccionistas te propongan
        intercambios.
      </p>
      <button
        type="button"
        onClick={() => {
          onClose();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="mt-1 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-medium hover:bg-brand/15 transition-colors"
      >
        Ver mi QR
      </button>
    </div>
  );
}

function EmptySent() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-brand/8 border border-brand/15 flex items-center justify-content: center flex items-center justify-center">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground">
        Ninguna propuesta enviada
      </p>
      <p className="text-xs text-muted leading-relaxed">
        Visita el perfil de otro coleccionista y toca &quot;Proponer
        intercambio&quot;.
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

// Inner component holds all hooks — necessary because hooks cannot come after
// a conditional return, so the skeleton check lives in the outer wrapper.
function TradesInboxSheetInner({ receivedTrades, sentTrades }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("received");
  const [localReceived, setLocalReceived] = useState(receivedTrades);
  const [localSent, setLocalSent] = useState(sentTrades);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingReceived = localReceived.filter(
    (t) => t.status === "pending",
  ).length;

  function handleClose() {
    setOpen(false);
    setActionError(null);
  }

  function handleAction(id: string, action: "accept" | "reject" | "cancel") {
    setActionError(null);

    startTransition(async () => {
      let result;
      if (action === "accept") result = await acceptTradeAction(id);
      else if (action === "reject") result = await rejectTradeAction(id);
      else result = await cancelTradeAction(id);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      // Optimistic update — server already revalidated via revalidatePath
      if (action === "accept") {
        setLocalReceived((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: "accepted" as const } : t,
          ),
        );
      } else if (action === "reject") {
        setLocalReceived((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: "rejected" as const } : t,
          ),
        );
      } else {
        setLocalSent((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: "cancelled" as const } : t,
          ),
        );
      }
    });
  }

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver propuestas de intercambio"
        className="fixed bottom-20 right-4 z-30
          w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-brand/30
          hover:bg-brand-dark active:scale-95
          transition-all duration-150
          flex items-center justify-center"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>

        {pendingReceived > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 border-2 border-background text-white text-[9px] font-bold flex items-center justify-center px-1">
            {pendingReceived}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={handleClose} />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Mis propuestas
            </h2>
            {pendingReceived > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-semibold">
                {pendingReceived}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface-subtle transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-3 pb-0 flex-shrink-0">
          <button
            type="button"
            onClick={() => setTab("received")}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              tab === "received"
                ? "bg-brand text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            Recibidas
            {pendingReceived > 0 && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === "received"
                    ? "bg-white text-brand"
                    : "bg-red-500 text-white"
                }`}
              >
                {pendingReceived}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("sent")}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-colors ${
              tab === "sent"
                ? "bg-brand text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            Enviadas
          </button>
        </div>

        {/* Error banner */}
        {actionError && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400 text-center">{actionError}</p>
          </div>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 py-3 flex flex-col gap-3 flex-1">
          {tab === "received" &&
            (localReceived.length === 0 ? (
              <EmptyReceived onClose={handleClose} />
            ) : (
              localReceived.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  perspective="receiver"
                  onAction={handleAction}
                />
              ))
            ))}

          {tab === "sent" &&
            (localSent.length === 0 ? (
              <EmptySent />
            ) : (
              localSent.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  perspective="proposer"
                  onAction={handleAction}
                />
              ))
            ))}
        </div>

        {isPending && (
          <div className="px-5 py-3 border-t border-border flex-shrink-0">
            <p className="text-xs text-muted text-center">Procesando…</p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Public export — skeleton wrapper ─────────────────────────────────────────

type TradesInboxSheetProps =
  | { skeleton: true }
  | (Props & { skeleton?: false });

export default function TradesInboxSheet(props: TradesInboxSheetProps) {
  if (props.skeleton) {
    return (
      <div
        className="fixed bottom-20 right-4 z-30
          w-14 h-14 rounded-full bg-surface border border-border
          flex items-center justify-center animate-pulse"
        aria-hidden
      />
    );
  }
  return <TradesInboxSheetInner {...props} />;
}
