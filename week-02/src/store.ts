import type { Product, CreateProductDto, UpdateProductDto } from './types.js';

// Store en memoria — simula una base de datos sin persistencia.
// Los datos se pierden al reiniciar el servidor (se usará BD a partir de week-05).
const products: Product[] = [
  { id: 1, name: 'Pizza Margarita', price: 32000, category: 'pizza-clasica', available: true },
  { id: 2, name: 'Pizza Pepperoni', price: 35000, category: 'pizza-clasica', available: true },
  { id: 3, name: 'Pizza Hawaiana', price: 36000, category: 'pizza-especial', available: true },
];
let nextId = 4;

export function getAll(): Product[] {
  return products;
}

export function getById(id: number): Product | undefined {
  return products.find((product) => product.id === id);
}

export function create(data: CreateProductDto): Product {
  const newProduct: Product = { id: nextId++, ...data };
  products.push(newProduct);
  return newProduct;
}

export function update(id: number, data: UpdateProductDto): Product | undefined {
  const product = products.find((item) => item.id === id);
  if (!product) return undefined;

  Object.assign(product, data);
  return product;
}

export function remove(id: number): boolean {
  const index = products.findIndex((item) => item.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  return true;
}
