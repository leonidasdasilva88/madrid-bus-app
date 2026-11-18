// client.js
// Punto único de configuración para hablar con nuestro backend en Render.

const BASE_URL = "https://madrid-bus-backend.onrender.com";

// En Android, fetch no tiene límite de espera por defecto: si el móvil reutiliza una
// conexión que el servidor ya cerró, la petición puede quedarse colgada minutos.
// Solución: límite corto por intento, "Connection: close" para no reutilizar
// conexiones viejas, y reintentos (el último intento espera más por si Render
// está "despertando", lo que puede tardar ~30-50 s en el plan gratuito).
const ATTEMPT_TIMEOUTS_MS = [10000, 10000, 40000];

async function fetchWithRetry(url) {
  let lastError;
  for (const ms of ATTEMPT_TIMEOUTS_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Connection: "close", "Cache-Control": "no-cache" },
      });
      return res;
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
  }
  if (lastError?.name === "AbortError") {
    throw new Error("El servidor tarda demasiado en responder. Inténtalo de nuevo.");
  }
  throw new Error("No hay conexión con el servidor. Revisa tu conexión a internet.");
}

export async function fetchArrivals(stopId) {
  const res = await fetchWithRetry(`${BASE_URL}/api/llegadas/${stopId}`);
  if (!res.ok) throw new Error("No se pudo obtener las llegadas");
  return res.json();
}

export async function fetchNearbyStops(lat, lon, radio = 300) {
  const res = await fetchWithRetry(
    `${BASE_URL}/api/paradas/cercanas?lat=${lat}&lon=${lon}&radio=${radio}`
  );
  if (!res.ok) throw new Error("No se pudieron obtener las paradas cercanas");
  return res.json();
}
