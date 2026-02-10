import { PrismaClient } from "@prisma/client";

// Configuração otimizada para Neon (PostgreSQL serverless)
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Logging em desenvolvimento
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}).$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        // Retry automático em caso de falha de conexão
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await query(args);
          } catch (error: any) {
            lastError = error;
            
            // Erros de conexão que podem ser resolvidos com retry
            const connectionErrors = [
              'P1017', // Server has closed the connection
              'P1001', // Can't reach database server
              'P1002', // The database server was reached but timed out
            ];
            
            if (connectionErrors.includes(error.code) && attempt < maxRetries) {
              console.log(`⚠️  [Prisma] ${error.code} - Tentativa ${attempt}/${maxRetries}...`);
              // Aguarda antes de tentar novamente (backoff exponencial)
              await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
              continue;
            }
            
            throw error;
          }
        }
        
        throw lastError;
      },
    },
  },
});
