import { Router } from "express";
import database from "../config/database.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
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
