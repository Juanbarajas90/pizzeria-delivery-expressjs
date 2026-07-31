// ============================================
// PROCESSOR — Filtra y calcula estadísticas del catálogo
// ============================================

import type { Product, ProductSummary } from './types.js';

export function filterByCategory(products: Product[], categoryFilter: string | null): Product[] {
  if (categoryFilter === null) return products;

  const normalized = categoryFilter.toLowerCase();
  const filtered = products.filter((product) => product.category.toLowerCase() === normalized);

  if (filtered.length === 0) {
    const available = Array.from(new Set(products.map((product) => product.category))).join(', ');
    throw new Error(
      `No hay productos en la categoría "${categoryFilter}". Categorías disponibles: ${available}`,
    );
  }

  return filtered;
}

export function calculateSummary(products: Product[]): ProductSummary {
  const total = products.length;
  const active = products.filter((product) => product.active).length;
  const inactive = total - active;

  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
  const averagePrice = Math.round((totalPrice / total) * 100) / 100;

  const mostExpensive = products.reduce((max, product) => (product.price > max.price ? product : max));
  const cheapest = products.reduce((min, product) => (product.price < min.price ? product : min));

  const categories = Array.from(new Set(products.map((product) => product.category)));

  return { total, active, inactive, averagePrice, mostExpensive, cheapest, categories };
}
