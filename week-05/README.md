# Semana 05 — Pizzería con Delivery (PostgreSQL + Prisma)

Quinta semana de Express: la API deja de vivir en un array en memoria y pasa a una base de datos
Postgres real, con Prisma como ORM. También agrego una segunda entidad (`Category`) relacionada
1:N con `Product` — algo que hasta ahora no tenía.

## Mi dominio

**Pizzería con delivery.**

### Entidades

```
Category (1) ──< (N) Product
```

- **Category**: `id` (uuid), `name` (único), `createdAt`, `updatedAt`
- **Product**: `id` (uuid), `name`, `slug` (único), `description`, `price`, `available`,
  `createdAt`, `updatedAt`, `categoryId` (FK opcional a `Category`)

## CORS

Agregué el middleware `cors` porque la app de React Native de la semana 5 (mismo trimestre, otro
repo) consume esta API directamente desde el navegador cuando la corro con `expo start --web` —
sin CORS, el navegador bloquea esas peticiones aunque el backend responda bien. En un dispositivo
móvil real esta restricción no existe (es específica de navegadores), pero lo dejo habilitado
para que cualquiera pueda probar la API desde Thunder Client, Postman o el navegador sin líos.

## Cómo levantar el proyecto

```bash
cd week-05

# 1. Base de datos
docker compose up -d

# 2. Dependencias
pnpm install
npx prisma generate

# 3. Variables de entorno
cp .env.example .env

# 4. Migración + seed
npx prisma migrate dev --name init
npx prisma db seed

# 5. Servidor
pnpm dev
```

**Nota sobre el puerto de Postgres**: uso el `5435` en vez del `5432` por defecto, porque ya
tenía un Postgres nativo instalado en Windows ocupando el 5432 — con el mismo puerto, Prisma se
conectaba al Postgres equivocado y fallaba la autenticación. Si en tu máquina el 5432 está libre,
puedes usarlo sin problema (cambia el puerto en `docker-compose.yml` y en `DATABASE_URL`).

## Log del seed

```
🌱 Iniciando seed...
✅ 4 categorías creadas
✅ 6 productos creados
```

## Endpoints

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/v1/products?page=1&limit=10` | Listado paginado, con `category` incluida | 200 |
| GET | `/api/v1/products/:id` | Detalle con su categoría | 200 / 404 |
| POST | `/api/v1/products` | Crear (valida con Zod) | 201 / 400 / 409 |
| PUT | `/api/v1/products/:id` | Actualizar | 200 / 400 / 404 |
| DELETE | `/api/v1/products/:id` | Eliminar | 204 / 404 |

### Ejemplo — creación

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza BBQ Pollo",
    "slug": "pizza-bbq-pollo",
    "description": "Pollo, salsa BBQ y cebolla morada",
    "price": 39000
  }'
```

```json
{ "data": { "id": "...", "name": "Pizza BBQ Pollo", "slug": "pizza-bbq-pollo", "price": 39000, "categoryId": null, "category": null, ... } }
```

### Ejemplo — listado con relación

```json
{
  "data": [
    { "id": "...", "name": "Pizza Margarita", "category": { "id": "...", "name": "Pizza clásica" }, ... }
  ],
  "total": 6,
  "page": 1,
  "limit": 3
}
```

## Manejo de errores de Prisma

- **`P2002`** (constraint único duplicado, ej. `slug` repetido) → `AppError(409, ...)`
- **`P2025`** (registro no encontrado en `update`/`delete`) → `AppError(404, ...)`
- Ambos capturados en `products.repository.ts` con `PrismaClientKnownRequestError`, y pasan por
  el mismo `errorHandler` global de la semana 4.

Probé los dos casos de verdad: creé un producto con un `slug` ya existente (409), y actualicé/eliminé
un id inexistente (404 en ambos).

## Singleton de Prisma Client

`src/lib/prisma.ts` usa el patrón `globalForPrisma` para que, en desarrollo (con `tsx watch`
reiniciando el proceso en cada cambio), no se acumulen conexiones nuevas a la base de datos cada
vez que el archivo se recarga.

## Cómo verificar que compila

```bash
pnpm build
```

## Entregables de esta semana

- `prisma/migrations/` incluida en el repo (no ignorada)
- Repositorio usando Prisma Client, sin arrays en memoria
- Paginación con `skip`/`take`
- P2025 → 404, P2002 → 409
- Singleton de Prisma Client
- Tipos derivados de Prisma (`Product`, `Category` del cliente generado, sin duplicar interfaces)
- Seed con 6 productos y 4 categorías
- Este README

La rúbrica de evaluación de esta semana está en el repo del bootcamp
([ergrato-dev/bc-expressjs](https://github.com/ergrato-dev/bc-expressjs)).
