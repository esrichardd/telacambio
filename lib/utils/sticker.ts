/**
 * Normaliza el código de una barajita al formato estándar "SECTION-NUMBER".
 * Acepta inputs como: "arg2", "ARG2", "arg-2", "ARG-2", " arg 2 "
 * Devuelve siempre: "ARG-2"
 */
export function normalizeStickerCode(input: string): string {
  const clean = input.trim().toUpperCase().replace(/\s/g, "");

  // Si ya tiene guion: "ARG-2" → "ARG-2"
  if (clean.includes("-")) return clean;

  // Sin guion: "ARG2" → separar letras de números → "ARG-2"
  const match = clean.match(/^([A-Z]+)(\d+)$/);
  if (!match) return clean; // si no matchea, devolver como está

  const [, section, number] = match;
  return `${section}-${number}`;
}

/**
 * Parsea el código de una barajita en sus partes.
 * "ARG-2" → { section: "ARG", number: 2 }
 * Retorna null si el formato no es válido.
 */
export function parseStickerCode(
  code: string,
): { section: string; number: number } | null {
  const normalized = normalizeStickerCode(code);
  const match = normalized.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;

  return {
    section: match[1],
    number: parseInt(match[2], 10),
  };
}

/**
 * Valida si un código de barajita tiene el formato correcto.
 * Formato válido: letras seguidas de números, con o sin guion. "ARG-2", "ARG2"
 */
export function isValidStickerCode(input: string): boolean {
  const clean = input.trim().toUpperCase().replace(/\s/g, "");
  return /^[A-Z]+-?\d+$/.test(clean);
}
