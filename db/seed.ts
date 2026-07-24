import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { rotinaDias, usuarios } from "./schema";

/**
 * Cria 1 conta já com onboarding completo — atalho pra pular
 * conta/cidade/estilo/rotina repetidamente em desenvolvimento. Não
 * substitui testar o onboarding de verdade (ver CLAUDE.md, "Como
 * verificar"): use uma 2ª conta criada pela UI pra isso.
 *
 * `perfilDominanteId` usa o id fixo do modo mock
 * (CATALOGO_API_MODE=mock, o padrão) — não vale em modo http contra o
 * catálogo real, onde os ids são gerados pelo Postgres de lá.
 */
async function seed() {
  const email = process.env.SEED_USER_EMAIL ?? "teste@mixa.app";
  const senha = process.env.SEED_USER_PASSWORD ?? "mudeisso123";
  const senhaHash = await bcrypt.hash(senha, 10);

  const [usuario] = await db
    .insert(usuarios)
    .values({
      email,
      senhaHash,
      cidade: "São Paulo, SP",
      cidadeLat: "-23.5505",
      cidadeLon: "-46.6333",
      perfilDominanteId: "perfil-classica",
      notificacaoHorario: "07:00:00",
    })
    .onConflictDoUpdate({ target: usuarios.email, set: { senhaHash } })
    .returning();

  await db.delete(rotinaDias).where(eq(rotinaDias.usuarioId, usuario.id));
  await db.insert(rotinaDias).values(
    [0, 1, 2, 3, 4, 5, 6].map((diaSemana) => ({
      usuarioId: usuario.id,
      diaSemana,
      ocasiao: diaSemana === 0 || diaSemana === 6 ? ("casa" as const) : ("trabalho" as const),
    })),
  );

  console.log(`Seed concluído. Login: ${email} / ${senha}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });
