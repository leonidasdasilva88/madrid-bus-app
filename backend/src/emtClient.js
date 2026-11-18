// emtClient.js
// Encapsula la comunicación con la API oficial de EMT Madrid (Mobility Labs):
// - Gestiona el login y el token de acceso (se cachea y se renueva cuando caduca).
// - Expone funciones sencillas para buscar paradas cercanas y consultar llegadas.
//
// Documentación de referencia: https://apidocs.emtmadrid.es/

const BASE_URL = "https://openapi.emtmadrid.es/v2";


// fetch con límite de tiempo y un reintento si la conexión falla o se cuelga
// (la API de EMT a veces corta o no responde a conexiones reutilizadas).
async function emtFetch(url, options = {}, ms = 15000) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await fetch(url, { ...options, signal: AbortSignal.timeout(ms) });
    } catch (err) {
      console.log(`emtFetch intento ${attempt} falló:`, err.name, err.message);
      if (attempt === 2) throw err;
    }
  }
}

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

  const response = await emtFetch(`${BASE_URL}/mobilitylabs/user/login/`, {
    method: "GET",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.log("Login EMT falló, cuerpo de la respuesta:", errorBody);
    throw new Error(`Login EMT falló: ${response.status} ${response.statusText} — ${errorBody}`);
  }

  const data = await response.json();

  console.log("Respuesta login EMT:", JSON.stringify(data));

  const accessToken = data?.data?.[0]?.accessToken;
  if (!accessToken) {
    // Solo aquí es un fallo real: hay respuesta pero sin token utilizable
    // (por ejemplo code 84 = credenciales/app no válidas o no aprobada).
    throw new Error(`Login EMT no devolvió accessToken. code=${data?.code} description=${data?.description}`);
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

  const response = await emtFetch(
    `https://openapi.emtmadrid.es/v3/transport/busemtmad/stops/${stopId}/arrives/all/`,
    {
      method: "POST",
      headers: {
        accessToken: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stopId,
        cultureInfo: "ES",
        Text_StopRequired_YN: "N",
        Text_EstimationsRequired_YN: "Y",
        Text_IncidencesRequired_YN: "N",
        DateTime_UTC: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error consultando llegadas: ${response.status} ${response.statusText} — ${errorBody}`);
  }

  const data = await response.json();
  console.log("Respuesta arrives EMT:", JSON.stringify(data));
  return data;
}

/**
 * Busca paradas cercanas a unas coordenadas dadas.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radius - radio de búsqueda en metros (por defecto 300m)
 */
async function getNearbyStops(lat, lon, radius = 300) {
  const token = await getToken();

  // Endpoint de la API EMT: paradas alrededor de un punto (OJO: "arroundxy" va así, con doble r).
  // El orden en la URL es longitud, latitud, radio.
  const response = await emtFetch(
    `${BASE_URL}/transport/busemtmad/stops/arroundxy/${lon}/${lat}/${radius}/`,
    {
      method: "GET",
      headers: {
        accessToken: token,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.log("Paradas cercanas EMT falló:", response.status, errorBody);
    throw new Error(`Error buscando paradas cercanas: ${response.status} ${response.statusText} — ${errorBody}`);
  }

  const data = await response.json();
  // Log temporal para confirmar la forma real de la respuesta
  console.log("Respuesta paradas cercanas EMT:", JSON.stringify(data).slice(0, 1500));
  return data;
}

export { getToken, getArrivals, getNearbyStops };
