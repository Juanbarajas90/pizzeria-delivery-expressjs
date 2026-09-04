# Semana 06 — Pizzería con Delivery (MongoDB + Mongoose)

Sexta semana: cambio de base de datos. La semana pasada era PostgreSQL con Prisma (relacional,
con migraciones); esta semana es MongoDB con Mongoose (documentos, sin migraciones — el schema
vive en el código).

## Mi dominio

**Pizzería con delivery.** Misma relación de siempre: `Category` (1) → `Product` (N).

- **Category**: `name` (único), `description` (opcional)
- **Product**: `name`, `description`, `price`, `available`, `prepTimeMinutes` (tiempo de
  preparación en minutos), `category` (referencia a `Category`)

## Cómo levantar el proyecto

```bash
cd week-06

# 1. Base de datos
docker compose up -d

# 2. Dependencias
pnpm install

# 3. Variables de entorno
cp .env.example .env

# 4. Seed
pnpm seed

# 5. Servidor
pnpm dev
```

**Nota sobre el puerto**: uso `27018` en vez del `27017` por defecto, para no chocar con otro
Mongo que pudiera estar corriendo en la máquina (aprendí esta lección con Postgres en la semana
5 — mejor usar un puerto propio desde el principio).

## Un bug real que encontré (y por qué `instanceof` no siempre funciona)

Mi primer intento para detectar el error de nombre duplicado (código Mongo `11000`) fue:

```ts
import { MongoServerError } from 'mongodb';
// ...
if (err instanceof MongoServerError) { ... }
```

Al probarlo, el 409 nunca se disparaba — todo caía en el 500 genérico. La causa: **Mongoose trae
su propia copia interna del driver `mongodb`**, y puede ser una versión distinta a la que yo
tenía pineada en mi propio `package.json` (me pasó exactamente eso: mongoose usaba
`mongodb@7.1.1` internamente, yo tenía `mongodb@6.10.0`). Son dos clases `MongoServerError`
con el mismo nombre pero distinta identidad — `instanceof` compara identidad de clase, así que
falla en silencio.

La solución: revisar la propiedad `code` del error directamente, sin `instanceof`:

```ts
function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000;
}
```

Con eso ya no importa qué versión del driver esté usando mongoose por dentro. También quité la
dependencia explícita de `mongodb` de mi `package.json`, porque ya no la necesito para nada.

## Manejo de errores de Mongoose

- **`CastError`** (id con formato inválido) → `AppError(400, 'ID inválido')`
- **`11000`** (índice único duplicado, ej. nombre de categoría repetido) → `AppError(409, ...)`
- **`null`** devuelto por `findById`/`findByIdAndUpdate`/`findByIdAndDelete` → `AppError(404, ...)`
- Errores de validación de Zod → 400 con la lista de `issues` (le agregué esta rama al
  `errorHandler` que traía el starter, porque solo distinguía `AppError` de todo lo demás — sin
  esto, un body inválido se iba como 500).

Probé los tres casos reales: un id con formato inválido (400), un nombre de categoría repetido
(409), y un id válido pero inexistente (404).

## Endpoints

### `/api/v1/categories` (secundaria)

| Método | Ruta | Status |
|--------|------|--------|
| GET | `/api/v1/categories` | 200 |
| GET | `/api/v1/categories/:id` | 200 / 400 / 404 |
| POST | `/api/v1/categories` | 201 / 400 / 409 |
| PUT | `/api/v1/categories/:id` | 200 / 400 / 404 / 409 |
| DELETE | `/api/v1/categories/:id` | 204 / 400 / 404 |

### `/api/v1/products` (principal, con `populate`)

| Método | Ruta | Status |
|--------|------|--------|
| GET | `/api/v1/products?page=1&limit=10` | 200 |
| GET | `/api/v1/products/:id` | 200 / 400 / 404 |
| POST | `/api/v1/products` | 201 / 400 / 409 |
| PUT | `/api/v1/products/:id` | 200 / 400 / 404 / 409 |
| DELETE | `/api/v1/products/:id` | 204 / 400 / 404 |

`GET /products` siempre trae `category` como objeto completo (no solo el id), gracias a
`.populate('category')`.

## Cómo verificar que compila

```bash
pnpm build
```

## Entregables de esta semana

- Dos entidades relacionadas (`Category` 1:N `Product`) con `populate()`
- Paginación con `skip`/`limit` + `countDocuments`
- Errores `11000` → 409, `CastError` → 400, `null` → 404
- Seed con 4 categorías y 6 productos
- `connectDB()` una sola vez, antes de `app.listen()`
- Este README

La rúbrica de evaluación de esta semana está en el repo del bootcamp
([ergrato-dev/bc-expressjs](https://github.com/ergrato-dev/bc-expressjs)).
