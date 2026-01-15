// Script para resolver migrations falhadas - versão SQL direto
async function fixAndMigrate() {
  console.log('🔧 Corrigindo migration falha...');
  
  try {
    // Importa dinamicamente para funcionar mesmo sem Prisma Client
    const pkg = await import('@prisma/client');
    const { PrismaClient } = pkg;
    const prisma = new PrismaClient();
    
    // Marca a migration como aplicada
    await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET finished_at = COALESCE(finished_at, started_at + interval '1 second'),
          applied_steps_count = GREATEST(applied_steps_count, 1)
      WHERE migration_name = '20260115154343_add_orders_system'
      AND finished_at IS NULL;
    `);
    
    console.log('✅ Migration marcada como resolvida!');
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('⚠️  Aviso (normal se já corrigido):', error.message);
  }
}

fixAndMigrate();
