import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { looksExibidos } from "@/db/schema";

/** Ids de looks já mostrados pra essa usuária desde `desde` (inclusive). */
export async function buscarIdsExibidosDesde(usuarioId: string, desde: Date): Promise<Set<string>> {
  const linhas = await db
    .select({ lookId: looksExibidos.lookId })
    .from(looksExibidos)
    .where(and(eq(looksExibidos.usuarioId, usuarioId), gte(looksExibidos.exibidoEm, desde)));
  return new Set(linhas.map((linha) => linha.lookId));
}

/** O look mais recente mostrado hoje (o "look do dia" atual), se houver. */
export async function buscarUltimoExibidoDesde(usuarioId: string, desde: Date): Promise<string | null> {
  const [linha] = await db
    .select({ lookId: looksExibidos.lookId })
    .from(looksExibidos)
    .where(and(eq(looksExibidos.usuarioId, usuarioId), gte(looksExibidos.exibidoEm, desde)))
    .orderBy(desc(looksExibidos.exibidoEm))
    .limit(1);
  return linha?.lookId ?? null;
}

export async function registrarExibicao(usuarioId: string, lookId: string): Promise<void> {
  await db.insert(looksExibidos).values({ usuarioId, lookId });
}
