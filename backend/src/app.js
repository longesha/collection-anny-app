import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminProductsRoutes from "./routes/admin.products.routes.js";
import publicProductsRoutes from "./routes/public.products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Bienvenue sur l'API Collection Anny"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/products", publicProductsRoutes);
app.use("/api/orders", ordersRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.originalUrl}`
  });
});

export default app;
