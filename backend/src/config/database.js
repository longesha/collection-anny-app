import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL absent : configurez la connexion Neon dans backend/.env.");
}

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

database.on("error", (error) => {
  console.error("Erreur inattendue du pool PostgreSQL :", error);
});

export default database;