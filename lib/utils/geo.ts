const EARTH_RADIUS_KM = 6371;

/**
 * Calcula la distancia en km entre dos puntos geográficos usando la fórmula de Haversine.
 * Sin APIs externas — funciona puramente con las coordenadas.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10; // redondea a 1 decimal
}

/**
 * Convierte una ciudad y país a coordenadas lat/lng usando Nominatim (OpenStreetMap).
 * Gratuito, sin API key. Límite de uso: 1 request/segundo.
 * Usar solo al guardar el perfil — no en cada render.
 *
 * Retorna null si la ciudad no se encuentra.
 */
export async function geocodeCity(
  city: string,
  countryCode: string,
): Promise<{ lat: number; lng: number } | null> {
  const params = new URLSearchParams({
    q: `${city}, ${countryCode}`,
    format: "json",
    limit: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        // Nominatim requiere un User-Agent identificando la app
        "User-Agent": "TeLaCambio/1.0 (telacambio.com)",
      },
    },
  );

  if (!response.ok) return null;

  const results = await response.json();
  if (!results || results.length === 0) return null;

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}

/** Formatea una distancia en km para mostrar en la UI: "1.2 km" o "850 m" */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
