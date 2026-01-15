// Script para marcar migration como resolvida
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMigration() {
  console.log('🔧 Marcando migration falha como resolvida...');
  
  try {
    // Marca a migration como aplicada com sucesso
    await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET finished_at = started_at + interval '1 second',
          applied_steps_count = 1
      WHERE migration_name = '20260115154343_add_orders_system'
      AND finished_at IS NULL;
    `);
    
    console.log('✅ Migration marcada como resolvida!');
    
    // Mostra o status das migrations
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY started_at DESC
      LIMIT 10;
    `;
    
    console.log('\n📋 Últimas 10 migrations:');
    console.table(migrations);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();
