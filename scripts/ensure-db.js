#!/usr/bin/env node

/**
 * Script que garante que o banco de dados está sincronizado com o schema
 * Se as migrações falharem, tenta db push como fallback
 */

import { execSync } from "child_process";

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

console.log("🔄 Verificando estado do banco de dados...");

try {
  // Tenta aplicar migrações
  console.log("📦 Aplicando migrações...");
  execSync("npx prisma migrate deploy --skip-generate", {
    stdio: "inherit",
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
