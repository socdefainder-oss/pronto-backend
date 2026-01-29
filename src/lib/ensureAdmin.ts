import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export async function ensureAdminExists() {
  try {
    const adminEmail = "admin";
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log("✅ Admin já existe");
      return;
    }

    // Cria admin se não existir
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

    console.log("✅ Usuário admin criado automaticamente!");
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
  } catch (error) {
    console.error("❌ Erro ao verificar/criar admin:", error);
  }
}
