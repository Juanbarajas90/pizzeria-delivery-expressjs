import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getAllHandler,
  getByIdHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} from '../controllers/products.controller.js';

export const productsRouter = Router();

// El menú es público
productsRouter.get('/', getAllHandler);
productsRouter.get('/:id', getByIdHandler);
productsRouter.post('/', authenticate, createHandler);
productsRouter.put('/:id', authenticate, updateHandler);
productsRouter.delete('/:id', authenticate, deleteHandler);
