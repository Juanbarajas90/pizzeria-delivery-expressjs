# Semana 03 — Pizzería con Delivery (Express 5 + Arquitectura en Capas)

Refactor de la API de la semana 2: mismo dominio, mismo recurso (`products`), pero ahora
organizado en 4 capas en vez de tener todo mezclado en un archivo de rutas.

La semana era sobre arquitectura: separar responsabilidades para que cada capa haga una sola
cosa. El flujo es siempre el mismo: `routes → controllers → services → repositories`.

## Mi dominio

Sigo con **Pizzería con delivery**. El recurso de esta semana es `Product`: `id`, `name`,
`price`, `category`, `available`, `createdAt`.

## Las 4 capas

- **`repositories/products.repository.ts`** — la única capa que toca el array en memoria. Todos
  los métodos son `async` y devuelven copias (nunca la referencia interna), para que nadie fuera
  del repository pueda mutar el store por accidente.
- **`services/products.service.ts`** — la lógica de negocio. No importa nada de Express (sin
  `Request`/`Response`). Aquí vive la paginación: corta el array completo según `page` y `limit`.
- **`controllers/products.controller.ts`** — "thin controllers": cada función hace exactamente 3
  pasos (extraer datos de `req` → llamar al service → responder con `res`). Cero lógica de
  negocio aquí — si el service devuelve `undefined`, el controller decide el 404, pero no decide
  nada más.
- **`routes/products.routes.ts`** — solo conecta URLs con funciones del controller, nada más.

## Contratos de respuesta

- Listado: `{ data: [...], total, page, limit }`
- Un recurso: `{ data: {...} }`
- Error: `{ error: "Not Found", message: "..." }`

## Endpoints

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/v1/products?page=1&limit=10` | Listar con paginación | 200 |
| GET | `/api/v1/products/:id` | Obtener por id | 200 / 404 |
| POST | `/api/v1/products` | Crear | 201 |
| PUT | `/api/v1/products/:id` | Actualizar | 200 / 404 |
| DELETE | `/api/v1/products/:id` | Eliminar | 204 / 404 |

## Cómo correrlo

```bash
cd week-03
pnpm install
cp .env.example .env
pnpm dev
```

## Cómo probarlo

```bash
curl "http://localhost:3000/api/v1/products?page=1&limit=2"

curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{ "name": "Pizza BBQ Pollo", "price": 39000, "category": "pizza-especial", "available": true }'

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

- Arquitectura en 4 capas correctamente separada
- Controllers sin lógica de negocio (solo 3 pasos por función)
- Paginación implementada en el service
- Contratos de respuesta consistentes (`data`, `error`/`message`)
- `pnpm build` sin errores de TypeScript
- Este README

La rúbrica de evaluación de esta semana está en el repo del bootcamp
([ergrato-dev/bc-expressjs](https://github.com/ergrato-dev/bc-expressjs)).
