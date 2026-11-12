import { Router } from "express";
import database from "../config/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    await database.query("CREATE TABLE IF NOT EXISTS orders (id BIGSERIAL PRIMARY KEY, reference VARCHAR(40) NOT NULL UNIQUE, user_id BIGINT NOT NULL REFERENCES users(id), customer_name VARCHAR(120) NOT NULL, customer_phone VARCHAR(30) NOT NULL, total NUMERIC(12,2) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
    const result = await database.query(`
      SELECT
        u.id, u.name, u.email, u.phone, u.avatar_url, u.created_at,
        COUNT(DISTINCT o.id)::int AS order_count,
        COALESCE(SUM(o.total), 0)::numeric(12,2) AS total_spent,
        MAX(o.created_at) AS last_order_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'reference', o.reference,
              'total', o.total,
              'status', o.status,
              'created_at', o.created_at
            ) ORDER BY o.created_at DESC
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'::json
        ) AS orders
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, customers: result.rows });
  } catch (error) {
    console.error("Admin customers:", error);
    res.status(500).json({ success: false, message: "Impossible de charger les clients." });
  }
});

export default router;
