import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Criando usuário admin...");

  const adminEmail = "admin";
  const adminPassword = "cArl0551$20!";

  // Verifica se admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log("✅ Usuário admin já existe");
    return;
  }

  // Cria hash da senha
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Cria admin
  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: adminEmail,
      password: passwordHash,
      role: "admin",
      isActive: true
    }
  });

  console.log("✅ Usuário admin criado com sucesso!");
  console.log(`   Email: ${admin.email}`);
  console.log(`   ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
