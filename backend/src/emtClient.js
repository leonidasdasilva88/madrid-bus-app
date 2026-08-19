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

  const clientId = process.env.EMT_CLIENT_ID;
  const passKey = process.env.EMT_PASS_KEY;

  if (!clientId || !passKey) {
    throw new Error(
      "Faltan EMT_CLIENT_ID o EMT_PASS_KEY. Configura el archivo .env a partir de .env.example"
    );
  }

  const response = await fetch(`${BASE_URL}/mobilitylabs/user/login/`, {
    method: "GET",
    headers: {
      email: clientId, // OJO: algunos endpoints piden "email" e "password" como headers,
      password: passKey, // revisa el nombre exacto de los headers en tu panel de desarrollador
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Login EMT falló: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // La estructura exacta de la respuesta puede variar; ajusta estos campos
  // según lo que devuelva realmente tu cuenta (revisa data.data[0] en consola).
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
    throw new Error(`Error buscando paradas cercanas: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export { getToken, getArrivals, getNearbyStops };
