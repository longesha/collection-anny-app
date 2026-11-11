import { createHmac, timingSafeEqual } from "node:crypto";

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET manquant dans le fichier .env");
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Token invalide");
  const [payloadPart, signature] = parts;
  const expected = createHmac("sha256", secret).update(payloadPart).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Error("Signature invalide");
  }
  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Session expirée");
  return payload;
}

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ success: false, message: "Connexion requise." });
    req.auth = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Session invalide ou expirée. Veuillez vous reconnecter." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Accès réservé à l'administration." });
  }
  next();
}
