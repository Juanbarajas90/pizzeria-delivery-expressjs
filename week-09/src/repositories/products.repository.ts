import { ProductModel, type IProduct } from '../models/product.model.js';
import type { CreateProductDto, ProductCategory, UpdateProductDto } from '../types/index.js';

// En los unit tests ESTE módulo se mockea con jest.mock().
// En los integration tests accede a MongoDB Memory Server.

export async function findAllProducts(category?: ProductCategory): Promise<IProduct[]> {
  const filter = category ? { category } : {};
  return ProductModel.find(filter).lean<IProduct[]>().exec();
}

export async function findProductById(id: string): Promise<IProduct | null> {
  return ProductModel.findById(id).lean<IProduct>().exec();
}

export async function findProductByName(name: string): Promise<IProduct | null> {
  return ProductModel.findOne({ name }).lean<IProduct>().exec();
}

export async function createProduct(dto: CreateProductDto, createdBy: string): Promise<IProduct> {
  const product = new ProductModel({ ...dto, createdBy });
  return product.save() as unknown as IProduct;
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<IProduct | null> {
  return ProductModel.findByIdAndUpdate(id, dto, { new: true }).lean<IProduct>().exec();
}

export async function deleteProduct(id: string): Promise<IProduct | null> {
  return ProductModel.findByIdAndDelete(id).lean<IProduct>().exec();
}
