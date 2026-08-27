// src/repositories/products.repository.ts — Acceso a datos con Prisma
import { Prisma, Product } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import type { CreateProductDto, UpdateProductDto } from '../schemas/product.schema';

const includeCategory = { category: true } satisfies Prisma.ProductInclude;

export async function findAll(
  page: number,
  limit: number,
): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
  const [data, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: includeCategory,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count(),
  ]);

  return { data, total, page, limit };
}

export async function findById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id }, include: includeCategory });
}

export async function create(data: CreateProductDto): Promise<Product> {
  try {
    return await prisma.product.create({ data, include: includeCategory });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe un producto con ese slug');
    }
    throw err;
  }
}

export async function update(id: string, data: UpdateProductDto): Promise<Product> {
  try {
    return await prisma.product.update({ where: { id }, data, include: includeCategory });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') throw new AppError(404, 'Producto no encontrado');
      if (err.code === 'P2002') throw new AppError(409, 'Ya existe un producto con ese slug');
    }
    throw err;
  }
}

export async function remove(id: string): Promise<void> {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, 'Producto no encontrado');
    }
    throw err;
  }
}
