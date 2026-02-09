# Configuração de Deploy no Render

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no Render Dashboard:

### 1. DATABASE_URL (obrigatório)
```
postgresql://user:password@host:5432/database?schema=public&connection_limit=5&pool_timeout=20&connect_timeout=10
```

**Parâmetros importantes:**
- `connection_limit=5` - Limita conexões simultâneas (importante para plano gratuito)
- `pool_timeout=20` - Timeout para pegar conexão do pool (segundos)
- `connect_timeout=10` - Timeout para conectar ao banco (segundos)

### 2. DIRECT_URL (opcional, mas recomendado)
```
postgresql://user:password@host:5432/database?schema=public
```

Use a mesma URL do DATABASE_URL, mas SEM os parâmetros de pool.

### 3. JWT_SECRET (obrigatório)
```
sua-chave-secreta-super-segura-aqui-min-32-chars
```

### 4. PORT (opcional)
```
10000
```
O Render já define automaticamente, mas você pode especificar.

### 5. CORS_ORIGIN (opcional)
```
*
```
Ou especifique domínios:
```
https://pronto-frontend-rust.vercel.app,http://localhost:3000
```

### 6. NODE_ENV (opcional)
```
production
```

## Comandos de Build

No Render, configure:

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start
```

## Troubleshooting

### Erro: "Server has closed the connection"

**Solução 1:** Adicionar parâmetros de pool na DATABASE_URL
```
?connection_limit=5&pool_timeout=20&connect_timeout=10
```

**Solução 2:** Adicionar DIRECT_URL nas variáveis de ambiente

**Solução 3:** Reiniciar o serviço no Render após adicionar as variáveis

### Erro: "Can't reach database server"

- Verifique se o IP do Render está na whitelist do banco (se usar serviço externo)
- Confirme que a DATABASE_URL está correta
- Teste a conexão localmente primeiro

### Erro: "Migration failed"

Execute as migrations manualmente no Render Shell:
```bash
npx prisma migrate deploy
```

## Verificação de Saúde

Após deploy, teste:
```
https://seu-app.onrender.com/api/health
```

Deve retornar:
```json
{"status": "ok"}
```
