import { Router } from 'express';
import type { Request, Response } from 'express';
import * as store from '../store.js';
import type { CreateProductDto, UpdateProductDto } from '../types.js';

export const productsRouter = Router();

function isValidCreatePayload(body: unknown): body is CreateProductDto {
  if (typeof body !== 'object' || body === null) return false;

  const { name, price, category } = body as Record<string, unknown>;
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    typeof price === 'number' &&
    price >= 0 &&
    typeof category === 'string' &&
    category.trim().length > 0
  );
}

// GET /products — Listar todos los productos
productsRouter.get('/', (_req, res) => {
  res.json(store.getAll());
});

// GET /products/:id — Obtener producto por ID
productsRouter.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const product = store.getById(id);

  if (!product) {
    res.status(404).json({ error: `Product with id ${id} not found` });
    return;
  }

  res.json(product);
});

// POST /products — Crear nuevo producto
productsRouter.post('/', (req: Request, res: Response) => {
  if (!isValidCreatePayload(req.body)) {
    res.status(400).json({
      error: 'name (string), price (number) and category (string) are required',
    });
    return;
  }

  const dto: CreateProductDto = {
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    available: typeof req.body.available === 'boolean' ? req.body.available : true,
  };

  const created = store.create(dto);
  res.status(201).json(created);
});

// PUT /products/:id — Actualizar producto completo
productsRouter.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body: unknown = req.body;

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ error: 'Request body must be an object with fields to update' });
    return;
  }

  const updated = store.update(id, body as UpdateProductDto);
  if (!updated) {
    res.status(404).json({ error: `Product with id ${id} not found` });
    return;
  }

  res.json(updated);
});

// DELETE /products/:id — Eliminar producto
productsRouter.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const removed = store.remove(id);

  if (!removed) {
    res.status(404).json({ error: `Product with id ${id} not found` });
    return;
  }

  res.status(204).send();
});
