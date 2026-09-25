import { z } from 'zod';

const category = z.enum(['pizza', 'drink', 'dessert', 'side']);

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(1000).optional(),
    price: z.number().positive(),
    category,
    available: z.boolean().optional(),
    prepTimeMinutes: z.number().int().positive().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().max(1000).optional(),
    price: z.number().positive().optional(),
    category: category.optional(),
    available: z.boolean().optional(),
    prepTimeMinutes: z.number().int().positive().optional(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid MongoDB ID'),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({ category: category.optional() }),
});
