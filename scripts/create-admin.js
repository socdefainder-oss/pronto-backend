const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Verificando se admin já existe...');
    
    const adminEmail = "admin";
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin já existe!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nome: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin.id}`);
      return;
    }

    console.log('👤 Criando usuário admin...');
    
    // Credenciais do admin
    const adminPassword = "cArl0551$20!";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: passwordHash,
        role: "admin",
        isActive: true
      }
    });

    console.log('\n🎉 Usuário admin criado com sucesso!');
    console.log('📋 Credenciais:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log('\n⚠️  Guarde essas credenciais em local seguro!');
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
