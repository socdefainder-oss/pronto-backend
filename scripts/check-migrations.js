const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMigrations() {
  try {
    console.log('🔍 Verificando histórico de migrations...\n');
    
    // Verifica se a tabela _prisma_migrations existe
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at, applied_steps_count
      FROM _prisma_migrations
      ORDER BY started_at DESC
    `;
    
    console.log('📋 MIGRATIONS APLICADAS:');
    migrations.forEach(m => {
      console.log(`  • ${m.migration_name}`);
      console.log(`    Iniciada: ${m.started_at}`);
      console.log(`    Finalizada: ${m.finished_at || 'Em progresso'}`);
      console.log(`    Steps: ${m.applied_steps_count}`);
      console.log('');
    });
    
    console.log(`Total: ${migrations.length} migrations aplicadas`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations();
