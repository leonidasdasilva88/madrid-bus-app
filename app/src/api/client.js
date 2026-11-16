// client.js
// Punto único de configuración para hablar con nuestro backend proxy.
// En desarrollo, usa la IP local de tu ordenador (no "localhost", porque el
// móvil físico o el emulador no lo resuelven igual). Ejemplo: "http://192.168.1.35:3000"

const BASE_URL = "http://TU_IP_LOCAL:3000"; // TODO: cambia esto por la IP de tu backend

// Evita que la app se quede esperando para siempre si el servidor no responde.
// El plan gratuito de Render puede tardar ~30-50 s en "despertar", por eso 45 s.
async function fetchWithTimeout(url, ms = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("El servidor tarda demasiado en responder. Inténtalo de nuevo.");
    }
    throw new Error("No hay conexión con el servidor. Revisa tu conexión a internet.");
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchArrivals(stopId) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/llegadas/${stopId}`);
  if (!res.ok) throw new Error("No se pudo obtener las llegadas");
  return res.json();
}

export async function fetchNearbyStops(lat, lon, radio = 300) {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/paradas/cercanas?lat=${lat}&lon=${lon}&radio=${radio}`
  );
  if (!res.ok) throw new Error("No se pudieron obtener las paradas cercanas");
  return res.json();
}
