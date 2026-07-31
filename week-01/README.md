# Semana 01 — Pizzería con Delivery (Node.js + TypeScript)

Este es mi proyecto de la semana 1 del bootcamp bc-expressjs. Es una herramienta de línea de
comandos en Node.js + TypeScript que lee el catálogo de productos de mi pizzería con delivery
(el dominio que me tocó), calcula un resumen y lo guarda en un reporte.

La idea de la semana era practicar el runtime de Node (event loop, ESM vs CommonJS), TypeScript
estricto y async/await con manejo de errores, así que el proyecto lo armé como un mini
procesador de datos: lee un JSON, filtra, calcula estadísticas y escribe otro JSON con el
resultado.

## Mi dominio

Me tocó **Pizzería con delivery**, con las entidades `products`, `orders`, `deliveries` y
`customers`. Esta semana solo trabajo con `products` (el catálogo del menú); los pedidos, las
entregas y los clientes los voy agregando en las próximas semanas, cuando el curso meta rutas y
persistencia con Express.

## Qué hice

- `Product` (`src/types.ts`): `id`, `name`, `category`, `price`, `stock`, `active` — pensado para
  representar pizzas, bebidas y complementos del menú.
- `data/products.json`: 12 productos de ejemplo (pizzas clásicas, especiales, bebidas y
  complementos), con un par marcados como `active: false` para poder probar el filtro de
  inactivos.
- `src/reader.ts`: lee el catálogo con `fs/promises`, y si el archivo no existe lanza un error
  descriptivo en vez de dejar que el programa explote sin explicación.
- `src/processor.ts`: filtra por categoría (`filterByCategory`) y calcula el resumen
  (`calculateSummary`) — total, activos/inactivos, precio promedio, más caro, más barato y
  categorías disponibles.
- `src/writer.ts`: escribe el reporte final en `output/report.json`.
- `src/index.ts`: junta todo — parsea el argumento `--category`, corre el flujo completo y
  atrapa cualquier error con `try/catch` (si la categoría no existe, avisa cuáles sí hay y sale
  con `process.exit(1)`).

## Cómo correrlo

```bash
cd week-01
pnpm install
pnpm dev
```

Con filtro por categoría:

```bash
pnpm dev -- --category pizza-clasica
```

Categorías disponibles en mi catálogo: `pizza-clasica`, `pizza-especial`, `bebida`,
`complemento`.

## Cómo verificar que compila

```bash
pnpm build
```

## Entregables de esta semana

- Código funcional, adaptado a mi dominio (tipos, catálogo, lectura, procesamiento, escritura)
- `pnpm build` sin errores de TypeScript
- `data/products.json` con más de 10 registros
- Reporte generado en `output/report.json`
- Este README contando de qué va el dominio y cómo correrlo

La rúbrica de evaluación de esta semana está en el repo del bootcamp
([ergrato-dev/bc-expressjs](https://github.com/ergrato-dev/bc-expressjs)).
