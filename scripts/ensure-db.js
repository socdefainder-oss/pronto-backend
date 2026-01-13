#!/usr/bin/env node

/**
 * Script que garante que o banco de dados está sincronizado com o schema
 * Se as migrações falharem, tenta db push como fallback
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

console.log("🔄 Verificando estado do banco de dados...");

// Garante que o Prisma Client está gerado
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

try {
  // Tenta aplicar migrações
  console.log("📦 Aplicando migrações...");
  execSync("npx prisma migrate deploy --skip-generate", {
    stdio: "inherit",
    cwd: projectRoot,
    env: { ...process.env },
  });
  console.log("✅ Migrações aplicadas com sucesso!");
} catch (migrateError) {
  console.warn("⚠️  Migrate deploy falhou, tentando db push...");
  
  try {
    // Fallback: usar db push que sincroniza o schema diretamente
    console.log("🔧 Sincronizando schema com o banco...");
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
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
