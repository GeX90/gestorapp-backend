import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario de prueba
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Usuario de Prueba',
      income: 3000,
    },
  });

  console.log('✅ Usuario creado:', user.email);

  // Crear categorías de ingresos
  const salaryCategory = await prisma.category.create({
    data: {
      name: 'Salario',
      type: 'INCOME',
      userId: user.id,
    },
  });

  const freelanceCategory = await prisma.category.create({
    data: {
      name: 'Freelance',
      type: 'INCOME',
      userId: user.id,
    },
  });

  // Crear categorías de gastos
  const foodCategory = await prisma.category.create({
    data: {
      name: 'Alimentación',
      type: 'EXPENSE',
      userId: user.id,
    },
  });

  const transportCategory = await prisma.category.create({
    data: {
      name: 'Transporte',
      type: 'EXPENSE',
      userId: user.id,
    },
  });

  const entertainmentCategory = await prisma.category.create({
    data: {
      name: 'Entretenimiento',
      type: 'EXPENSE',
      userId: user.id,
    },
  });

  const rentCategory = await prisma.category.create({
    data: {
      name: 'Alquiler',
      type: 'EXPENSE',
      userId: user.id,
    },
  });

  console.log('✅ Categorías creadas');

  // Crear transacciones de ingresos
  await prisma.transaction.createMany({
    data: [
      {
        amount: 3000,
        date: new Date('2026-01-01'),
        description: 'Salario enero',
        userId: user.id,
        categoryId: salaryCategory.id,
      },
      {
        amount: 500,
        date: new Date('2026-01-15'),
        description: 'Proyecto freelance',
        userId: user.id,
        categoryId: freelanceCategory.id,
      },
    ],
  });

  // Crear transacciones de gastos
  await prisma.transaction.createMany({
    data: [
      {
        amount: 800,
        date: new Date('2026-01-05'),
        description: 'Alquiler mensual',
        userId: user.id,
        categoryId: rentCategory.id,
      },
      {
        amount: 150,
        date: new Date('2026-01-10'),
        description: 'Supermercado',
        userId: user.id,
        categoryId: foodCategory.id,
      },
      {
        amount: 50,
        date: new Date('2026-01-12'),
        description: 'Transporte público',
        userId: user.id,
        categoryId: transportCategory.id,
      },
      {
        amount: 80,
        date: new Date('2026-01-18'),
        description: 'Cine y cena',
        userId: user.id,
        categoryId: entertainmentCategory.id,
      },
      {
        amount: 200,
        date: new Date('2026-01-20'),
        description: 'Compras varias',
        userId: user.id,
        categoryId: foodCategory.id,
      },
    ],
  });

  console.log('✅ Transacciones creadas');

  // Crear presupuesto mensual
  await prisma.budget.create({
    data: {
      month: 1,
      year: 2026,
      amount: 2500,
      alertAt: 80,
      userId: user.id,
    },
  });

  console.log('✅ Presupuesto creado');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Datos de prueba:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
