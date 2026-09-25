# Semana 07 — Pizzería con Delivery (Autenticación JWT)

Séptima semana: la API de la pizzería ahora tiene usuarios. Cualquiera puede registrarse e
iniciar sesión, y el recurso principal (los productos de la carta) queda protegido: solo se
puede tocar con una sesión válida.

## Mi dominio

**Pizzería con delivery.** El recurso protegido es `Product`:

- `name`, `description` (opcional), `price`
- `category`: `pizza`, `drink`, `dessert` o `side`
- `available`, `prepTimeMinutes`
- `createdBy`: el usuario que lo creó (sale del token, no del body)

## Cómo levantar el proyecto

```bash
cd week-07

# 1. Base de datos (MongoDB en el puerto 27019)
docker compose up -d

# 2. Dependencias
pnpm install

# 3. Variables de entorno
cp .env.example .env
# Cambia los dos secretos JWT por valores propios y distintos entre sí:
#   openssl rand -base64 64

# 4. Servidor
pnpm dev
```

`pnpm start` también funciona sin compilar antes (usa `tsx`).

## Cómo funciona la autenticación

- **Contraseñas**: se guardan con `bcrypt` (10 rondas). El campo `password` tiene
  `select: false`, así que nunca sale en una consulta ni en una respuesta.
- **Access token**: JWT que dura 15 minutos, viaja en la cookie `accessToken`.
- **Refresh token**: JWT firmado con **otro secreto**, dura 7 días, viaja en la cookie
  `refreshToken`, que solo se envía a `/api/v1/auth`.
- **Cookies**: `httpOnly`, `sameSite=lax` y `secure` cuando `NODE_ENV=production`.
- **Rotación**: cada `/auth/refresh` entrega un par de tokens nuevo e invalida el anterior.
  Si alguien reutiliza un refresh token viejo recibe 401.
- **Login**: email inexistente y contraseña incorrecta devuelven el mismo mensaje
  (`Credenciales inválidas`) para no revelar qué emails están registrados.
- **Logout**: borra el refresh token guardado en la base de datos y limpia las cookies.

## Endpoints

| Método | Ruta | Protegida | Descripción |
| ------ | ---- | --------- | ----------- |
| POST | `/api/v1/auth/register` | No | Crea un usuario |
| POST | `/api/v1/auth/login` | No | Inicia sesión (pone las cookies) |
| POST | `/api/v1/auth/refresh` | No (usa la cookie de refresh) | Renueva los tokens |
| GET | `/api/v1/auth/me` | Sí | Datos del usuario actual |
| POST | `/api/v1/auth/logout` | Sí | Cierra la sesión |
| GET | `/api/v1/products` | Sí | Lista los productos |
| GET | `/api/v1/products/:id` | Sí | Un producto |
| POST | `/api/v1/products` | Sí | Crea un producto |
| PATCH | `/api/v1/products/:id` | Sí | Actualiza parcialmente |
| DELETE | `/api/v1/products/:id` | Sí | Elimina (204) |

## Cambios respecto al starter (bugs que encontré)

1. **El refresh token se guardaba con bcrypt y la rotación no invalidaba el token viejo.**
   bcrypt solo lee los primeros 72 bytes de lo que le pases. Un JWT empieza con el header y el
   inicio del payload (`{"sub":"<id>"`), y eso es idéntico en todos los refresh tokens del
   mismo usuario; lo que cambia (`iat`, `exp`) queda después del byte 72. Resultado: el token
   viejo seguía pasando la comparación después de rotar. Lo probé reproduciendo el caso y lo
   arreglé guardando un hash SHA-256 del token (`crypto` de Node), que sí lee todo el string.
   Después del cambio, reutilizar el token viejo da 401.
2. **`bcrypt` no funcionaba tras `pnpm install`.** pnpm 10 bloquea los scripts de compilación
   por defecto y `bcrypt` necesita el suyo, así que `require('bcrypt')` fallaba. Agregué
   `pnpm.onlyBuiltDependencies` en `package.json`.
3. **El `errorHandler` devolvía 500 con un body inválido.** Solo distinguía `AppError`. Le
   agregué ramas para `ZodError` (400 con la lista de `issues`), `CastError` de Mongoose
   (400, id inválido) y clave duplicada `11000` (409).
4. **`tsc` fallaba** con `TS2742` porque `declaration: true` pide nombrar tipos internos de
   `@types/express-serve-static-core`. Una API no publica tipos, así que lo desactivé.
5. **`pnpm start`** apuntaba a `node dist/server.js`, que no existe sin compilar. Ahora usa
   `tsx src/server.ts`.

## Cómo lo probé (curl)

Todo el flujo, con las cookies guardadas en un archivo (`-c` / `-b`):

- Producto sin cookie → 401.
- Registro con datos inválidos → 400; email repetido → 409.
- Login con contraseña mala y con email inexistente → 401 con el mismo mensaje.
- Login correcto → dos cookies `HttpOnly`; `GET /auth/me` → 200.
- CRUD completo de productos con sesión: 201, 200, 200, 204; id mal formado → 400; id
  inexistente → 404; body inválido → 400.
- `POST /auth/refresh` dos veces seguidas → 200 ambas; reutilizar el token anterior → 401.
- Logout y luego refresh → 401.
