// ============================================
// REPOSITORY — capa de acceso a datos (en memoria)
// ============================================
import { Product } from '../types';

export type CreateProductRepoDto = Omit<Product, 'id' | 'createdAt'>;
export type UpdateProductRepoDto = Partial<CreateProductRepoDto>;

let products: Product[] = [
  {
    id: 1,
    name: 'Pizza Margarita',
    description: 'Tomate, mozzarella y albahaca fresca',
    price: 32000,
    category: 'pizza-clasica',
    available: true,
    createdAt: new Date(),
  },
  {
    id: 2,
    name: 'Pizza Pepperoni',
    description: 'Pepperoni y mozzarella',
    price: 35000,
    category: 'pizza-clasica',
    available: true,
    createdAt: new Date(),
  },
  {
    id: 3,
    name: 'Pizza Hawaiana',
    description: 'Jamón, piña y mozzarella',
    price: 36000,
    category: 'pizza-especial',
    available: true,
    createdAt: new Date(),
  },
  {
    id: 4,
    name: 'Pizza Cuatro Quesos',
    description: 'Mozzarella, parmesano, gorgonzola y provolone',
    price: 38000,
    category: 'pizza-especial',
    available: true,
    createdAt: new Date(),
  },
  {
    id: 5,
    name: 'Coca-Cola 400ml',
    description: 'Bebida gaseosa 400ml',
    price: 6000,
    category: 'bebida',
    available: true,
    createdAt: new Date(),
  },
];

let nextId = 6;

export async function findAll(): Promise<Product[]> {
  return [...products];
}

export async function findById(id: number): Promise<Product | undefined> {
  const product = products.find((p) => p.id === id);
  return product ? { ...product } : undefined;
}

export async function create(dto: CreateProductRepoDto): Promise<Product> {
  const product: Product = { id: nextId++, ...dto, createdAt: new Date() };
  products.push(product);
  return { ...product };
}

export async function update(id: number, dto: UpdateProductRepoDto): Promise<Product | undefined> {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  products[index] = { ...products[index]!, ...dto };
  return { ...products[index]! };
}

export async function remove(id: number): Promise<boolean> {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  return true;
}
