import { Router } from "express";
import database from "../config/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

async function ensureProductsTable() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      category VARCHAR(80) NOT NULL DEFAULT 'Boubous',
      price DECIMAL(10,2) NOT NULL,
      color VARCHAR(80) NOT NULL DEFAULT '',
      image_url TEXT NULL,
      description TEXT NULL,
      stock INT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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
    const [rows] = await database.execute("SELECT * FROM products ORDER BY created_at DESC");
    res.json({ success: true, products: rows });
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
    const [result] = await database.execute(
      "INSERT INTO products (name, category, price, color, image_url, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [product.name, product.category, product.price, product.color, product.image_url, product.description, product.stock]
    );
    const [rows] = await database.execute("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, product: rows[0] });
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
    const [result] = await database.execute(
      "UPDATE products SET name=?, category=?, price=?, color=?, image_url=?, description=?, stock=? WHERE id=?",
      [product.name, product.category, product.price, product.color, product.image_url, product.description, product.stock, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Produit introuvable." });
    const [rows] = await database.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true, product: rows[0] });
  } catch (error) {
    console.error("Admin product update:", error);
    res.status(500).json({ success: false, message: "Impossible de modifier ce produit." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await ensureProductsTable();
    const [result] = await database.execute("DELETE FROM products WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Produit introuvable." });
    res.json({ success: true, message: "Produit supprimé." });
  } catch (error) {
    console.error("Admin product delete:", error);
    res.status(500).json({ success: false, message: "Impossible de supprimer ce produit." });
  }
});

export default router;
