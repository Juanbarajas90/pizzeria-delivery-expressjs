import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json(await productService.getAll());
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json(await productService.getById(String(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createProductSchema.parse(req.body);
    res.status(201).json(await productService.create(dto, req.user!.sub));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = updateProductSchema.parse(req.body);
    res.status(200).json(await productService.update(String(req.params.id), dto));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.remove(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
