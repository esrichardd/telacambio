import { NextRequest, NextResponse } from "next/server";

// Convierte coordenadas GPS en país/estado/ciudad usando Nominatim (OpenStreetMap)
// Gratuito, sin API key, con revalidación de 24h por coordenadas aproximadas
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) return NextResponse.json(null);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          // Nominatim requiere un User-Agent identificando la app
          "User-Agent": "TeLaCambio/1.0 (https://telacambio.app)",
          "Accept-Language": "es",
        },
        next: { revalidate: 86400 }, // 24h — coordenadas aproximadas cambian poco
      },
    );

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    const addr = data.address ?? {};

    return NextResponse.json({
      country_code: addr.country_code?.toUpperCase() ?? null, // e.g. "CO"
      state: addr.state ?? addr.region ?? addr.county ?? null,
      city:
        addr.city ??
        addr.town ??
        addr.village ??
        addr.municipality ??
        addr.suburb ??
        null,
    });
  } catch {
    return NextResponse.json(null);
  }
}
