import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../models/product.model.js';

// Se rechazan < y > para evitar HTML/XSS en los textos
const noHtml = (label: string) => z.string().regex(/^[^<>]*$/, `${label} must not contain HTML characters`);

export const createProductSchema = z.object({
  body: z.object({
    code: z
      .string()
      .regex(/^[A-Za-z]{2}-\d{3}$/, 'Code must look like PZ-001'),
    name: noHtml('Name').min(2, 'Name must be at least 2 characters').max(200),
    description: noHtml('Description').max(1000).optional(),
    price: z.number().positive('Price must be positive'),
    category: z.enum(PRODUCT_CATEGORIES),
    prepTimeMinutes: z.number().int().positive().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: noHtml('Name').min(2).max(200).optional(),
    description: noHtml('Description').max(1000).optional(),
    price: z.number().positive('Price must be positive').optional(),
    category: z.enum(PRODUCT_CATEGORIES).optional(),
    prepTimeMinutes: z.number().int().positive().optional(),
    active: z.boolean().optional(),
  }),
});

export type CreateProductDto = z.infer<typeof createProductSchema>['body'];
export type UpdateProductDto = z.infer<typeof updateProductSchema>['body'];
