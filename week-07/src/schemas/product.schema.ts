import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  category: z.enum(['pizza', 'drink', 'dessert', 'side']),
  available: z.boolean().default(true),
  prepTimeMinutes: z.number().int().positive().default(15),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
