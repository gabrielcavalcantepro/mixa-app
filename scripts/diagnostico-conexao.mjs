/**
 * Diagnóstico direto de conexão — sem depender da UI do `drizzle-kit`
 * (spinner que às vezes não mostra erro nem sucesso claro, ver
 * CLAUDE.md "Onboarding — passada 4"). Mostra se conectou, em qual
 * banco/IP caiu, quais tabelas existem em `public` e o histórico de
 * `__drizzle_migrations`. Usa `DATABASE_URL` do ambiente, igual aos
 * scripts `db:*` do package.json — `npm run db:diagnostico`.
 */
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não está definida nessa sessão do terminal.");
  process.exit(1);
}

const semSenha = url.replace(/:[^:@]+@/, ":***@");
console.log("Conectando em:", semSenha);

const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  console.log("✅ Conectou com sucesso.");

  const db = await client.query("select current_database() as db, inet_server_addr()::text as ip");
  console.log("Banco atual:", db.rows[0].db, "| IP do servidor:", db.rows[0].ip);

  const tabelas = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
  );
  console.log("\nTabelas em public:");
  for (const linha of tabelas.rows) console.log(" -", linha.table_name);

  const migracoes = await client
    .query('select * from drizzle."__drizzle_migrations" order by created_at')
    .catch((e) => ({ erro: e.message }));
  console.log("\nHistórico de migrations aplicadas:");
  if (migracoes.erro) {
    console.log(" (não consegui ler — provavelmente nenhuma migration rodou ainda aqui):", migracoes.erro);
  } else {
    for (const linha of migracoes.rows) console.log(" -", linha.hash ?? linha);
  }
} catch (erro) {
  console.error("❌ Falhou:", erro.message);
  console.error(erro);
} finally {
  await client.end();
}
