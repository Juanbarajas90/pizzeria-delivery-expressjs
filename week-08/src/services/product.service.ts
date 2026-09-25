import { Product, IProduct } from '../models/product.model.js';
import { AppError } from '../errors/AppError.js';
import type { CreateProductDto, UpdateProductDto } from '../schemas/product.schema.js';

export async function findAll(): Promise<IProduct[]> {
  return Product.find({ active: true }).sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<IProduct> {
  const product = await Product.findById(id);
  if (!product) throw new AppError(404, 'Product not found');
  return product;
}

export async function create(data: CreateProductDto, userId: string): Promise<IProduct> {
  return Product.create({ ...data, createdBy: userId });
}

// El dueño puede editar SU producto; admin puede editar cualquiera
export async function update(
  id: string,
  data: UpdateProductDto,
  requesterId: string,
  requesterRole: string
): Promise<IProduct> {
  const product = await findById(id);
  if (requesterRole !== 'admin' && product.createdBy !== requesterId) {
    throw new AppError(403, 'You can only update your own products');
  }
  const updated = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) throw new AppError(404, 'Product not found');
  return updated;
}

export async function remove(id: string): Promise<void> {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new AppError(404, 'Product not found');
}
