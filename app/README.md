# App — Madrid Bus App

App móvil en React Native (Expo) que consume el backend proxy.

## Arranque

```bash
cd app
npm install
```

Antes de arrancar, edita `src/api/client.js` y cambia `BASE_URL` por la IP local
de tu ordenador donde corre el backend (no uses "localhost"; ni el emulador ni
un móvil físico lo resuelven al ordenador). Por ejemplo:

```js
const BASE_URL = "http://192.168.1.35:3000";
```

(Para saber tu IP local: `ipconfig getifaddr en0` en Mac, o `ipconfig` en Windows).

Luego:

```bash
npx expo start
```

Escanea el QR con la app **Expo Go** (disponible en App Store / Google Play) desde
tu móvil, conectado a la misma red WiFi que tu ordenador.

## Pantallas incluidas

- **Home** — accesos a las dos formas de buscar parada.
- **SearchStop** — introducir el número de parada manualmente.
- **NearbyStops** — paradas cercanas usando el GPS del móvil.
- **StopDetail** — llegadas en tiempo real de una parada, con auto-refresco cada 20s
  y botón para guardar como favorita.

## Pendiente de implementar

- Pantalla de favoritos (ya está la lógica en `src/utils/favorites.js`, falta la UI)
- Pull-to-refresh en las listas
- Manejo más fino de errores de red / reintentos
- Icono y splash screen personalizados
