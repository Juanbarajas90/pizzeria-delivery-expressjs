// src/services/products.service.ts — Lógica de negocio
import { Product } from '@prisma/client';
import * as repo from '../repositories/products.repository';
import { AppError } from '../errors/AppError';
import type { CreateProductDto, UpdateProductDto } from '../schemas/product.schema';

export async function listProducts(
  page: number,
  limit: number,
): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
  return repo.findAll(page, limit);
}

export async function getProduct(id: string): Promise<Product> {
  const product = await repo.findById(id);
  if (!product) throw new AppError(404, 'Producto no encontrado');
  return product;
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  return repo.create(data);
}

export async function updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
  return repo.update(id, data);
}

export async function deleteProduct(id: string): Promise<void> {
  return repo.remove(id);
}
