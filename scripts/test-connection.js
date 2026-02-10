const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'],
});

async function testConnection() {
  try {
    console.log('🔌 Testando conexão com o banco...');
    
    // Teste 1: Conexão básica
    await prisma.$connect();
    console.log('✅ Conexão estabelecida');
    
    // Teste 2: Query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executada:', result);
    
    // Teste 3: Contagem de usuários
    const userCount = await prisma.user.count();
    console.log(`✅ Usuários no banco: ${userCount}`);
    
    console.log('\n🎉 Todos os testes passaram!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
