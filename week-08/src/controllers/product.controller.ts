import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';
import { AppError } from '../errors/AppError.js';

export async function getProducts(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await productService.findAll();
    res.json({ data: products, total: products.length });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({ data: await productService.findById(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');
    const { body } = createProductSchema.parse({ body: req.body });
    const product = await productService.create(body, req.user.sub);
    res.status(201).json({ message: 'Product created', data: product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');
    const { body } = updateProductSchema.parse({ body: req.body });
    const product = await productService.update(req.params.id, body, req.user.sub, req.user.role);
    res.json({ message: 'Product updated', data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await productService.remove(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}
