import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favoritos } from "@/db/schema";
import { getCatalogoClient } from "@/lib/catalogo/cliente";
import type { FiltroLooksAprovados } from "@/lib/catalogo/tipos";

export async function listarLooksParaNavegar(filtro: FiltroLooksAprovados) {
  return getCatalogoClient().listarLooksAprovados(filtro);
}

export async function buscarIdsFavoritos(usuarioId: string): Promise<Set<string>> {
  const linhas = await db.select({ lookId: favoritos.lookId }).from(favoritos).where(eq(favoritos.usuarioId, usuarioId));
  return new Set(linhas.map((linha) => linha.lookId));
}
