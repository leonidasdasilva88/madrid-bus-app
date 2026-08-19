# Madrid Bus App 🚌

App para consultar en tiempo real cuánto falta para que llegue el bus a una parada de la EMT de Madrid.

## Estructura del proyecto

```
madrid-bus-app/
├── backend/     → Servidor proxy (Node.js + Express) que habla con la API de EMT
└── app/         → App móvil (React Native + Expo)
```

## ¿Por qué un backend intermedio?

Las credenciales de la API de EMT (`idClient` / `passKey`) NUNCA deben ir dentro del código de la app móvil,
porque cualquiera podría extraerlas descompilando el APK/IPA. El backend las guarda de forma segura como
variables de entorno, gestiona el login/token contra la API de EMT, y expone endpoints simples que la app
puede consumir sin conocer esas credenciales.

## Orden de arranque

1. **Consigue tus credenciales**: regístrate como desarrollador en https://mobilitylabs.emtmadrid.es/
   y solicita acceso a la API. Te darán un `idClient` y un `passKey`.
2. **Levanta el backend** (ver `backend/README.md`).
3. **Arranca la app** apuntando al backend (ver `app/README.md`).

## Próximos pasos sugeridos

- [ ] Registrar credenciales de EMT y probar el login desde el backend
- [ ] Probar el endpoint de llegadas con una parada real (por ejemplo, la parada 71 en Gran Vía)
- [ ] Ejecutar la app en Expo Go en tu móvil
- [ ] Añadir pantalla de favoritos
- [ ] Desplegar el backend (Render/Railway/Vercel) para probar en un dispositivo físico fuera de tu red local
