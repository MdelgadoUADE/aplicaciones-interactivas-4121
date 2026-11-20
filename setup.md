# Setup del proyecto — Venta de Libros

Guía para levantar el backend, la base de datos y el frontend en local, sin Docker.

## Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **ORM:** Sequelize
- **Base de datos:** PostgreSQL

## Requisitos previos

Se necesita tener las siguientes aplicaciones instaladas

- **Node.js** (v18 o superior) — [nodejs.org](https://nodejs.org)

## Estructura del repositorio

```
proyecto-libros/
├── backend/
│   ├── app.js               # arma la instancia de Express (middlewares + rutas)
│   ├── server.js            # importa app.js y hace app.listen()
│   ├── config/
│   │    └── config.js       # datos de conexión leídos desde .env
│   ├── auth/                # generación/verificación de JWT, hash de contraseñas
│   ├── controllers/         # reciben el request, llaman a services, responden
│   ├── services/            # lógica de negocio (antes de tocar los models)
│   ├── models/              # definiciones de Sequelize
│   ├── migrations/          # generadas por sequelize-cli
│   ├── routes/
│   ├── middlewares/         # validaciones, manejo de errores, auth guard
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
├── frontend/
│   └── (proyecto de React)
└── SETUP.md
```

## 1. Clonar el repositorio

git clone <url-del-repo>
cd proyecto-libros

## 2. Configurar variables de entorno del backend

Dentro de `backend/`, copiá el archivo de enviado de .env y completá tus datos locales:

## 4. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

## 5. Levantar el backend

```bash
cd backend
npm run dev
```

Al arrancar, `server.js` **prueba la conexión a la base antes de escuchar
requests**
El chequeo tiene un timeout de 10 segundos.

## 6. Levantar el frontend

```bash
cd frontend
npm start
```

Por defecto React corre en `http://localhost:3000`. El backend usa CORS con una **whitelist** (`backend/middlewares/cors.middleware.js`): acepta cualquier puerto de `localhost`/`127.0.0.1` y los dominios de producción (`maxilibrerias.com` con y sin `www`)
