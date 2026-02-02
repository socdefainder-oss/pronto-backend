// Script para rodar ANTES do migrate deploy - deleta migrations falhadas
async function preMigrate() {
  console.log('🔧 [PRE-MIGRATE] Verificando migrations falhadas...');
  
  try {
    // Importa dinamicamente para funcionar mesmo sem Prisma Client
    const pkg = await import('@prisma/client');
    const { PrismaClient } = pkg;
    const prisma = new PrismaClient();
    
    // DELETA migrations falhadas para que possam ser reaplicadas
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations"
      WHERE finished_at IS NULL
      RETURNING migration_name;
    `);
    
    if (result && result.length > 0) {
      console.log('✅ [PRE-MIGRATE] Migrations falhadas deletadas (serão reaplicadas):', result.map(r => r.migration_name).join(', '));
    } else {
      console.log('✅ [PRE-MIGRATE] Nenhuma migration falhada encontrada.');
    }
    
    await prisma.$disconnect();
    process.exit(0);
    
  } catch (error) {
    console.log('⚠️  [PRE-MIGRATE] Aviso:', error.message);
    // Exit com sucesso mesmo com erro (pode ser normal se ainda não há tabela _prisma_migrations)
    process.exit(0);
  }
}

preMigrate();
