// prisma/seed.ts — Datos iniciales de la pizzería
// Ejecutar con: pnpm dlx prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const [clasica, especial, bebida, complemento] = await Promise.all([
    prisma.category.create({ data: { name: 'Pizza clásica' } }),
    prisma.category.create({ data: { name: 'Pizza especial' } }),
    prisma.category.create({ data: { name: 'Bebida' } }),
    prisma.category.create({ data: { name: 'Complemento' } }),
  ]);
  console.log('✅ 4 categorías creadas');

  const result = await prisma.product.createMany({
    data: [
      {
        name: 'Pizza Margarita',
        slug: 'pizza-margarita',
        description: 'Tomate, mozzarella y albahaca fresca',
        price: 32000,
        categoryId: clasica.id,
      },
      {
        name: 'Pizza Pepperoni',
        slug: 'pizza-pepperoni',
        description: 'Pepperoni y mozzarella',
        price: 35000,
        categoryId: clasica.id,
      },
      {
        name: 'Pizza Hawaiana',
        slug: 'pizza-hawaiana',
        description: 'Jamón, piña y mozzarella',
        price: 36000,
        categoryId: especial.id,
      },
      {
        name: 'Pizza Cuatro Quesos',
        slug: 'pizza-cuatro-quesos',
        description: 'Mozzarella, parmesano, gorgonzola y provolone',
        price: 38000,
        categoryId: especial.id,
      },
      {
        name: 'Coca-Cola 400ml',
        slug: 'coca-cola-400ml',
        description: 'Bebida gaseosa 400ml',
        price: 6000,
        categoryId: bebida.id,
      },
      {
        name: 'Pan de Ajo',
        slug: 'pan-de-ajo',
        description: 'Pan artesanal con mantequilla de ajo',
        price: 9000,
        categoryId: complemento.id,
      },
    ],
  });
  console.log(`✅ ${result.count} productos creados`);
}

main()
  .catch((err: unknown) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
