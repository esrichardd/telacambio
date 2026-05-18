/**
 * Official section order of the Panini FIFA World Cup 2026 album.
 * FWC and CC are handled separately (FWC first, CC last).
 */
export const ALBUM_ORDER = [
  "MEX",
  "RSA",
  "KOR",
  "CZE",
  "CAN",
  "BIH",
  "QAT",
  "SUI",
  "BRA",
  "MAR",
  "HAI",
  "SCO",
  "USA",
  "PAR",
  "AUS",
  "TUR",
  "GER",
  "CUW",
  "CIV",
  "ECU",
  "NED",
  "JPN",
  "SWE",
  "TUN",
  "BEL",
  "EGY",
  "IRN",
  "NZL",
  "ESP",
  "CPV",
  "KSA",
  "URU",
  "FRA",
  "SEN",
  "IRQ",
  "NOR",
  "ARG",
  "ALG",
  "AUT",
  "JOR",
  "POR",
  "COD",
  "UZB",
  "COL",
  "ENG",
  "CRO",
  "GHA",
  "PAN",
] as const;

/**
 * Sorts a list of section keys following the official album order:
 *   FWC variants first → ALBUM_ORDER teams → unknown extras → CC last.
 */
export function sortSectionsByAlbumOrder(sections: string[]): string[] {
  const keySet = new Set(sections);

  const fwcKeys = ["FWC", "FWC_ESP", "FWC_BAL", "FWC_HIS"].filter((k) =>
    keySet.has(k),
  );
  const middle = ALBUM_ORDER.filter((k) => keySet.has(k));
  const known = new Set([...fwcKeys, ...middle, "CC"]);
  const extra = sections.filter((k) => !known.has(k));
  const cc = keySet.has("CC") ? ["CC"] : [];

  return [...fwcKeys, ...middle, ...extra, ...cc];
}
