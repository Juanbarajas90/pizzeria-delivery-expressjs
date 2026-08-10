// ============================================
// TYPES — Producto del menú de la pizzería
// ============================================

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  createdAt: string;
}

// DTO para crear — sin campos auto-generados
export type CreateProductDto = Omit<Product, 'id' | 'createdAt'>;

// DTO para actualizar — todos los campos opcionales
export type UpdateProductDto = Partial<CreateProductDto>;

// Contratos de respuesta
export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
