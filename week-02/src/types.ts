// ============================================
// TYPES: Producto del menú de la pizzería
// ============================================

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

// DTO usado para crear un nuevo producto (sin id, se genera automáticamente)
export type CreateProductDto = Omit<Product, 'id'>;

// DTO para actualización (todos los campos editables)
export type UpdateProductDto = Partial<CreateProductDto>;
