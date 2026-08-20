// ============================================
// SCHEMAS — Producto del menú de la pizzería
// ============================================
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string({ error: 'name es obligatorio' }).min(1, 'name no puede estar vacío').trim(),
  description: z.string().trim().default(''),
  price: z.number({ error: 'price es obligatorio' }).positive('price debe ser mayor a 0'),
  category: z
    .string({ error: 'category es obligatorio' })
    .min(1, 'category no puede estar vacío')
    .trim(),
  available: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
