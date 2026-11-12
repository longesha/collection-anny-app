import { Router } from "express";
import database from "../config/database.js";

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

async function importDemoBoubousOnce() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      migration_key VARCHAR(120) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationKey = "import_demo_boubous_2026_11";
  const migration = await database.query(
    "SELECT migration_key FROM app_migrations WHERE migration_key = $1",
    [migrationKey]
  );
  if (migration.rowCount) return;

  const demoBoubous = [
    ["Boubou Bleu Royal", "Boubous", 58, "Bleu royal", "https://m.media-amazon.com/images/I/81EU2EPVKHL._AC_SL1000__.jpg", "Un boubou long bleu royal, ample et élégant, avec broderies colorées et foulard assorti.", 5],
    ["Boubou Vert Émeraude", "Boubous", 62, "Vert et or", "https://i.etsystatic.com/63702679/r/il/ebf201/8078906593/il_1080xN.8078906593_4r20.jpg", "Un boubou fluide vert profond rehaussé de broderies dorées pour les grandes occasions.", 5],
    ["Boubou Noir Brodé", "Boubous", 55, "Noir et or", "https://static.wixstatic.com/media/95e191_477e9bea36384a69a1fce133ae2fa54a~mv2.jpg/v1/fill/w_980%2Ch_980%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/95e191_477e9bea36384a69a1fce133ae2fa54a~mv2.jpg", "Une coupe ample et majestueuse, décorée de motifs brodés contrastants.", 5],
    ["Boubou Rouge Prestige", "Boubous", 64, "Rouge et or", "https://ae01.alicdn.com/kf/S20fa898822ac4d35858b8db58144519fb/Robes-africaines-pour-femmes-broderie-Bazin-Riche-style-libre-avec-charpe.jpg", "Un boubou rouge profond avec broderies dorées et foulard coordonné.", 5],
    ["Boubou Rose Lumière", "Boubous", 60, "Rose et or", "https://i.etsystatic.com/26939186/r/il/5c14dc/6177801014/il_1588xN.6177801014_ircx.jpg", "Une tenue ample rose poudré ornée de détails dorés raffinés.", 5],
    ["Boubou Vert Tradition", "Boubous", 59, "Vert et jaune", "https://i.etsystatic.com/26939186/r/il/3dd7f6/6225851327/il_794xN.6225851327_hax4.jpg", "Un modèle traditionnel en bazin riche, aux manches larges et motifs brodés.", 5]
  ];

  for (const product of demoBoubous) {
    const existing = await database.query(
      "SELECT id FROM products WHERE name = $1 LIMIT 1",
      [product[0]]
    );
    if (!existing.rowCount) {
      await database.query(
        "INSERT INTO products (name, category, price, color, image_url, description, stock) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        product
      );
    }
  }

  await database.query(
    "INSERT INTO app_migrations (migration_key) VALUES ($1) ON CONFLICT (migration_key) DO NOTHING",
    [migrationKey]
  );
}

router.get("/", async (_req, res) => {
  try {
    await ensureProductsTable();
    await importDemoBoubousOnce();
    const result = await database.query(
      "SELECT id, name, category, price, color, image_url, description, stock FROM products ORDER BY created_at DESC"
    );
    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error("Public products list:", error);
    res.status(500).json({ success: false, message: "Impossible de charger le catalogue." });
  }
});

export default router;