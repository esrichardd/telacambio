import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Pedimos campos candidatos — el nombre del emoji puede variar (emoji, flag, flagEmoji)
    const res = await fetch(
      "https://api.geocoded.me/countries?fields=name,iso2,emoji,flag&limit=300",
      { next: { revalidate: 604800 } }, // 7 días de caché en el servidor
    );

    if (!res.ok) return NextResponse.json([]);

    const raw = await res.json();
    const data: Record<string, unknown>[] = Array.isArray(raw)
      ? raw
      : (raw.data ?? []);

    // Normalizar: asegurar que siempre haya iso2 y name
    const countries = data
      .map((c) => ({
        iso2: String(c.iso2 ?? c.code ?? ""),
        name: String(c.name ?? ""),
        emoji: String(c.emoji ?? c.flag ?? c.flagEmoji ?? ""),
      }))
      .filter((c) => c.iso2 && c.name);

    return NextResponse.json(countries);
  } catch {
    return NextResponse.json([]);
  }
}
