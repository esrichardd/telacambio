/**
 * Normaliza el código de una barajita al formato estándar sin guion.
 * El formato en DB es SECCIONNÚMERO: "ARG5", "MEX12", "FWC1".
 * Acepta inputs como: "arg5", "ARG 5", "arg-5", "ARG-5", " arg 5 "
 * Devuelve siempre: "ARG5"
 */
export function normalizeStickerCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[\s\-_]/g, ""); // elimina espacios, guiones y underscores
}

/**
 * Parsea el código de una barajita en sus partes.
 * "ARG5" → { section: "ARG", number: 5 }
 * "FWC12" → { section: "FWC", number: 12 }
 * Retorna null si el formato no es válido.
 */
export function parseStickerCode(
  code: string,
): { section: string; number: number } | null {
  const normalized = normalizeStickerCode(code);
  const match = normalized.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  return {
    section: match[1],
    number: parseInt(match[2], 10),
  };
}

/**
 * Valida si un código de barajita tiene el formato correcto.
 * Formato válido: letras seguidas de números (con o sin guion/espacio).
 * "ARG5", "arg-5", "FWC 1" → válidos
 */
export function isValidStickerCode(input: string): boolean {
  const normalized = normalizeStickerCode(input);
  return /^[A-Z]+\d+$/.test(normalized);
}
