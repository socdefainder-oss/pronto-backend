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
 */
const corsOrigin = process.env.CORS_ORIGIN || "*";
const corsWhitelist = corsOrigin === "*" 
  ? "*" 
  : corsOrigin.split(",").map(s => s.trim());

const corsOptions = {
  origin: corsWhitelist,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Responde explicitamente a preflight em todas as rotas
app.options("*", cors(corsOptions));

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
  console.log(`🔐 CORS configurado para: ${corsOrigin}`);
});
