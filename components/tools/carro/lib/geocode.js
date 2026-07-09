// Búsqueda de direcciones con Nominatim (OpenStreetMap), gratis.
// Limitado a Colombia y con sesgo hacia el área de Medellín.

export async function geocode(query) {
  if (!query || query.trim().length < 3) return [];
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=5` +
    `&countrycodes=co&viewbox=-75.75,6.05,-75.40,6.40&bounded=0` +
    `&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { "Accept-Language": "es" } });
    const json = await res.json();
    return json.map((r) => ({
      label: shorten(r.display_name),
      full: r.display_name,
      lat: +r.lat,
      lng: +r.lon,
    }));
  } catch (e) {
    return [];
  }
}

function shorten(name) {
  // "Calle 10, El Poblado, Medellín, ..." -> primeras 3 partes
  return name.split(",").slice(0, 3).join(",").trim();
}
