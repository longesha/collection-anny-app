import { Router } from "express";
import database from "../config/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

async function ensureProductsTable() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      category VARCHAR(80) NOT NULL DEFAULT 'Boubous',
      price NUMERIC(10,2) NOT NULL CHECK (price > 0),
      color VARCHAR(80) NOT NULL DEFAULT '',
      image_url TEXT,
      description TEXT,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

const cleanProduct = (body = {}) => ({
  name: String(body.name || "").trim(),
  category: String(body.category || "Boubous").trim(),
  price: Number(body.price),
  color: String(body.color || "").trim(),
  image_url: String(body.image_url || "").trim(),
  description: String(body.description || "").trim(),
  stock: Number(body.stock ?? 0)
});

router.use(requireAuth, requireAdmin);

router.get("/", async (_req, res) => {
  try {
    await ensureProductsTable();
    const result = await database.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error("Admin products list:", error);
    res.status(500).json({ success: false, message: "Impossible de charger les produits." });
  }
});

router.post("/", async (req, res) => {
  try {
    await ensureProductsTable();
    const product = cleanProduct(req.body);
    if (!product.name || !Number.isFinite(product.price) || product.price <= 0 || !Number.isInteger(product.stock) || product.stock < 0) {
      return res.status(400).json({ success: false, message: "Nom, prix positif et stock valide sont obligatoires." });
    }
    const result = await database.query(
      "INSERT INTO products (name, category, price, color, image_url, description, stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [product.name, product.category, product.price, product.color, product.image_url, product.description, product.stock]
    );
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error("Admin product create:", error);
    res.status(500).json({ success: false, message: "Impossible d'ajouter ce produit." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await ensureProductsTable();
    const product = cleanProduct(req.body);
    if (!product.name || !Number.isFinite(product.price) || product.price <= 0 || !Number.isInteger(product.stock) || product.stock < 0) {
      return res.status(400).json({ success: false, message: "Nom, prix positif et stock valide sont obligatoires." });
    }
    const result = await database.query(
      "UPDATE products SET name=$1, category=$2, price=$3, color=$4, image_url=$5, description=$6, stock=$7, updated_at=NOW() WHERE id=$8 RETURNING *",
      [product.name, product.category, product.price, product.color, product.image_url, product.description, product.stock, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error("Admin product update:", error);
    res.status(500).json({ success: false, message: "Impossible de modifier ce produit." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await ensureProductsTable();
    const result = await database.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.json({ success: true, message: "Produit supprimé." });
  } catch (error) {
    console.error("Admin product delete:", error);
    res.status(500).json({ success: false, message: "Impossible de supprimer le produit." });
  }
});

export default router;