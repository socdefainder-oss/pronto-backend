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
const corsOrigin = process.env.CORS_ORIGIN || "https://pronto-frontend-rust.vercel.app";

// Suporta múltiplas origens separadas por vírgula
const allowedOrigins = corsOrigin.split(",").map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Sempre permite requisições sem origin (health checks, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // Se "*" foi configurado, permite qualquer origem
    if (corsOrigin === "*") {
      return callback(null, true);
    }
    
    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Rejeita outras origens
    console.warn(`CORS rejected origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Responde a preflight requests explicitamente
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

const port = Number(process.env.PORT || 3333);

app.listen(port, () => {
  console.log(`✅ pronto-backend rodando na porta ${port}`);
  console.log(`🔐 CORS configurado para: ${corsOrigin}`);
});
