# Semana 09 — Pizzería con Delivery (Testing de la API)

Novena semana: no se agrega funcionalidad nueva, se prueba la que ya hay. La API de la pizzería
(usuarios + productos) queda cubierta con tests unitarios y de integración con Jest, Supertest y
MongoDB Memory Server.

## Mi dominio

**Pizzería con delivery.** El recurso principal es `Product`: `name`, `description`, `price`,
`category` (`pizza`, `drink`, `dessert`, `side`), `available`, `prepTimeMinutes` y `createdBy`.

Reglas de negocio que se prueban:

- Dos productos no pueden tener el mismo nombre (409).
- Solo el creador de un producto o un admin puede modificarlo o eliminarlo (403 para los demás).
- El menú (`GET`) es público; crear, editar y eliminar requieren token.

## Cómo correr los tests

```bash
cd week-09
pnpm install
pnpm test              # todos los tests
pnpm test:watch        # modo watch
pnpm test:coverage     # con reporte de cobertura (coverage/index.html)
```

No hace falta tener MongoDB ni Docker: los tests de integración levantan una base en memoria.
La primera vez `mongodb-memory-server` descarga el binario de `mongod`, así que necesita internet.

Para correr la API normal necesitas un MongoDB y un `.env` con `MONGODB_URI` y los secretos JWT;
`pnpm dev` la levanta.

## Qué hay en `src/__tests__/`

| Archivo | Tipo | Qué prueba |
| ------- | ---- | ---------- |
| `products.service.test.ts` | Unitario | El servicio de productos con el repositorio mockeado (`jest.mock`): listar, buscar, crear, actualizar y eliminar, incluyendo 404, 403 y 409 |
| `auth.service.test.ts` | Unitario | Registro, login y `getMe` con el repositorio y `bcrypt` mockeados |
| `middlewares.test.ts` | Unitario | `authenticate`, `authorize`, `errorHandler` y `utils/jwt` |
| `products.routes.test.ts` | Integración | Las 5 rutas de productos contra una base real en memoria: 200, 201, 204, 401, 403, 404, 409 y 422 |
| `auth.routes.test.ts` | Integración | Registro, login, `/me` y `/health` |
| `helpers/auth.ts` | Ayuda | Crea usuarios y tokens (el admin se inserta directo en la base, porque el registro siempre da rol `user`) |

Cada test parte de un estado limpio: `clearMocks: true` en la configuración de Jest y limpieza de
colecciones entre tests de integración.

## Resultado

64 tests pasan. Cobertura: 100 % de statements, funciones y líneas, y 83 % de ramas (los umbrales
son 80 / 80 / 80 / 70 y `pnpm test:coverage` los cumple).

## Bugs que encontré (algunos los encontraron los propios tests)

1. **`/auth/register` devolvía el hash de la contraseña.** Lo destapó un test de integración.
   `createUser` devolvía un documento de Mongoose y el servicio le hacía un spread para quitar el
   `password`; pero un documento no es un objeto plano, así que la respuesta traía los campos
   internos de Mongoose, incluida la propiedad `_doc` con la contraseña hasheada, y no traía
   `email` ni `role` en el nivel superior. Ahora el repositorio devuelve `toObject()`.
2. **Los errores 422 no decían qué campo falló.** Los schemas validan `{ body: {...} }`, así que
   `flatten().fieldErrors` metía todos los mensajes bajo una clave `body`. Ahora se agrupan por
   campo: `{ "price": ["Too small: ..."] }`.
3. **Jest no encontraba ningún módulo.** El código importa con extensión (`'./app.js'`) y Jest
   busca ese archivo literal, que no existe (solo está el `.ts`). Agregué `moduleNameMapper` en
   `jest.config.ts`.
4. **`jest.config.ts` no se podía leer** porque Jest necesita `ts-node` para configuraciones en
   TypeScript y el starter no lo declaraba (llegaba de rebote con `ts-node-dev`). Lo agregué como
   dependencia de desarrollo.
5. **`.env.test` no se cargaba nunca.** Agregué un `setupFiles` que lo lee antes de importar
   `config/env.ts`, para que los tests usen sus propios secretos JWT.
6. **`tsc` fallaba** en `auth.service.ts` (`TS2352`, conversión de `IUser` a `Record`): ahora pasa
   por `unknown`.
7. **`pnpm start`** usaba `node dist/server.js`, que no existe sin compilar antes; ahora usa
   `tsx` (y `pnpm dev` también, en lugar de `ts-node-dev`, que ya no hace falta). Además `bcrypt`
   necesita que pnpm 10 le permita correr su script de instalación
   (`pnpm.onlyBuiltDependencies`), si no falla al cargarse.
