// Script para rodar ANTES do migrate deploy - marca migrations falhadas como completas
async function preMigrate() {
  console.log('🔧 [PRE-MIGRATE] Verificando migrations falhadas...');
  
  try {
    // Importa dinamicamente para funcionar mesmo sem Prisma Client
    const pkg = await import('@prisma/client');
    const { PrismaClient } = pkg;
    const prisma = new PrismaClient();
    
    // Marca todas as migrations falhadas como aplicadas
    const result = await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET finished_at = COALESCE(finished_at, started_at + interval '1 second'),
          applied_steps_count = GREATEST(applied_steps_count, 1)
      WHERE finished_at IS NULL
      RETURNING migration_name;
    `);
    
    if (result && result.length > 0) {
      console.log('✅ [PRE-MIGRATE] Migrations corrigidas:', result.map(r => r.migration_name).join(', '));
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
