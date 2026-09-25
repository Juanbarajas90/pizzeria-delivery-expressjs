# Semana 08 — Pizzería con Delivery (Autorización y seguridad)

Octava semana: la API ya sabe quién es cada usuario (semana 07); ahora decide **qué puede
hacer** cada uno y se protege de ataques comunes: roles (RBAC), Helmet, CORS con lista blanca,
rate limiting y sanitización de entradas.

## Mi dominio

**Pizzería con delivery.** El recurso principal es `Product`:

- `code` (único, formato `PZ-001`), `name`, `description` (opcional), `price`
- `category`: `pizza`, `drink`, `dessert` o `side`
- `prepTimeMinutes`, `active`
- `createdBy`: el usuario que lo creó, para saber quién es el dueño

## Cómo levantar el proyecto

```bash
cd week-08

# 1. Base de datos (MongoDB en el puerto 27020)
docker compose up -d

# 2. Dependencias
pnpm install

# 3. Variables de entorno (cambia los dos secretos JWT por valores propios)
cp .env.example .env

# 4. Servidor
pnpm dev
```

Al arrancar con la base vacía se crean dos usuarios y cuatro productos de ejemplo:

| Usuario | Contraseña | Rol |
| ------- | ---------- | --- |
| `user@test.com` | `User1234!` | `user` |
| `admin@test.com` | `Admin1234!` | `admin` |

## Roles y permisos

Decidí que el **menú es público**: cualquier persona puede ver los productos sin cuenta.

| Acción | Público | `user` | `admin` |
| ------ | :-----: | :----: | :-----: |
| Ver productos | ✅ | ✅ | ✅ |
| Crear producto | ❌ (401) | ✅ | ✅ |
| Editar producto | ❌ (401) | Solo los suyos (403 si no) | ✅ Cualquiera |
| Eliminar producto | ❌ (401) | ❌ (403) | ✅ |

## Endpoints

| Método | Ruta | Acceso |
| ------ | ---- | ------ |
| GET | `/api/v1/health` | Público |
| POST | `/api/v1/auth/register` | Público (límite 5 / 15 min) |
| POST | `/api/v1/auth/login` | Público (límite 5 / 15 min) |
| POST | `/api/v1/auth/refresh` | Público (usa la cookie de refresh) |
| POST | `/api/v1/auth/logout` | Autenticado |
| GET | `/api/v1/auth/me` | Autenticado |
| GET | `/api/v1/users/dashboard` | Autenticado |
| GET | `/api/v1/products` | Público |
| GET | `/api/v1/products/:id` | Público |
| POST | `/api/v1/products` | `user` o `admin` |
| PATCH | `/api/v1/products/:id` | Dueño o `admin` |
| DELETE | `/api/v1/products/:id` | Solo `admin` |

El access token viaja en el header `Authorization: Bearer <token>` y el refresh token en una
cookie `httpOnly`.

Para la app móvil de React Native (que no maneja bien cookies `httpOnly`), `login` y `refresh`
también devuelven el `refreshToken` en el body, y `/auth/refresh` lo acepta en el body cuando no
llega la cookie. El navegador sigue usando la cookie.

## Capas de seguridad

- **Helmet**: cabeceras como `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`,
  `Content-Security-Policy` y `X-Frame-Options` en todas las respuestas.
- **Rate limiting**: 100 peticiones / 15 min en toda la API y 5 / 15 min en login y registro.
  Al pasarse responde 429. Los headers `RateLimit-Limit`, `RateLimit-Remaining` y
  `RateLimit-Reset` se ven en cada respuesta.
- **CORS con lista blanca**: solo `localhost:5173`, `localhost:3001` y `localhost:8081` (Expo
  web). Cualquier otro origen recibe 403.
- **Sanitización**: se eliminan las claves que empiezan con `$` o contienen `.` en el body y en
  el query, para que un operador de Mongo como `{ "$gt": "" }` no llegue a la consulta. Además
  Zod exige que el email sea un string.
- **XSS**: los textos rechazan `<` y `>`.
- **Errores**: nunca se devuelve el stack trace; solo un mensaje. El detalle queda en el log
  del servidor.

## Cambios respecto al starter (bugs que encontré)

1. **El servidor no arrancaba.** `app.options('*', ...)` lanza un error de path-to-regexp en
   Express 5 (`*` ya no es una ruta válida). Lo quité: `app.use(cors(...))` ya responde los
   preflight.
2. **`express-mongo-sanitize` devolvía 500 en todas las peticiones**, incluso `/health`. Con
   Express 5 `req.query` es de solo lectura y la librería intenta asignarlo. Lo reemplacé por
   un middleware propio (`src/middlewares/sanitize.ts`) que limpia el body y redefine
   `req.query`.
3. **El refresh token se guardaba en claro y no se comparaba al renovar**, así que un token
   robado nunca dejaba de servir. Ahora se guarda su hash SHA-256 y `/auth/refresh` exige que
   coincida (rotación). Usé SHA-256 y no bcrypt porque bcrypt solo lee los primeros 72 bytes
   del texto, y todos los JWT de un usuario comparten ese inicio.
4. **El `errorHandler` devolvía 500 con un body inválido** (Zod), un id mal formado (`CastError`)
   o un `code` repetido (11000). Ahora responde 400, 400 y 409.
5. **La verificación de dueño estaba comentada** en `update`; sin ella cualquier usuario podía
   editar productos ajenos. Está activa y responde 403.
6. **Un origen CORS bloqueado daba 500**; ahora da 403 con un mensaje claro.
7. **`RateLimit-Remaining` no aparecía**: con `standardHeaders: 'draft-7'` el límite sale en un
   solo header combinado (`RateLimit`). Pasé a `draft-6`, que expone los tres headers separados.
8. **`bcrypt` no compilaba con pnpm 10** (bloquea los scripts de instalación): agregué
   `pnpm.onlyBuiltDependencies`. También desactivé `declaration` en `tsconfig.json` (error
   TS2742 con pnpm) y `pnpm start` usa `tsx` para no depender de compilar antes.

## Cómo lo probé (curl)

- **Helmet**: `X-Content-Type-Options: nosniff`, HSTS, CSP y `X-Frame-Options` presentes.
- **Público / 401**: `GET /products` sin token → 200; `POST /products` sin token → 401.
- **RBAC**: `user` crea → 201; `user` borra → 403; `admin` borra → 200; otro usuario edita un
  producto ajeno → 403; `admin` edita el producto de otro → 200; el dueño edita el suyo → 200.
- **Validación**: body inválido → 400; código repetido → 409; id mal formado → 400.
- **NoSQL injection**: `{"email":{"$gt":""}}` en login → 400; `?code[$ne]=x` y `$set` en el body
  no rompen nada.
- **Rate limit**: a la sexta petición a `/auth/*` → 429 con `RateLimit-Remaining: 0`.
- **CORS**: `Origin: http://localhost:8081` → permitido; `Origin: http://evil.com` → 403.
- **Refresh**: renueva y devuelve un access token nuevo; reutilizar el refresh anterior → 401;
  sin cookie → 401.
