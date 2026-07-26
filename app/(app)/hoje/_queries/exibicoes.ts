import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { looksExibidos, type Ocasiao } from "@/db/schema";

/**
 * Ids de looks já mostrados pra essa usuária desde `desde` (inclusive),
 * em qualquer categoria — usado só pra "não repetir look recente"
 * (janela de 14 dias), que continua fazendo sentido no dia inteiro, não
 * por cartão: repetir o mesmo look pra Trabalho e Treino em dias
 * diferentes é igual de estranho.
 */
export async function buscarIdsExibidosDesde(usuarioId: string, desde: Date): Promise<Set<string>> {
  const linhas = await db
    .select({ lookId: looksExibidos.lookId })
    .from(looksExibidos)
    .where(and(eq(looksExibidos.usuarioId, usuarioId), gte(looksExibidos.exibidoEm, desde)));
  return new Set(linhas.map((linha) => linha.lookId));
}

/** Ids de looks já mostrados hoje pra ESSA categoria específica — exclusão do "trocar look" daquele cartão. */
export async function buscarIdsExibidosPorOcasiaoDesde(
  usuarioId: string,
  ocasiao: Ocasiao,
  desde: Date,
): Promise<Set<string>> {
  const linhas = await db
    .select({ lookId: looksExibidos.lookId })
    .from(looksExibidos)
    .where(
      and(
        eq(looksExibidos.usuarioId, usuarioId),
        eq(looksExibidos.ocasiao, ocasiao),
        gte(looksExibidos.exibidoEm, desde),
      ),
    );
  return new Set(linhas.map((linha) => linha.lookId));
}

/** O look mais recente mostrado hoje pra essa categoria (o "look do cartão" atual), se houver. */
export async function buscarUltimoExibidoPorOcasiaoDesde(
  usuarioId: string,
  ocasiao: Ocasiao,
  desde: Date,
): Promise<string | null> {
  const [linha] = await db
    .select({ lookId: looksExibidos.lookId })
    .from(looksExibidos)
    .where(
      and(
        eq(looksExibidos.usuarioId, usuarioId),
        eq(looksExibidos.ocasiao, ocasiao),
        gte(looksExibidos.exibidoEm, desde),
      ),
    )
    .orderBy(desc(looksExibidos.exibidoEm))
    .limit(1);
  return linha?.lookId ?? null;
}

export async function registrarExibicao(usuarioId: string, lookId: string, ocasiao: Ocasiao): Promise<void> {
  await db.insert(looksExibidos).values({ usuarioId, lookId, ocasiao });
}
