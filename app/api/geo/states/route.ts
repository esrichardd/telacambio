import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const country = new URL(request.url).searchParams.get("country");
  if (!country) return NextResponse.json([]);

  try {
    // Pedimos todos los campos candidatos para el código de estado
    const res = await fetch(
      `https://api.geocoded.me/countries/${encodeURIComponent(country)}/states?fields=name,stateCode,iso2,code,id`,
      { next: { revalidate: 604800 } }, // 7 días de caché
    );

    if (!res.ok) return NextResponse.json([]);

    const raw = await res.json();
    const data: Record<string, unknown>[] = Array.isArray(raw)
      ? raw
      : (raw.data ?? []);

    // Normalizar: el código del estado puede venir bajo distintos nombres según la API
    const states = data
      .map((s) => ({
        name: String(s.name ?? ""),
        // Cadena de fallbacks para encontrar el identificador del estado
        stateCode: String(
          s.stateCode ?? s.iso2 ?? s.code ?? s.id ?? s.name ?? "",
        ),
      }))
      .filter((s) => s.name && s.stateCode);

    return NextResponse.json(states);
  } catch {
    return NextResponse.json([]);
  }
}
