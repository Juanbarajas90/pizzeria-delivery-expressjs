// ============================================
// READER — Lee el catálogo de productos desde data/products.json
// ============================================

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Product } from './types.js';

export async function readProducts(): Promise<Product[]> {
  const filePath = join(import.meta.dirname, '..', 'data', 'products.json');

  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch (err) {
    throw new Error(
      `No se pudo leer el catálogo de productos en "${filePath}": ${(err as Error).message}`,
    );
  }
}
