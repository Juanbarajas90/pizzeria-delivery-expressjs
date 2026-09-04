// ============================================
// SEED — Datos iniciales de la pizzería
// Inserta Category primero, luego Product referenciando sus _id.
// ============================================

import 'dotenv/config';
import { connectDB, disconnectDB } from './lib/mongoose';
import { Category } from './models/category.model';
import { Product } from './models/product.model';

async function seed(): Promise<void> {
  await connectDB();

  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log('Collections cleared');

  const [clasica, especial, bebida, complemento] = await Category.insertMany([
    { name: 'Pizza clásica' },
    { name: 'Pizza especial' },
    { name: 'Bebida' },
    { name: 'Complemento' },
  ]);
  console.log('Categories inserted');

  await Product.insertMany([
    {
      name: 'Pizza Margarita',
      description: 'Tomate, mozzarella y albahaca fresca',
      price: 32000,
      prepTimeMinutes: 15,
      category: clasica!._id,
    },
    {
      name: 'Pizza Pepperoni',
      description: 'Pepperoni y mozzarella',
      price: 35000,
      prepTimeMinutes: 15,
      category: clasica!._id,
    },
    {
      name: 'Pizza Hawaiana',
      description: 'Jamón, piña y mozzarella',
      price: 36000,
      prepTimeMinutes: 18,
      category: especial!._id,
    },
    {
      name: 'Pizza Cuatro Quesos',
      description: 'Mozzarella, parmesano, gorgonzola y provolone',
      price: 38000,
      prepTimeMinutes: 20,
      category: especial!._id,
    },
    {
      name: 'Coca-Cola 400ml',
      description: 'Bebida gaseosa 400ml',
      price: 6000,
      prepTimeMinutes: 1,
      category: bebida!._id,
    },
    {
      name: 'Pan de Ajo',
      description: 'Pan artesanal con mantequilla de ajo',
      price: 9000,
      prepTimeMinutes: 10,
      category: complemento!._id,
    },
  ]);
  console.log('Products inserted');

  console.log('Seed completed successfully');
  await disconnectDB();
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
