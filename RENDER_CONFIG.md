# Configuração do Render

## Build Command
Configure no dashboard do Render:

```bash
npx prisma generate && npm run pre:migrate && npx prisma migrate deploy && npm run build
```

## Start Command
```bash
npm start
```

## Variáveis de Ambiente
- `NODE_VERSION`: 18
- `DATABASE_URL`: (sua connection string do PostgreSQL)
- `JWT_SECRET`: (seu secret para JWT)

## Solução de Problemas

Se houver erro de migration falhada (P3009), o script `pre:migrate` vai automaticamente deletar migrations falhadas para que possam ser reaplicadas.

O comando completo roda nesta ordem:
1. Gera Prisma Client
2. Roda pre-migrate (deleta migrations falhadas)
3. Aplica migrations
4. Builda o TypeScript
