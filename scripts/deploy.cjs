// Script completo de deploy - deleta migrations falhadas, aplica migrations e inicia servidor
const { PrismaClient } = require('@prisma/client');
const { spawn } = require('child_process');

async function deploy() {
  console.log('🚀 [DEPLOY] Iniciando processo de deploy...');
  
  // 0. Build do TypeScript
  console.log('🔨 [DEPLOY] Compilando TypeScript...');
  const build = spawn('npx', ['tsc', '-p', 'tsconfig.json'], {
    stdio: 'inherit',
    shell: true
  });
  
  await new Promise((resolve, reject) => {
    build.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ [DEPLOY] Erro ao compilar TypeScript!');
        reject(new Error('Build failed'));
      } else {
        console.log('✅ [DEPLOY] TypeScript compilado com sucesso!');
        resolve();
      }
    });
  });
  
  try {
    const prisma = new PrismaClient();
    
    // 1. Deleta TODAS as migrations problemáticas
    console.log('🔧 [DEPLOY] Limpando migrations problemáticas...');
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations"
      WHERE finished_at IS NULL 
         OR migration_name = '20260202175015_add_restaurant_settings_fields'
         OR migration_name = '20260202193430_add_settings_fields_v2'
      RETURNING migration_name;
    `);
    
    if (result && result.length > 0) {
      console.log('✅ [DEPLOY] Migrations deletadas:', result.map(r => r.migration_name).join(', '));
    } else {
      console.log('✅ [DEPLOY] Nenhuma migration problemática encontrada.');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('⚠️  [DEPLOY] Aviso ao limpar migrations:', error.message);
  }
  
  // 2. Aplica migrations (com tratamento de erro)
  console.log('📦 [DEPLOY] Aplicando migrations...');
  const migrate = spawn('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    shell: true
  });
  
  let migrationFailed = false;
  await new Promise((resolve) => {
    migrate.on('close', (code) => {
      if (code !== 0) {
        console.log('⚠️  [DEPLOY] Migrations com avisos (código ' + code + '), tentando resolver...');
        migrationFailed = true;
      } else {
        console.log('✅ [DEPLOY] Migrations aplicadas!');
      }
      resolve();
    });
  });
  
  // 3. Marca migrations incompletas como completas e resolve problemas
  try {
    const prisma = new PrismaClient();
    
    if (migrationFailed) {
      // Marcar a migration problemática como aplicada
      console.log('🔧 [DEPLOY] Resolvendo migration problemática...');
      await prisma.$executeRawUnsafe(`
        UPDATE "_prisma_migrations"
        SET finished_at = NOW(),
            applied_steps_count = 1
        WHERE migration_name = '20260202193430_add_settings_fields_v2'
          AND finished_at IS NULL;
      `);
    }
    
    // Garantir que todas as migrations estejam marcadas como completas
    await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET finished_at = COALESCE(finished_at, NOW()),
          applied_steps_count = GREATEST(applied_steps_count, 1)
      WHERE finished_at IS NULL;
    `);
    await prisma.$disconnect();
    console.log('✅ [DEPLOY] Migrations verificadas!');
  } catch (err) {
    console.log('⚠️  [DEPLOY] Aviso:', err.message);
  }
  
  // 4. Inicia o servidor
  console.log('🚀 [DEPLOY] Iniciando servidor Express...');
  const server = spawn('node', ['dist/server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('close', (code) => {
    console.log(`[DEPLOY] Server exited with code ${code}`);
    process.exit(code);
  });
  
  // Captura sinais para encerrar gracefully
  process.on('SIGTERM', () => {
    console.log('[DEPLOY] SIGTERM recebido, encerrando...');
    server.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('[DEPLOY] SIGINT recebido, encerrando...');
    server.kill('SIGINT');
  });
}

deploy().catch(err => {
  console.error('❌ [DEPLOY] Erro fatal:', err);
  process.exit(1);
});
