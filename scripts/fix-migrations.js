// Script para resolver migrations falhadas - versão SQL direto
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function fixAndMigrate() {
  console.log('🔧 Corrigindo migration falha...');
  
  try {
    // Marca a migration como aplicada
    await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET finished_at = COALESCE(finished_at, started_at + interval '1 second'),
          applied_steps_count = GREATEST(applied_steps_count, 1)
      WHERE migration_name = '20260115154343_add_orders_system';
    `);
    
    console.log('✅ Migration marcada como resolvida!');
    
  } catch (error) {
    console.log('⚠️  Aviso:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAndMigrate();
