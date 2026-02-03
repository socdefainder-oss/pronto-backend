import "dotenv/config";
import express from "express";
import { authRoutes } from "./routes/auth.js";
import { restaurantRoutes } from "./routes/restaurants.js";
import { catalogRoutes } from "./routes/catalog.js";
import { publicRoutes } from "./routes/public.js";
import { ordersRoutes } from "./routes/orders.js";
import couponsRoutes from "./routes/coupons.js";
import bannersRoutes from "./routes/banners.js";
import { adminRoutes } from "./routes/admin.js";
import kitchenRoutes from "./routes/kitchen.js";
import analyticsRoutes from "./routes/analytics.js";
import asaasRoutes from "./routes/asaas.js";
import webhooksRoutes from "./routes/webhooks.js";
import { ensureAdminExists } from "./lib/ensureAdmin.js";

const app = express();

/**
 * Body parser
 */
app.use(express.json());

/**
 * CORS - Middleware customizado para mÃ¡ximo controle
 */
const corsOrigin = process.env.CORS_ORIGIN || "https://pronto-frontend-rust.vercel.app";
const allowedOrigins = corsOrigin.split(",").map(s => s.trim()).filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  
  // Permite se "*" ou se origin estÃ¡ na lista
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
app.get("/api/public/health", (_req, res) => res.json({ status: "ok" }));

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/asaas", asaasRoutes);
app.use("/api/webhooks", webhooksRoutes);

const port = Number(process.env.PORT || 3333);

app.listen(port, async () => {
  console.log(`✅ pronto-backend rodando na porta ${port}`);
  console.log(`🔒 CORS configurado para: ${corsOrigin}`);
  
  // Garante que o admin existe no banco
  await ensureAdminExists();
});


