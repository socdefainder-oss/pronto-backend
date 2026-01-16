# INSTRUÇÕES PARA CORRIGIR O RENDER

## Opção 1: Atualizar Build Command no Painel do Render

1. Acesse: https://dashboard.render.com
2. Clique no serviço "pronto-backend"
3. Vá em "Settings"
4. Na seção "Build & Deploy", encontre "Build Command"
5. Substitua o comando atual por:

```bash
npx prisma generate && node scripts/fix-migrations.js && npx prisma migrate deploy && npm run build
```

6. Clique em "Save Changes"
7. Clique em "Manual Deploy" > "Deploy latest commit"

---

## Opção 2: Executar Fix Manual (MAIS RÁPIDO)

Se você tiver acesso ao shell do Render:

1. No painel do Render, vá em "Shell"
2. Execute:

```bash
node fix-migration.js
```

3. Depois faça um novo deploy manual

---

## O que está acontecendo

A migration `20260115154343_add_orders_system` falhou no meio da execução e ficou marcada como "em andamento" no banco. O Prisma se recusa a rodar novas migrations enquanto houver uma pendente.

O script `fix-migrations.js` marca a migration como concluída para que as novas possam rodar.

---

## Resultado Esperado

Depois do deploy com sucesso, o backend deve:
- ✅ Responder em `/api/health`
- ✅ Ter todas as 5 migrations aplicadas
- ✅ Permitir login/registro
