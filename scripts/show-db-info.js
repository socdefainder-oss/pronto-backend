const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showDatabaseInfo() {
  try {
    console.log('🔍 INFORMAÇÕES DO BANCO DE DADOS CONECTADO:\n');
    
    // Mostra a connection string (sem senha)
    const dbUrl = process.env.DATABASE_URL || 'NÃO DEFINIDA';
    const sanitized = dbUrl.replace(/:[^:@]+@/, ':***@');
    console.log(`📡 DATABASE_URL: ${sanitized}\n`);
    
    // Informações do servidor
    const serverInfo = await prisma.$queryRaw`
      SELECT 
        version() as version,
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `;
    
    console.log('🖥️  SERVIDOR:');
    console.log(`  • Versão: ${serverInfo[0].version}`);
    console.log(`  • Database: ${serverInfo[0].database}`);
    console.log(`  • User: ${serverInfo[0].user}`);
    console.log(`  • IP: ${serverInfo[0].server_ip}`);
    console.log(`  • Port: ${serverInfo[0].server_port}`);
    
    // Verifica o host pela URL
    const urlMatch = dbUrl.match(/@([^:\/]+)/);
    const host = urlMatch ? urlMatch[1] : 'desconhecido';
    
    console.log('\n🏷️  IDENTIFICAÇÃO:');
    if (host.includes('render')) {
      console.log('  ⚠️  BANCO DO RENDER (PostgreSQL interno)');
    } else if (host.includes('neon')) {
      console.log('  ✅ BANCO DO NEON (PostgreSQL serverless)');
    } else if (host.includes('railway')) {
      console.log('  🚂 BANCO DO RAILWAY');
    } else {
      console.log(`  ❓ Host: ${host}`);
    }
    
    // Conta registros
    const [users, restaurants, products] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.product.count()
    ]);
    
    console.log('\n📊 DADOS:');
    console.log(`  • Usuários: ${users}`);
    console.log(`  • Restaurantes: ${restaurants}`);
    console.log(`  • Produtos: ${products}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showDatabaseInfo();
