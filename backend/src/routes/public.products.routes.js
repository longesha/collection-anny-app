import { Router } from "express";
import database from "../config/database.js";

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

router.get("/", async (_req, res) => {
  try {
    await ensureProductsTable();
    const [rows] = await database.execute(
      "SELECT id, name, category, price, color, image_url, description, stock FROM products ORDER BY created_at DESC"
    );
    res.json({ success: true, products: rows });
  } catch (error) {
    console.error("Public products list:", error);
    res.status(500).json({ success: false, message: "Impossible de charger le catalogue." });
  }
});

export default router;
