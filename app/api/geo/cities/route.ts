import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const state = searchParams.get("state");

  if (!country || !state) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://api.geocoded.me/countries/${encodeURIComponent(country)}/states/${encodeURIComponent(state)}/cities?fields=name&limit=500`,
      { next: { revalidate: 604800 } }, // 7 días de caché
    );

    if (!res.ok) return NextResponse.json([]);

    const raw = await res.json();
    const data: Record<string, unknown>[] | string[] = Array.isArray(raw)
      ? raw
      : (raw.data ?? []);

    // Normalizar a array de strings con nombres únicos no vacíos
    const cityNames = [
      ...new Set(
        data
          .map((c) => (typeof c === "string" ? c : String(c.name ?? "")))
          .filter(Boolean),
      ),
    ];

    return NextResponse.json(cityNames);
  } catch {
    return NextResponse.json([]);
  }
}
