import "dotenv/config";
import express from "express";
import { authRoutes } from "./routes/auth.js";
import { restaurantRoutes } from "./routes/restaurants.js";
import { catalogRoutes } from "./routes/catalog.js";
import { publicRoutes } from "./routes/public.js";
import { ordersRoutes } from "./routes/orders.js";
import couponsRoutes from "./routes/coupons.js";

const app = express();

/**
 * Body parser
 */
app.use(express.json());

/**
 * CORS - Middleware customizado para máximo controle
 */
const corsOrigin = process.env.CORS_ORIGIN || "https://pronto-frontend-rust.vercel.app";
const allowedOrigins = corsOrigin.split(",").map(s => s.trim()).filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  
  // Permite se "*" ou se origin está na lista
  if (corsOrigin === "*" || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  
  // Responde a OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

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
app.use("/api/public", publicRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/coupons", couponsRoutes);

const port = Number(process.env.PORT || 3333);

app.listen(port, () => {
  console.log(`✅ pronto-backend rodando na porta ${port}`);
  console.log(`🔐 CORS configurado para: ${corsOrigin}`);
});
