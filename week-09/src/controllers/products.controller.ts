import type { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/products.service.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  listProductsSchema,
} from '../validators/products.schema.js';

// Los errores (incluidos los de Zod) los resuelve el errorHandler.

export async function getAllHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { query } = listProductsSchema.parse({ query: req.query });
    const products = await productsService.getAll(query.category);
    res.status(200).json({ data: products, total: products.length });
  } catch (err) {
    next(err);
  }
}

export async function getByIdHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { params } = productIdSchema.parse({ params: req.params });
    res.status(200).json({ data: await productsService.getById(params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { body } = createProductSchema.parse({ body: req.body });
    const user = res.locals['user'] as { sub: string };
    res.status(201).json({ data: await productsService.create(body, user.sub) });
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { params } = productIdSchema.parse({ params: req.params });
    const { body } = updateProductSchema.parse({ body: req.body });
    const user = res.locals['user'] as { sub: string; role: string };
    res.status(200).json({ data: await productsService.update(params.id, body, user.sub, user.role) });
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { params } = productIdSchema.parse({ params: req.params });
    const user = res.locals['user'] as { sub: string; role: string };
    await productsService.remove(params.id, user.sub, user.role);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
