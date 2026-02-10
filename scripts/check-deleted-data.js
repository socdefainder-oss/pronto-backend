const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTableSizes() {
  try {
    console.log('🔍 Verificando tamanho das tabelas...\n');
    
    const result = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;
    
    console.log('📊 TAMANHO DAS TABELAS:');
    result.forEach(t => {
      console.log(`  • ${t.tablename.padEnd(30)} ${t.size}`);
    });
    
    console.log('\n🔍 Verificando se há dados "fantasma"...\n');
    
    // Verifica se há IDs que não deveriam existir se o banco fosse novo
    const maxIds = await prisma.$queryRaw`
      SELECT 
        'users' as table_name, 
        MAX(id) as max_id,
        COUNT(*) as count
      FROM users
      UNION ALL
      SELECT 
        'restaurants' as table_name,
        MAX(id) as max_id,
        COUNT(*) as count
      FROM restaurants
      UNION ALL
      SELECT 
        'products' as table_name,
        MAX(id) as max_id,
        COUNT(*) as count
      FROM products
    `;
    
    console.log('🔢 IDs MÁXIMOS (indicam se houve dados deletados):');
    maxIds.forEach(t => {
      console.log(`  • ${t.table_name}: max_id=${t.max_id}, registros=${t.count}`);
      if (t.max_id > t.count) {
        console.log(`    ⚠️  ATENÇÃO: Há GAP! Dados foram deletados!`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableSizes();
