import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rotinaDias, usuarioPerfisComplementares, type Ocasiao } from "@/db/schema";
import { getCatalogoClient } from "@/lib/catalogo/cliente";

export async function buscarRotinaAtual(usuarioId: string): Promise<Record<number, Ocasiao>> {
  const linhas = await db
    .select({ diaSemana: rotinaDias.diaSemana, ocasiao: rotinaDias.ocasiao })
    .from(rotinaDias)
    .where(eq(rotinaDias.usuarioId, usuarioId));
  return Object.fromEntries(linhas.map((linha) => [linha.diaSemana, linha.ocasiao]));
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
