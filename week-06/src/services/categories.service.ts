import * as repo from '../repositories/categories.repository';
import type { CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema';

export async function getAll(): Promise<unknown[]> {
  return repo.findAll();
}

export async function getById(id: string): Promise<unknown> {
  return repo.findById(id);
}

export async function createCategory(dto: CreateCategoryDto): Promise<unknown> {
  return repo.create(dto);
}

export async function updateCategory(id: string, dto: UpdateCategoryDto): Promise<unknown> {
  return repo.update(id, dto);
}

export async function deleteCategory(id: string): Promise<void> {
  return repo.remove(id);
}
