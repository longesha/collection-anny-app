import { Router } from "express";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import database from "../config/database.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const scrypt = promisify(scryptCallback);

async function ensureUsersTable() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(30),
      avatar_url TEXT,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await database.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT");
}

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("Configurez JWT_SECRET (au moins 32 caractères) dans backend/.env.");
  const payload = Buffer.from(JSON.stringify({
    sub: String(user.id),
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return salt.toString("hex") + ":" + Buffer.from(derived).toString("hex");
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = Buffer.from(await scrypt(password, Buffer.from(saltHex, "hex"), expected.length));
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar_url: user.avatar_url || "", role: user.role };
}

router.post("/register", async (req, res) => {
  try {
    await ensureUsersTable();
    const { name, email, phone = "", password, role = "customer", adminCode = "" } = req.body || {};
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Nom, téléphone, adresse e-mail et mot de passe sont obligatoires." });
    }
    if (name.trim().length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Veuillez vérifier le nom et l'adresse e-mail." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 8 caractères." });
    }
    if (role !== "customer" && role !== "admin") {
      return res.status(400).json({ success: false, message: "Type de compte invalide." });
    }
    if (role === "admin" && (!process.env.ADMIN_INVITE_CODE || adminCode !== process.env.ADMIN_INVITE_CODE)) {
      return res.status(403).json({ success: false, message: "Code d'invitation administrateur incorrect." });
    }
    const passwordHash = await hashPassword(password);
    const result = await database.query(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash, role]
    );
    const user = { id: result.rows[0].id, name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), role };
    return res.status(201).json({ success: true, message: "Compte créé avec succès.", token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ success: false, message: "Cette adresse e-mail possède déjà un compte." });
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Impossible de créer le compte pour le moment." });
  }
});

router.post("/login", async (req, res) => {
  try {
    await ensureUsersTable();
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) return res.status(400).json({ success: false, message: "E-mail et mot de passe obligatoires." });
    const result = await database.query(
      "SELECT id, name, email, phone, avatar_url, password_hash, role FROM users WHERE email = $1 LIMIT 1",
      [email.trim().toLowerCase()]
    );
    if (!result.rows.length || !(await verifyPassword(password, result.rows[0].password_hash))) {
      return res.status(401).json({ success: false, message: "Adresse e-mail ou mot de passe incorrect." });
    }
    const user = publicUser(result.rows[0]);
    return res.json({ success: true, message: "Connexion réussie.", token: createToken(user), user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Impossible de se connecter pour le moment." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    await ensureUsersTable();
    const result = await database.query(
      "SELECT id, name, email, phone, avatar_url, role FROM users WHERE id = $1 LIMIT 1",
      [req.auth.sub]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Compte introuvable." });
    return res.json({ success: true, user: publicUser(result.rows[0]) });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ success: false, message: "Impossible de charger le profil." });
  }
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    await ensureUsersTable();
    const avatarUrl = req.body?.avatar_url === undefined ? null : String(req.body.avatar_url || "");
    const phone = req.body?.phone === undefined ? null : String(req.body.phone || "").trim();
    if (avatarUrl !== null && (avatarUrl.length > 900000 || (avatarUrl && !avatarUrl.startsWith("data:image/")))) {
      return res.status(400).json({ success: false, message: "Photo invalide ou trop volumineuse." });
    }
    if (phone !== null && (!phone || phone.length > 30)) {
      return res.status(400).json({ success: false, message: "Veuillez saisir un numéro de téléphone valide." });
    }
    const result = await database.query(
      "UPDATE users SET avatar_url=CASE WHEN $1::text IS NULL THEN avatar_url ELSE $1 END, phone=COALESCE($2,phone) WHERE id=$3 RETURNING id, name, email, phone, avatar_url, role",
      [avatarUrl, phone, req.auth.sub]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Compte introuvable." });
    return res.json({ success: true, user: publicUser(result.rows[0]) });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ success: false, message: "Impossible de mettre à jour la photo." });
  }
});

export default router;