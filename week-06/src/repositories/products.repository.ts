// ============================================
// REPOSITORY: Product (con populate de category)
// ============================================

import mongoose from 'mongoose';
import { Product } from '../models/product.model';
import { AppError } from '../errors/AppError';
import type { CreateProductDto, UpdateProductDto } from '../schemas/product.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// No usamos `instanceof MongoServerError` — ver categories.repository.ts para el porqué.
function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000;
}

export async function findAll(
  page: number,
  limit: number,
  search?: string,
): Promise<PaginatedResult<unknown>> {
  const skip = (page - 1) * limit;
  const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

  const [data, total] = await Promise.all([
    Product.find(filter)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findById(id: string): Promise<unknown> {
  try {
    const product = await Product.findById(id).populate('category').lean();
    if (!product) throw new AppError(404, 'Producto no encontrado');
    return product;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) throw new AppError(400, 'ID inválido');
    throw err;
  }
}

export async function create(dto: CreateProductDto): Promise<unknown> {
  try {
    const product = await Product.create(dto);
    const populated = await product.populate('category');
    return populated.toJSON();
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) throw new AppError(400, 'ID de categoría inválido');
    if (isDuplicateKeyError(err)) throw new AppError(409, 'Ya existe un producto con ese valor');
    throw err;
  }
}

export async function update(id: string, dto: UpdateProductDto): Promise<unknown> {
  try {
    const product = await Product.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    })
      .populate('category')
      .lean();
    if (!product) throw new AppError(404, 'Producto no encontrado');
    return product;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) throw new AppError(400, 'ID inválido');
    if (isDuplicateKeyError(err)) throw new AppError(409, 'Ya existe un producto con ese valor');
    throw err;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) throw new AppError(404, 'Producto no encontrado');
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof mongoose.Error.CastError) throw new AppError(400, 'ID inválido');
    throw err;
  }
}
