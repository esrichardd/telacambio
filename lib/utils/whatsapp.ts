import type { Sticker } from "@/types/app";

type RepeatedSticker = Sticker & { available_to_trade: number };

/**
 * Genera la lista de barajitas que faltan, formateada para WhatsApp.
 * Ejemplo: "ARG-1, ARG-3, BRA-2, BRA-7"
 */
export function formatMissingList(stickers: Sticker[]): string {
  if (stickers.length === 0) return "¡Ninguna! 🎉";
  return stickers.map((s) => s.code).join(", ");
}

/**
 * Genera la lista de barajitas repetidas disponibles para cambio.
 * Ejemplo: "ARG-1 (x2), BRA-5 (x3)"
 */
export function formatRepeatedList(stickers: RepeatedSticker[]): string {
  if (stickers.length === 0) return "Ninguna por ahora";
  return stickers
    .map((s) =>
      s.available_to_trade === 1
        ? s.code
        : `${s.code} (x${s.available_to_trade})`,
    )
    .join(", ");
}

/**
 * Construye el mensaje completo listo para copiar y pegar en WhatsApp.
 * Incluye las que faltan y las que tiene repetidas para ofrecer.
 */
export function buildWhatsAppMessage(
  missing: Sticker[],
  repeated: RepeatedSticker[],
  username: string,
  albumName: string = "Mundial 2026",
): string {
  const lines: string[] = [
    `🃏 *Mi álbum ${albumName}* — telacambio.com/@${username}`,
    "",
    `❌ *Me faltan (${missing.length}):*`,
    formatMissingList(missing),
    "",
    `✅ *Tengo repetidas (${repeated.length}):*`,
    formatRepeatedList(repeated),
    "",
    `📲 Escríbeme para cambiar`,
  ];

  return lines.join("\n");
}

/**
 * Genera el link de WhatsApp con el mensaje pre-cargado.
 * @param phoneNumber - Número con código de país, sin +: "573001234567"
 * @param message - El mensaje a enviar
 */
export function buildWhatsAppLink(
  phoneNumber: string,
  message: string,
): string {
  const clean = phoneNumber.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encoded}`;
}

/**
 * Construye el mensaje de WhatsApp para una propuesta de intercambio.
 * @param receiverUsername - Username del receptor de la propuesta
 * @param iGive - Barajitas que el proponente da al receptor
 * @param iReceive - Barajitas que el proponente recibe del receptor
 */
export function buildTradeProposalMessage(
  receiverUsername: string,
  iGive: Sticker[],
  iReceive: Sticker[],
): string {
  const lines: string[] = [
    `🤝 *Propuesta de intercambio* — Mundial 2026`,
    `Para @${receiverUsername}`,
    "",
  ];

  if (iGive.length > 0) {
    lines.push(`✅ *Yo te doy (${iGive.length}):*`);
    lines.push(iGive.map((s) => s.code).join(", "));
    lines.push("");
  }

  if (iReceive.length > 0) {
    lines.push(`📥 *Yo recibo (${iReceive.length}):*`);
    lines.push(iReceive.map((s) => s.code).join(", "));
    lines.push("");
  }

  lines.push(`📲 Acordemos el intercambio — telacambio.co`);

  return lines.join("\n");
}
