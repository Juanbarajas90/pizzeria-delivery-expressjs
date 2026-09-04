// ============================================
// REPOSITORY: Category
// ============================================

import mongoose from 'mongoose';
import { Category } from '../models/category.model';
import { AppError } from '../errors/AppError';
import type { CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema';

// No usamos `instanceof MongoServerError`: mongoose incluye su propia copia
// interna del driver `mongodb`, que puede ser una versión distinta a la que
// tengamos en nuestro propio package.json — dos clases con el mismo nombre
// pero distinta identidad, así que `instanceof` falla en silencio. Revisar
// el código del error directamente es robusto sin importar la versión.
function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000;
}

export async function findAll(): Promise<unknown[]> {
  return Category.find().sort({ name: 1 }).lean();
}

export async function findById(id: string): Promise<unknown> {
  try {
    const category = await Category.findById(id).lean();
    if (!category) throw new AppError(404, 'Categoría no encontrada');
    return category;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) throw new AppError(400, 'ID inválido');
    throw err;
  }
}

export async function create(dto: CreateCategoryDto): Promise<unknown> {
  try {
    const category = await Category.create(dto);
    return category.toJSON();
  } catch (err) {
    if (isDuplicateKeyError(err)) throw new AppError(409, 'Ya existe una categoría con ese nombre');
    throw err;
  }
}

export async function update(id: string, dto: UpdateCategoryDto): Promise<unknown> {
  try {
    const category = await Category.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    }).lean();
    if (!category) throw new AppError(404, 'Categoría no encontrada');
    return category;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) throw new AppError(400, 'ID inválido');
    if (isDuplicateKeyError(err)) throw new AppError(409, 'Ya existe una categoría con ese nombre');
    throw err;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    const category = await Category.findByIdAndDelete(id).lean();
    if (!category) throw new AppError(404, 'Categoría no encontrada');
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) throw new AppError(400, 'ID inválido');
    throw err;
  }
}
