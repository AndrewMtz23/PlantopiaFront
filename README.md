# Plantopia Frontend

Frontend de Plantopia para la version **PostgreSQL + Prisma** del backend. Esta rama (`PlantopiaWithPostgreSQL`) apunta al backend migrado y conserva la version original en `main`.

## Stack

- React
- React Router
- Axios
- React Bootstrap
- FontAwesome
- Leaflet / React Leaflet
- PayPal button integration

## Variables De Entorno

Crea un archivo `.env` en la raiz del frontend usando `.env.example` como base:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_PAYPAL_CLIENT_ID=replace-with-paypal-client-id
REACT_APP_GOOGLE_MAPS_API_KEY=replace-with-google-maps-browser-key
```

Notas:

- `REACT_APP_API_URL` es obligatoria. En local normalmente apunta a `http://localhost:3001`.
- `REACT_APP_PAYPAL_CLIENT_ID` habilita el boton de PayPal en checkout.
- `REACT_APP_GOOGLE_MAPS_API_KEY` solo se usa en componentes legacy con Google Maps. Los mapas nuevos usan Leaflet/OpenStreetMap.
- Las variables de React se leen al iniciar el dev server; reinicia `npm start` despues de cambiarlas.

## Instalacion Local

```bash
npm install
npm start
```

## Backend Esperado

Esta rama espera el backend de Plantopia en su rama:

```text
PlantopiaWithPostgreSQL
```

## Rama

- `main`: version original.
- `PlantopiaWithPostgreSQL`: version conectada al backend PostgreSQL + Prisma.
