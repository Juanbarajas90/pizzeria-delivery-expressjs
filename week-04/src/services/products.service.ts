// ============================================
// SERVICE — lógica de negocio
// ============================================
import { Product, PaginatedResponse } from '../types';
import * as repo from '../repositories/products.repository';
import { AppError } from '../errors/AppError';

interface FindAllOptions {
  page: number;
  limit: number;
}

export async function findAll(opts: FindAllOptions): Promise<PaginatedResponse<Product>> {
  const { page, limit } = opts;
  const all = await repo.findAll();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, total: all.length, page, limit };
}

export async function findById(id: number): Promise<Product> {
  const product = await repo.findById(id);
  if (!product) throw new AppError(404, `Product ${id} not found`);
  return product;
}

export async function create(dto: repo.CreateProductRepoDto): Promise<Product> {
  return repo.create(dto);
}

export async function update(id: number, dto: repo.UpdateProductRepoDto): Promise<Product> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Product ${id} not found`);

  const updated = await repo.update(id, dto);
  return updated!;
}

export async function remove(id: number): Promise<void> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Product ${id} not found`);

  await repo.remove(id);
}
