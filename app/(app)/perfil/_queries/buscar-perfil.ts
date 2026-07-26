import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rotinaItens, usuarioPerfisComplementares } from "@/db/schema";
import { getCatalogoClient } from "@/lib/catalogo/cliente";
import type { ItemRotina } from "@/lib/rotina/tipos";

export async function buscarItensRotina(usuarioId: string): Promise<ItemRotina[]> {
  return db
    .select({
      id: rotinaItens.id,
      rotulo: rotinaItens.rotulo,
      emoji: rotinaItens.emoji,
      ocasiao: rotinaItens.ocasiao,
      diasSemana: rotinaItens.diasSemana,
    })
    .from(rotinaItens)
    .where(eq(rotinaItens.usuarioId, usuarioId));
}

export async function buscarComplementaresAtuais(usuarioId: string): Promise<string[]> {
  const linhas = await db
    .select({ perfilEstiloId: usuarioPerfisComplementares.perfilEstiloId })
    .from(usuarioPerfisComplementares)
    .where(eq(usuarioPerfisComplementares.usuarioId, usuarioId));
  return linhas.map((linha) => linha.perfilEstiloId);
}

export async function buscarPerfisDeEstilo() {
  return getCatalogoClient().listarPerfisEstilo();
}
