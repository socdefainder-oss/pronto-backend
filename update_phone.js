import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePhone() {
  try {
    console.log('🔄 Listando restaurantes...');
    
    const restaurants = await prisma.restaurant.findMany();
    console.log(`📋 Total de restaurantes: ${restaurants.length}`);
    
    restaurants.forEach(r => {
      console.log(`- ID: ${r.id} | Nome: ${r.name} | Slug: ${r.slug} | Phone: ${r.phone}`);
    });

    if (restaurants.length === 0) {
      console.log('❌ Nenhum restaurante encontrado');
      return;
    }

    // Atualiza o primeiro restaurante
    const restaurant = restaurants[0];
    console.log(`\n✅ Atualizando: ${restaurant.name}`);
    console.log(`📱 Número atual: ${restaurant.phone}`);

    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { phone: '5511916287735' }
    });

    console.log(`✅ Número atualizado para: ${updated.phone}`);
    console.log('✨ Pronto! O WhatsApp agora está correto.');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePhone();
