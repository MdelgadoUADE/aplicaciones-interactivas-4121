# Setup del proyecto — Venta de Libros

Guía para levantar el backend, la base de datos y el frontend en local, sin Docker.

## Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **ORM:** Sequelize
- **Base de datos:** PostgreSQL

## Requisitos previos

Cada integrante del equipo necesita instalar esto en su máquina:

- **Node.js** (v18 o superior) — [nodejs.org](https://nodejs.org)
- **PostgreSQL** (v14 o superior):
  - Windows/Mac: instalador oficial en [postgresql.org/download](https://www.postgresql.org/download/)
  - Linux (Debian/Ubuntu): `sudo apt install postgresql postgresql-contrib`
  - Durante la instalación en Windows/Mac se define una contraseña para el usuario `postgres`. **Anotala**, la vas a necesitar en el `.env`.
- **Postman** (o Insomnia) para probar los endpoints — [postman.com/downloads](https://www.postman.com/downloads/)
- Un cliente visual para la DB (opcional pero recomendado): **pgAdmin** (viene con el instalador de Postgres) o **DBeaver**.

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
│   ├── seeders/             # datos de prueba 
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

```bash
git clone <url-del-repo>
cd proyecto-libros
```

## 2. Configurar la base de datos local

Abrí una consola de PostgreSQL (`psql -U postgres`) y creá la base para el proyecto (podés usar el usuario `postgres` directo si preferís no complicarte con roles nuevos):

```sql
CREATE DATABASE libreria_db;
```

## 3. Configurar variables de entorno del backend

Dentro de `backend/`, copiá el archivo de ejemplo y completá tus datos locales:

```bash
cd backend
cp .env.example .env
```

Contenido de `.env` (cada uno pone SUS credenciales locales, este archivo **no se sube a Git**):

```
# server.js usa PORT || 3000 por defecto — como React (paso 7) también
# corre en el 3000, hay que fijar acá un puerto distinto para el backend.
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=libreria_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_local

JWT_SECRET=una_clave_secreta_para_los_tokens
JWT_EXPIRES_IN=2h

# Código que hay que compartir con el equipo para poder registrarse como
# admin en POST /auth/register (sin esto, register responde 403).
ADMIN_INVITE_CODE=defini-un-codigo-y-compartilo-con-el-equipo

# Envío de mails (formulario de contacto + recuperación de contraseña).
# Si no tenés una cuenta SMTP real a mano, se puede usar un servicio de
# prueba tipo Mailtrap o Ethereal solo para ver que el flujo funciona.
EMAIL_HOST=smtp.tu-proveedor.com
EMAIL_PORT=587
EMAIL_USER=tu-usuario-smtp
EMAIL_PASSWORD=tu-password-smtp
EMAIL_FROM=Maxilibrerías <no-reply@maxilibrerias.com>
EMAIL_COMERCIO=contacto@maxilibrerias.com

# Usada para armar el link de /reset-password?token=... en el mail de
# recuperación de contraseña (apunta al frontend, no al backend).
FRONTEND_URL=http://localhost:3000
```

> **Importante:** `.env` va en `.gitignore`. Lo que sí se sube al repo es `.env.example`, con las mismas claves pero sin valores reales, para que cada uno sepa qué variables tiene que definir. `DB_DIALECT` no hace falta: `config/config.js` ya tiene `dialect: 'postgres'` fijo en el código, no lo lee del `.env`.

## 4. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

## 5. Crear la base de datos, cargar el esquema y las migraciones

⚠️ **Importante:** en este proyecto el esquema completo (todas las tablas,
foreign keys y checks) está escrito a mano en `backend/bbdd_seed.sql`, **no**
en migraciones de Sequelize — en `migrations/` solo hay una migración
puntual (`add-visitas-producto`, que agrega una columna sobre la tabla
`producto` que `bbdd_seed.sql` ya tiene que haber creado antes). Si corrés
`db:migrate` sin haber cargado `bbdd_seed.sql` primero, va a fallar con un
error tipo `relation "producto" does not exist`. El orden tiene que ser
este, sí o sí:

```bash
cd backend

# 1. Crear la base vacía
npx sequelize-cli db:create

# 2. Cargar el esquema completo (tablas, FKs, checks) desde el script SQL
psql -U postgres -d libreria_db -f bbdd_seed.sql

# 3. Recién ahora correr las migraciones (agrega la columna 'visitas', etc.)
npx sequelize-cli db:migrate

# 4. Cargar los datos de prueba (categorías, comercio, usuario admin, 20+ productos, consultas)
npx sequelize-cli db:seed:all
```

Si en algún momento necesitás resetear todo desde cero, tené en cuenta que
`db:migrate:undo:all` **no** deshace lo que creó `bbdd_seed.sql` (esas
tablas no las creó una migración, así que Sequelize no sabe revertirlas).
Para resetear de verdad, hay que borrar y recrear la base entera:

```bash
npx sequelize-cli db:drop
npx sequelize-cli db:create
psql -U postgres -d libreria_db -f bbdd_seed.sql
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## 6. Levantar el backend

```bash
cd backend
npm run dev
```

Esto debería levantar el servidor Express en `http://localhost:3001` (el puerto que definiste en `PORT` dentro del `.env` — si no lo definís, `server.js` cae por defecto a `3000`, que es el mismo puerto que usa React, así que no lo dejes sin definir), usando `nodemon` para reiniciar automáticamente con cada cambio.

Agregá este script en tu `package.json` si todavía no está:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

## 7. Levantar el frontend

```bash
cd frontend
npm start
```

Por defecto React corre en `http://localhost:3000`. Asegurate de tener `cors` configurado en el backend para aceptar peticiones desde ese origen.

## 8. Probar los endpoints en Postman

- Armá una **Collection** en Postman llamada "Venta de Libros API", con una carpeta por módulo: Auth, Categorías, Productos, Imágenes de producto, Consultas, Comercio, Dashboard. (No hay módulo de "Pedidos" ni de "Libros" — los productos, sean libros o no, se manejan todos bajo `/products`.)
- Creá un **Environment** en Postman con una variable `base_url = http://localhost:3001/api`, así los requests quedan como `{{base_url}}/products` y no hay que reescribir la URL en cada uno.
- Para las rutas protegidas (las que pasan por el middleware de autenticación), guardá el token JWT que devuelve el login en una variable de entorno de Postman (`token`) y usalo en el header `Authorization: Bearer {{token}}` del resto de los requests.
- Exportá la Collection (`.json`) y subila al repo en `backend/postman/` para que todo el equipo pruebe con los mismos requests.

## Notas sobre Git

Como van a coordinarse subiendo cosas a GitHub aunque no sea 100% mejor práctica, tené en cuenta esto para no romperle el entorno a nadie:

- **Nunca subas `node_modules/`** — cada uno lo genera con `npm install`. Tiene que estar en `.gitignore`.
- **Nunca subas `.env`** con contraseñas reales — solo `.env.example` con las claves vacías o con valores de ejemplo.
- Si alguien cambia el modelo de datos, que lo haga con una **migración nueva** de Sequelize (`npx sequelize-cli migration:generate --name nombre-del-cambio`) y no editando una migración vieja que otro ya corrió — si no, cada uno va a tener su base desincronizada de la del resto.
- Antes de hacer `git pull`, correr `npm install` y `npx sequelize-cli db:migrate` por si hay dependencias o migraciones nuevas.

## `.gitignore` sugerido para `backend/`

```
node_modules/
.env
*.log
```