import { IProduct } from '../models/product.model';
import * as productsRepository from '../repositories/products.repository';
import { CreateProductDto, UpdateProductDto } from '../schemas/product.schema';
import { AppError } from '../errors/AppError';

export async function getAll(): Promise<IProduct[]> {
  return productsRepository.findAll();
}

export async function getById(id: string): Promise<IProduct> {
  const product = await productsRepository.findById(id);
  if (!product) throw new AppError(404, 'Producto no encontrado');
  return product;
}

export async function create(dto: CreateProductDto, userId: string): Promise<IProduct> {
  return productsRepository.create({ ...dto, createdBy: userId });
}

export async function update(id: string, dto: UpdateProductDto): Promise<IProduct> {
  const product = await productsRepository.updateById(id, dto);
  if (!product) throw new AppError(404, 'Producto no encontrado');
  return product;
}

export async function remove(id: string): Promise<void> {
  const deleted = await productsRepository.deleteById(id);
  if (!deleted) throw new AppError(404, 'Producto no encontrado');
}
