// emtClient.js
// Encapsula la comunicación con la API oficial de EMT Madrid (Mobility Labs):
// - Gestiona el login y el token de acceso (se cachea y se renueva cuando caduca).
// - Expone funciones sencillas para buscar paradas cercanas y consultar llegadas.
//
// Documentación de referencia: https://apidocs.emtmadrid.es/

const BASE_URL = "https://openapi.emtmadrid.es/v2";

let cachedToken = null;
let tokenExpiresAt = 0; // timestamp en ms

/**
 * Hace login contra la API de EMT y devuelve un token válido.
 * Reutiliza el token en caché mientras no haya caducado.
 */
async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  // Login con app registrada (X-ClientId/passKey): solo funciona una vez que
  // Mobility Labs aprueba tu aplicación. Mientras tanto, usamos el login
  // genérico con el email/contraseña de tu cuenta de desarrollador, que
  // funciona desde el momento en que confirmas el email (con cuota más baja).
  const clientId = process.env.EMT_CLIENT_ID;
  const passKey = process.env.EMT_PASS_KEY;
  const email = process.env.EMT_EMAIL;
  const password = process.env.EMT_PASSWORD;

  let headers;
  if (clientId && passKey) {
    headers = { "X-ClientId": clientId, passKey: passKey };
  } else if (email && password) {
    headers = { email, password };
  } else {
    throw new Error(
      "Faltan credenciales de EMT. Configura EMT_EMAIL/EMT_PASSWORD (o EMT_CLIENT_ID/EMT_PASS_KEY una vez aprobada tu app) en .env"
    );
  }

  const response = await fetch(`${BASE_URL}/mobilitylabs/user/login/`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Login EMT falló: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Log temporal de depuración: mira los logs de Render tras la próxima petición
  // para confirmar la forma exacta de la respuesta, y luego puedes borrar esta línea.
  console.log("Respuesta login EMT:", JSON.stringify(data));

  if (data?.code && data.code !== "00") {
    throw new Error(`Login EMT devolvió error. code=${data.code} description=${data.description}`);
  }

  const accessToken = data?.data?.[0]?.accessToken;
  if (!accessToken) {
    throw new Error("La respuesta de login no incluyó un accessToken. Revisa el payload.");
  }

  cachedToken = accessToken;
  // Los tokens de EMT suelen durar ~1h; renovamos un poco antes por seguridad.
  tokenExpiresAt = now + 55 * 60 * 1000;

  return cachedToken;
}

/**
 * Consulta las próximas llegadas de autobús a una parada concreta.
 * @param {string} stopId - Número de parada de la EMT.
 */
async function getArrivals(stopId) {
  const token = await getToken();

  const response = await fetch(
    `${BASE_URL}/transport/busemtmad/stops/${stopId}/arrives/`,
    {
      method: "POST",
      headers: {
        accessToken: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stopId,
        // Puedes filtrar por línea concreta si quieres, o dejarlo vacío para todas
        cultureInfo: "ES",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error consultando llegadas: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca paradas cercanas a unas coordenadas dadas.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radius - radio de búsqueda en metros (por defecto 300m)
 */
async function getNearbyStops(lat, lon, radius = 300) {
  const token = await getToken();

  const response = await fetch(
    `${BASE_URL}/geo/geolocate/stops/`,
    {
      method: "POST",
      headers: {
        accessToken: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        radius,
      }),
    }
  );

  if (!response.ok) {
  const errorBody = await response.text();
  console.log("Login EMT falló, cuerpo de la respuesta:", errorBody);
  throw new Error(`Login EMT falló: ${response.status} ${response.statusText} — ${errorBody}`);
}

  return response.json();
}

export { getToken, getArrivals, getNearbyStops };