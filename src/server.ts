import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.js";
import { restaurantRoutes } from "./routes/restaurants.js";
import { catalogRoutes } from "./routes/catalog.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map(s => s.trim()) ?? "*",
    credentials: true
  })
);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/catalog", catalogRoutes);

const port = Number(process.env.PORT || 3333);
app.listen(port, () => {
  console.log(`✅ pronto-backend rodando na porta ${port}`);
});
