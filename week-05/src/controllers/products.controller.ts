// src/controllers/products.controller.ts — Capa HTTP
import { Request, Response, NextFunction } from 'express';
import * as service from '../services/products.service';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query['page']) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 10));
    const result = await service.listProducts(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await service.getProduct(req.params['id'] as string);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = createProductSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' });
      return;
    }
    const product = await service.createProduct(result.data);
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = updateProductSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' });
      return;
    }
    const product = await service.updateProduct(req.params['id'] as string, result.data);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await service.deleteProduct(req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
