import { NextRequest, NextResponse } from "next/server";

// Siempre dinámico — la respuesta es específica para cada IP de usuario
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Extraer la IP real del usuario (funciona detrás de Vercel/proxies)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor?.split(",")[0].trim() ?? realIp ?? "";

  try {
    const headers: HeadersInit = {
      "User-Agent": "TeLaCambio/1.0 (https://telacambio.app)",
    };
    // Reenviar la IP del cliente para que Geocoded detecte su ubicación, no la del servidor
    if (clientIp) headers["X-Forwarded-For"] = clientIp;

    const res = await fetch("https://api.geocoded.me", { headers });
    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();

    // Solo devolvemos lo que necesitamos — sin exponer la IP al cliente
    return NextResponse.json({
      country: data.country ?? null, // ISO2 code (e.g. "CO")
      region: data.region ?? null, // nombre del estado/departamento
      city: data.city ?? null,
    });
  } catch {
    return NextResponse.json(null);
  }
}
