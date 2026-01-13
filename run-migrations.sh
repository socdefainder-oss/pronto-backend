#!/bin/bash
set -e

echo "🔄 Verificando status das migrações..."
npx prisma migrate status

echo ""
echo "🚀 Aplicando migrações..."
npx prisma migrate deploy

echo ""
echo "✅ Migrações aplicadas com sucesso!"
echo ""
echo "📊 Começando servidor..."
npm start
