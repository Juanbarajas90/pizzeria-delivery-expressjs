export type UserRole = 'user' | 'admin';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

// ---- Dominio: pizzería con delivery ----

export type ProductCategory = 'pizza' | 'drink' | 'dessert' | 'side';

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  available?: boolean;
  prepTimeMinutes?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;
