import * as repo from '../repositories/products.repository';
import type { CreateProductDto, UpdateProductDto } from '../schemas/product.schema';

export async function getAll(page: number, limit: number, search?: string) {
  return repo.findAll(page, limit, search);
}

export async function getById(id: string): Promise<unknown> {
  return repo.findById(id);
}

export async function createProduct(dto: CreateProductDto): Promise<unknown> {
  return repo.create(dto);
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<unknown> {
  return repo.update(id, dto);
}

export async function deleteProduct(id: string): Promise<void> {
  return repo.remove(id);
}
