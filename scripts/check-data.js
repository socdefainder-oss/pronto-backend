const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Verificando dados no banco Neon...\n');
    
    // Usuários
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    console.log('👥 USUÁRIOS:');
    users.forEach(u => {
      console.log(`  • ${u.name} (${u.email}) - ${u.role} - Criado em: ${u.createdAt.toLocaleDateString()}`);
    });
    console.log(`  Total: ${users.length} usuários\n`);
    
    // Restaurantes
    const restaurants = await prisma.restaurant.findMany({
      select: { 
        id: true, 
        name: true, 
        slug: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { products: true, categories: true }
        }
      }
    });
    console.log('🍽️  RESTAURANTES:');
    restaurants.forEach(r => {
      console.log(`  • ${r.name} (@${r.slug}) - ${r.isActive ? '✅ Ativo' : '❌ Inativo'}`);
      console.log(`    ${r._count.categories} categorias, ${r._count.products} produtos`);
      console.log(`    Criado em: ${r.createdAt.toLocaleDateString()}`);
    });
    console.log(`  Total: ${restaurants.length} restaurantes\n`);
    
    // Produtos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        priceCents: true,
        isActive: true,
        restaurant: { select: { name: true } },
        category: { select: { name: true } }
      }
    });
    console.log('🍕 PRODUTOS:');
    products.forEach(p => {
      const priceReal = (p.priceCents / 100).toFixed(2);
      console.log(`  • ${p.name} - R$ ${priceReal}`);
      console.log(`    Restaurante: ${p.restaurant.name}`);
      console.log(`    Categoria: ${p.category.name}`);
      console.log(`    Status: ${p.isActive ? '✅ Disponível' : '❌ Indisponível'}`);
    });
    console.log(`  Total: ${products.length} produtos\n`);
    
    // Categorias
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        restaurant: { select: { name: true } },
        _count: { select: { products: true } }
      }
    });
    console.log('📂 CATEGORIAS:');
    categories.forEach(c => {
      console.log(`  • ${c.name} (${c.restaurant.name}) - ${c._count.products} produtos`);
    });
    console.log(`  Total: ${categories.length} categorias\n`);
    
    console.log('✅ Todos os dados estão no banco Neon!');
    console.log(`📊 Resumo: ${users.length} usuários, ${restaurants.length} restaurantes, ${products.length} produtos`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
