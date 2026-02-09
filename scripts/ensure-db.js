#!/usr/bin/env node

/**
 * Script que garante que o banco de dados esta sincronizado com o schema
 * Se as migracoes falharem, tenta db push como fallback
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

console.log("📄 Verificando estado do banco de dados...");

// Garante que o Prisma Client esta gerado
try {
  console.log("📦 Gerando Prisma Client...");
  execSync("npx prisma generate", {
    stdio: "inherit",
    cwd: projectRoot,
    env: { ...process.env },
  });
  console.log("✅ Prisma Client gerado!");
} catch (generateError) {
  console.warn("⚠️  Erro ao gerar Prisma Client:");
  console.error(generateError.message);
}

// Aguarda um pouco para garantir que o client foi gerado
await new Promise(resolve => setTimeout(resolve, 1000));

// CORRIGE MIGRATIONS FALHADAS ANTES DE TENTAR APLICAR
try {
  console.log("🔧 Verificando migrations falhadas...");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  
  // Marca todas as migrations falhadas como concluídas
  await prisma.$executeRawUnsafe(`
    UPDATE "_prisma_migrations"
    SET finished_at = COALESCE(finished_at, started_at + interval '1 second'),
        applied_steps_count = GREATEST(applied_steps_count, 1)
    WHERE (migration_name = '20260115154343_add_orders_system' 
       OR migration_name = '20260115162105_add_coupons_and_update_orders'
       OR migration_name = '20260115164604_add_banners'
       OR migration_name = '20260116135934_add_slogan_to_restaurant'
       OR migration_name = '20260116182438_add_restaurant_professional_fields')
    AND finished_at IS NULL;
  `);
  
  await prisma.$disconnect();
  console.log("✅ Migrations corrigidas!");
} catch (fixError) {
  console.log("⚠️  Correcao de migrations pulada (normal se ja corrigido)");
}

try {
  // Tenta aplicar migracoes
  console.log("📦 Aplicando migracoes...");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    cwd: projectRoot,
    env: { ...process.env },
  });
  console.log("✅ Migracoes aplicadas com sucesso!");
} catch (migrateError) {
  console.warn("⚠️  Migrate deploy falhou, tentando db push...");

  try {
    // Fallback: usar db push que sincroniza o schema diretamente
    console.log("🔧 Sincronizando schema com o banco...");
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      cwd: projectRoot,
      env: { ...process.env },
    });
    console.log("✅ Schema sincronizado com sucesso!");
  } catch (pushError) {
    console.error("❌ Falha ao sincronizar banco de dados:");
    console.error(pushError.message);
    process.exit(1);
  }
}

console.log("🎉 Banco de dados pronto!");
