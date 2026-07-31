# Semana 02 — Pizzería con Delivery (Express 5 + TypeScript)

Este es mi proyecto de la semana 2 del bootcamp bc-expressjs: una API REST con CRUD completo
sobre el catálogo de productos de mi pizzería con delivery (mismo dominio de la semana 1),
usando Express 5 y TypeScript, sin base de datos todavía — todo vive en un array en memoria.

La semana era sobre Express en sí: middlewares, rutas, códigos de estado HTTP y el ciclo
request/response, así que el proyecto es una API bien básica pero completa: los 5 endpoints
CRUD sobre `products`, con validación mínima y manejo de errores.

## Mi dominio

Sigo con **Pizzería con delivery** (`products`, `orders`, `deliveries`, `customers`). Esta
semana el recurso es `Product`: `id`, `name`, `price`, `category`, `available`. Los pedidos,
entregas y clientes llegan en semanas siguientes.

## Qué hice

- `src/types.ts`: interfaz `Product` + `CreateProductDto` / `UpdateProductDto`.
- `src/store.ts`: store en memoria con `getAll`, `getById`, `create`, `update`, `remove`,
  precargado con 3 pizzas para no arrancar con la lista vacía.
- `src/routes/products.routes.ts`: los 5 endpoints CRUD, con validación básica en `POST`
  (exige `name`, `price` y `category`) y 404 cuando el id no existe.
- `src/app.ts`: `express.json()`, un logger que imprime método/ruta/status/duración, un
  `/health`, las rutas de `products`, un handler 404 para rutas no encontradas y un error
  handler global al final.
- `src/server.ts`: arranca el servidor y cierra limpio con `SIGTERM`/`SIGINT`.

## Endpoints

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/v1/products` | Listar todos los productos | 200 |
| GET | `/api/v1/products/:id` | Obtener un producto por id | 200 / 404 |
| POST | `/api/v1/products` | Crear un producto | 201 / 400 |
| PUT | `/api/v1/products/:id` | Actualizar un producto | 200 / 404 |
| DELETE | `/api/v1/products/:id` | Eliminar un producto | 204 / 404 |

## Cómo correrlo

```bash
cd week-02
pnpm install
cp .env.example .env
pnpm dev
```

## Cómo probarlo con curl

```bash
curl http://localhost:3000/api/v1/products

curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{ "name": "Pizza BBQ Pollo", "price": 39000, "category": "pizza-especial" }'

curl http://localhost:3000/api/v1/products/1

curl -X PUT http://localhost:3000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{ "price": 33000 }'

curl -X DELETE http://localhost:3000/api/v1/products/1
```

## Cómo verificar que compila

```bash
pnpm build
```

## Entregables de esta semana

- Servidor funcional (`pnpm dev` levanta en `localhost:3000`)
- Los 5 endpoints CRUD implementados
- Validación básica en `POST`/`PUT`
- Middlewares: `express.json()`, logger, 404 handler, error handler
- `pnpm build` sin errores de TypeScript
- Este README con la descripción del dominio

La rúbrica de evaluación de esta semana está en el repo del bootcamp
([ergrato-dev/bc-expressjs](https://github.com/ergrato-dev/bc-expressjs)).
