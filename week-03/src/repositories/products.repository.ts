// ============================================
// REPOSITORY — Capa de acceso a datos
// Único punto de acceso al store. Retorna copias defensivas.
// ============================================

import { Product, CreateProductDto, UpdateProductDto } from '../types';

const store: Product[] = [
  {
    id: 1,
    name: 'Pizza Margarita',
    price: 32000,
    category: 'pizza-clasica',
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Pizza Pepperoni',
    price: 35000,
    category: 'pizza-clasica',
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Pizza Hawaiana',
    price: 36000,
    category: 'pizza-especial',
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Pizza Cuatro Quesos',
    price: 38000,
    category: 'pizza-especial',
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Coca-Cola 400ml',
    price: 6000,
    category: 'bebida',
    available: true,
    createdAt: new Date().toISOString(),
  },
];
let nextId = 6;

export async function findAll(): Promise<Product[]> {
  return [...store];
}

export async function findById(id: number): Promise<Product | undefined> {
  return store.find((product) => product.id === id);
}

export async function create(dto: CreateProductDto): Promise<Product> {
  const product: Product = { id: nextId++, ...dto, createdAt: new Date().toISOString() };
  store.push(product);
  return { ...product };
}

export async function update(id: number, dto: UpdateProductDto): Promise<Product | undefined> {
  const index = store.findIndex((product) => product.id === id);
  if (index === -1) return undefined;

  store[index] = { ...store[index]!, ...dto };
  return { ...store[index]! };
}

export async function remove(id: number): Promise<boolean> {
  const index = store.findIndex((product) => product.id === id);
  if (index === -1) return false;

  store.splice(index, 1);
  return true;
}
