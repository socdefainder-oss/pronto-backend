import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.js";
import { restaurantRoutes } from "./routes/restaurants.js";
import { catalogRoutes } from "./routes/catalog.js";
import { publicRoutes } from "./routes/public.js"; // ✅ NOVO

const app = express();

/**
 * Body parser
 */
app.use(express.json());

/**
 * CORS (Render backend -> Vercel frontend)
 * - Lê CORS_ORIGIN do env (pode ser 1 ou mais, separado por vírgula)
 * - Responde preflight (OPTIONS) corretamente
 */
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests server-to-server / ferramentas / health-checks podem vir sem Origin
      if (!origin) return callback(null, true);

      // Se não configurou CORS_ORIGIN, não bloqueia (útil para dev/local)
      if (allowedOrigins.length === 0) return callback(null, true);

      // Permite se estiver na lista
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Bloqueia se não estiver
      return callback(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Responde preflight para qualquer rota (crítico para browser)
app.options("*", cors());

/**
 * Health check
 */
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/public", publicRoutes); // ✅ NOVO

/**
 * Error handler (para erros tipo CORS bloqueado)
 */
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const msg = typeof err?.message === "string" ? err.message : "Erro interno";
    // Se for erro de CORS, responde 403 com mensagem clara
    if (msg.toLowerCase().includes("cors")) {
      return res.status(403).json({ error: msg });
    }
    return res.status(500).json({ error: msg });
  }
);

const port = Number(process.env.PORT || 3333);

app.listen(port, () => {
  console.log(`✅ pronto-backend rodando na porta ${port}`);
  if (allowedOrigins.length > 0) {
    console.log(`🔐 CORS liberado para: ${allowedOrigins.join(", ")}`);
  } else {
    console.log("⚠️ CORS_ORIGIN não definido (CORS aberto). Defina em produção!");
  }
});
