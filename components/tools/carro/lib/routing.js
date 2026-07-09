// Ruta real por calles usando el servidor público de OSRM.
// Devuelve { km, coords } donde coords es la geometría real [[lat,lng], ...].
// Si falla, cae a línea recta (haversine).

export async function routeDistanceKm(origin, dest) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.lng},${origin.lat};${dest.lng},${dest.lat}` +
    `?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.routes && json.routes[0]) {
      const r = json.routes[0];
      const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      return { km: +(r.distance / 1000).toFixed(2), coords };
    }
  } catch (e) {
    // sin red o servicio caído -> línea recta
  }
  return {
    km: haversineKm(origin, dest),
    coords: [
      [origin.lat, origin.lng],
      [dest.lat, dest.lng],
    ],
  };
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return +(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))).toFixed(2);
}
