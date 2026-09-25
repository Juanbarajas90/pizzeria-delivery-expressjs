import { ProductModel, IProduct } from '../models/product.model';
import { CreateProductDto, UpdateProductDto } from '../schemas/product.schema';

export async function findAll(): Promise<IProduct[]> {
  return ProductModel.find().sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<IProduct | null> {
  return ProductModel.findById(id);
}

export async function create(data: CreateProductDto & { createdBy: string }): Promise<IProduct> {
  return ProductModel.create(data);
}

export async function updateById(id: string, data: UpdateProductDto): Promise<IProduct | null> {
  return ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteById(id: string): Promise<boolean> {
  const deleted = await ProductModel.findByIdAndDelete(id);
  return deleted !== null;
}
