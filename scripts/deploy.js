// Script completo de deploy - deleta migrations falhadas, aplica migrations e inicia servidor
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';

async function deploy() {
  console.log('🚀 [DEPLOY] Iniciando processo de deploy...');
  
  try {
    const prisma = new PrismaClient();
    
    // 1. Deleta migrations falhadas
    console.log('🔧 [DEPLOY] Verificando migrations falhadas...');
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations"
      WHERE finished_at IS NULL
      RETURNING migration_name;
    `);
    
    if (result && result.length > 0) {
      console.log('✅ [DEPLOY] Migrations falhadas deletadas:', result.map(r => r.migration_name).join(', '));
    } else {
      console.log('✅ [DEPLOY] Nenhuma migration falhada encontrada.');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('⚠️  [DEPLOY] Aviso ao limpar migrations:', error.message);
  }
  
  // 2. Aplica migrations
  console.log('📦 [DEPLOY] Aplicando migrations...');
  const migrate = spawn('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    shell: true
  });
  
  await new Promise((resolve, reject) => {
    migrate.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ [DEPLOY] Erro ao aplicar migrations');
        reject(new Error('Migration failed'));
      } else {
        console.log('✅ [DEPLOY] Migrations aplicadas com sucesso!');
        resolve();
      }
    });
  });
  
  // 3. Inicia o servidor
  console.log('🚀 [DEPLOY] Iniciando servidor...');
  const server = spawn('node', ['dist/server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
}

deploy().catch(err => {
  console.error('❌ [DEPLOY] Erro fatal:', err);
  process.exit(1);
});
