# Backend — Madrid Bus App

Proxy en Node.js/Express que gestiona el login contra la API de EMT Madrid y expone
endpoints sencillos para la app móvil.

## Arranque

```bash
cd backend
npm install
cp .env.example .env
# Edita .env y añade tu EMT_CLIENT_ID y EMT_PASS_KEY
npm run dev
```

El servidor arranca por defecto en `http://localhost:3000`.

## Endpoints disponibles

### `GET /api/llegadas/:stopId`
Devuelve las próximas llegadas de autobús a una parada.

```bash
curl http://localhost:3000/api/llegadas/71
```

### `GET /api/paradas/cercanas?lat=40.4168&lon=-3.7038&radio=300`
Devuelve las paradas cercanas a unas coordenadas dadas (radio en metros, opcional).

```bash
curl "http://localhost:3000/api/paradas/cercanas?lat=40.4168&lon=-3.7038"
```

## ⚠️ Notas importantes

- Los nombres exactos de headers/campos del login (`emtClient.js`) están basados en la
  documentación pública de la API, pero **conviene verificarlos** contra la respuesta real
  que te devuelva tu cuenta la primera vez que pruebes el login — la API de EMT ha cambiado
  de formato entre versiones en el pasado.
- Cuando despliegues esto en producción (Render, Railway, Vercel Functions, etc.), añade
  las variables `EMT_CLIENT_ID` y `EMT_PASS_KEY` como secretos del entorno, nunca subas el `.env`.
