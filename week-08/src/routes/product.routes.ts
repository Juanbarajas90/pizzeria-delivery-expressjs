import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

// El menú es público: cualquiera puede ver los productos sin cuenta
router.get('/', getProducts);
router.get('/:id', getProductById);

// Crear: cualquier usuario autenticado
router.post('/', authMiddleware, createProduct);

// Actualizar: autenticado; el service exige ser el dueño o admin
router.patch('/:id', authMiddleware, updateProduct);

// Eliminar: solo admin (requireRole SIEMPRE después de authMiddleware)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProduct);

export default router;
