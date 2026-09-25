import { AppError } from '../errors/AppError.js';
import type { CreateProductDto, ProductCategory, UpdateProductDto } from '../types/index.js';
import type { IProduct } from '../models/product.model.js';
import * as productsRepo from '../repositories/products.repository.js';

export async function getAll(category?: ProductCategory): Promise<IProduct[]> {
  return productsRepo.findAllProducts(category);
}

export async function getById(id: string): Promise<IProduct> {
  const product = await productsRepo.findProductById(id);
  if (!product) throw new AppError(404, 'Product not found');
  return product;
}

export async function create(dto: CreateProductDto, createdBy: string): Promise<IProduct> {
  const duplicated = await productsRepo.findProductByName(dto.name);
  if (duplicated) throw new AppError(409, 'A product with that name already exists');
  return productsRepo.createProduct(dto, createdBy);
}

// Solo el creador o un admin puede modificar o eliminar un producto
function assertCanModify(product: IProduct, requesterId: string, requesterRole: string): void {
  if (product.createdBy !== requesterId && requesterRole !== 'admin') {
    throw new AppError(403, 'Insufficient permissions');
  }
}

export async function update(
  id: string,
  dto: UpdateProductDto,
  requesterId: string,
  requesterRole: string,
): Promise<IProduct> {
  const existing = await productsRepo.findProductById(id);
  if (!existing) throw new AppError(404, 'Product not found');
  assertCanModify(existing, requesterId, requesterRole);

  const updated = await productsRepo.updateProduct(id, dto);
  if (!updated) throw new AppError(404, 'Product not found');
  return updated;
}

export async function remove(id: string, requesterId: string, requesterRole: string): Promise<void> {
  const existing = await productsRepo.findProductById(id);
  if (!existing) throw new AppError(404, 'Product not found');
  assertCanModify(existing, requesterId, requesterRole);

  await productsRepo.deleteProduct(id);
}
