// client.js
// Punto único de configuración para hablar con nuestro backend proxy.
// En desarrollo, usa la IP local de tu ordenador (no "localhost", porque el
// móvil físico o el emulador no lo resuelven igual). Ejemplo: "http://192.168.1.35:3000"

const BASE_URL = "https://madrid-bus-backend.onrender.com"; // TODO: cambia esto por la IP de tu backend

export async function fetchArrivals(stopId) {
  const res = await fetch(`${BASE_URL}/api/llegadas/${stopId}`);
  if (!res.ok) throw new Error("No se pudo obtener las llegadas");
  return res.json();
}

export async function fetchNearbyStops(lat, lon, radio = 300) {
  const res = await fetch(
    `${BASE_URL}/api/paradas/cercanas?lat=${lat}&lon=${lon}&radio=${radio}`
  );
  if (!res.ok) throw new Error("No se pudo obtener paradas cercanas");
  return res.json();
}
