import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug solo puede contener minúsculas, números y guiones'),
  description: z.string().min(1),
  price: z.number().positive(),
  available: z.boolean().default(true),
  categoryId: z.string().uuid().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
