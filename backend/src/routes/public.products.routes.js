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

async function importDemoBoubousOnce() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      migration_key VARCHAR(120) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const migrationKey = "import_demo_boubous_2026_11";
  const [migrations] = await database.execute(
    "SELECT migration_key FROM app_migrations WHERE migration_key = ?",
    [migrationKey]
  );
  if (migrations.length) return;

  const demoBoubous = [
    ["Boubou Bleu Royal", "Boubous", 58, "Bleu royal", "https://m.media-amazon.com/images/I/81EU2EPVKHL._AC_SL1000__.jpg", "Un boubou long bleu royal, ample et élégant, avec broderies colorées et foulard assorti.", 5],
    ["Boubou Vert Émeraude", "Boubous", 62, "Vert et or", "https://i.etsystatic.com/63702679/r/il/ebf201/8078906593/il_1080xN.8078906593_4r20.jpg", "Un boubou fluide vert profond rehaussé de broderies dorées pour les grandes occasions.", 5],
    ["Boubou Noir Brodé", "Boubous", 55, "Noir et or", "https://static.wixstatic.com/media/95e191_477e9bea36384a69a1fce133ae2fa54a~mv2.jpg/v1/fill/w_980%2Ch_980%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/95e191_477e9bea36384a69a1fce133ae2fa54a~mv2.jpg", "Une coupe ample et majestueuse, décorée de motifs brodés contrastants.", 5],
    ["Boubou Rouge Prestige", "Boubous", 64, "Rouge et or", "https://ae01.alicdn.com/kf/S20fa898822ac4d35858b8db58144519fb/Robes-africaines-pour-femmes-broderie-Bazin-Riche-style-libre-avec-charpe.jpg", "Un boubou rouge profond avec broderies dorées et foulard coordonné.", 5],
    ["Boubou Rose Lumière", "Boubous", 60, "Rose et or", "https://i.etsystatic.com/26939186/r/il/5c14dc/6177801014/il_1588xN.6177801014_ircx.jpg", "Une tenue ample rose poudré ornée de détails dorés raffinés.", 5],
    ["Boubou Vert Tradition", "Boubous", 59, "Vert et jaune", "https://i.etsystatic.com/26939186/r/il/3dd7f6/6225851327/il_794xN.6225851327_hax4.jpg", "Un modèle traditionnel en bazin riche, aux manches larges et motifs brodés.", 5]
  ];

  for (const product of demoBoubous) {
    const [existing] = await database.execute(
      "SELECT id FROM products WHERE name = ? LIMIT 1",
      [product[0]]
    );
    if (!existing.length) {
      await database.execute(
        "INSERT INTO products (name, category, price, color, image_url, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
        product
      );
    }
  }

  await database.execute(
    "INSERT INTO app_migrations (migration_key) VALUES (?)",
    [migrationKey]
  );
}

router.get("/", async (_req, res) => {
  try {
    await ensureProductsTable();
    await importDemoBoubousOnce();
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
