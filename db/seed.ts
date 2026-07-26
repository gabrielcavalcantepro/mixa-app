import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { rotinaItens, usuarios } from "./schema";

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

  // Fins de semana ficam sem item de propósito — caem no fallback
  // "casa" do motor de decisão, mesmo comportamento de antes.
  await db.delete(rotinaItens).where(eq(rotinaItens.usuarioId, usuario.id));
  await db.insert(rotinaItens).values({
    usuarioId: usuario.id,
    rotulo: "Trabalho",
    emoji: null,
    ocasiao: "trabalho",
    diasSemana: [1, 2, 3, 4, 5],
  });

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
