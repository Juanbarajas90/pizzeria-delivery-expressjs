// ============================================
// TIPOS — Producto del menú de la pizzería
// ============================================

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
}

// Resumen que el procesador calcula sobre el catálogo
export interface ProductSummary {
  total: number;
  active: number;
  inactive: number;
  averagePrice: number;
  mostExpensive: Product;
  cheapest: Product;
  categories: string[];
}

// Reporte final que se escribe en output/report.json
export interface Report {
  generatedAt: string;
  appliedFilter: string | null;
  summary: ProductSummary;
  items: Product[];
}
