import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Logger opcional de consultas (`DEBUG_SQL=1` no ambiente) — cada linha
 * impressa é 1 ida real ao banco, com timestamp de alta resolução.
 * Usado pra comparar contagem/tempo de consultas entre navegações sem
 * precisar instrumentar nada na mão (ver CLAUDE.md, "Como verificar
 * performance de navegação"). Custo zero quando desligado.
 */
const logger =
  process.env.DEBUG_SQL === "1"
    ? { logQuery: (query: string) => console.log(`[sql ${performance.now().toFixed(1)}ms] ${query}`) }
    : false;

export const db = drizzle(pool, { schema, logger });
