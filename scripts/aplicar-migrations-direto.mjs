/**
 * Fallback pra quando `npm run db:migrate` (drizzle-kit) falha em
 * silêncio — sem spinner, sem erro, sem sucesso (visto contra Supabase
 * a partir de PowerShell/Windows, ver CLAUDE.md "Onboarding — passada
 * 4"). Aplica os `.sql` de `db/migrations/` direto via `pg`, na ordem
 * de `meta/_journal.json`, pulando o que já foi aplicado e gravando o
 * hash em `drizzle.__drizzle_migrations` do mesmo jeito que o
 * `drizzle-kit` faria — uma rodada normal de `db:migrate` depois
 * reconhece o que já rodou aqui, sem duplicar. `npm run
 * db:migrate:direto`, com `DATABASE_URL` do ambiente (pra Supabase,
 * usa a conexão **direta**, não o pooler — migrations não se dão bem
 * com pooler).
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "db", "migrations");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não está definida nessa sessão do terminal.");
  process.exit(1);
}

const semSenha = url.replace(/:[^:@]+@/, ":***@");
console.log("Conectando em:", semSenha);

const journal = JSON.parse(readFileSync(join(migrationsDir, "meta", "_journal.json"), "utf-8"));

const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  console.log("✅ Conectou com sucesso.\n");

  await client.query("CREATE SCHEMA IF NOT EXISTS drizzle");
  await client.query(
    `CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )`,
  );

  const aplicadas = await client.query("select hash from drizzle.__drizzle_migrations");
  const hashesAplicados = new Set(aplicadas.rows.map((r) => r.hash));

  for (const entry of journal.entries) {
    const caminho = join(migrationsDir, `${entry.tag}.sql`);
    const sql = readFileSync(caminho, "utf-8");
    const hash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(sql))
      .then((buf) => Buffer.from(buf).toString("hex"));

    if (hashesAplicados.has(hash)) {
      console.log(`⏭  ${entry.tag} — já aplicada, pulando.`);
      continue;
    }

    console.log(`▶  Aplicando ${entry.tag}...`);
    const statements = sql.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);

    await client.query("BEGIN");
    try {
      for (const statement of statements) {
        await client.query(statement);
      }
      await client.query(
        "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
        [hash, entry.when],
      );
      await client.query("COMMIT");
      console.log(`✅ ${entry.tag} aplicada com sucesso.`);
    } catch (erro) {
      await client.query("ROLLBACK");
      throw new Error(`Falhou aplicando ${entry.tag}: ${erro.message}`);
    }
  }

  console.log("\n🎉 Tudo em dia.");
} catch (erro) {
  console.error("❌ Falhou:", erro.message);
  console.error(erro);
  process.exitCode = 1;
} finally {
  await client.end();
}
