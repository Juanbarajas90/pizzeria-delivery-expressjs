// ============================================
// ENTRY POINT — Orquesta la lectura, filtrado y reporte del catálogo
// ============================================

import { readProducts } from './reader.js';
import { filterByCategory, calculateSummary } from './processor.js';
import { writeReport } from './writer.js';
import type { Report } from './types.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const categoryIndex = args.indexOf('--category');
  const categoryFilter: string | null = categoryIndex !== -1 ? args[categoryIndex + 1] : null;

  try {
    const products = await readProducts();
    const filtered = filterByCategory(products, categoryFilter);
    const summary = calculateSummary(filtered);

    const report: Report = {
      generatedAt: new Date().toISOString(),
      appliedFilter: categoryFilter,
      summary,
      items: filtered,
    };

    console.log('Resumen del catálogo de la pizzería');
    console.log(`Total de productos: ${summary.total}`);
    console.log(`Activos: ${summary.active} | Inactivos: ${summary.inactive}`);
    console.log(`Precio promedio: $${summary.averagePrice}`);
    console.log(`Más caro: ${summary.mostExpensive.name} ($${summary.mostExpensive.price})`);
    console.log(`Más barato: ${summary.cheapest.name} ($${summary.cheapest.price})`);
    console.log(`Categorías: ${summary.categories.join(', ')}`);

    await writeReport(report);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

main();
