import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favoritos } from "@/db/schema";
import { getCatalogoClient } from "@/lib/catalogo/cliente";
import type { FiltroLooksAprovados } from "@/lib/catalogo/tipos";

export async function listarLooksParaNavegar(filtro: FiltroLooksAprovados) {
  return getCatalogoClient().listarLooksAprovados(filtro);
}

/**
 * O cliente do catálogo não tem busca por id (só filtro por
 * ocasião/clima/perfil) — busca tudo e acha localmente. Aceitável no
 * volume atual; revisitar se o catálogo crescer muito.
 */
export async function buscarLookPorId(id: string) {
  const looks = await getCatalogoClient().listarLooksAprovados({});
  return looks.find((look) => look.id === id) ?? null;
}

export async function buscarIdsFavoritos(usuarioId: string): Promise<Set<string>> {
  const linhas = await db.select({ lookId: favoritos.lookId }).from(favoritos).where(eq(favoritos.usuarioId, usuarioId));
  return new Set(linhas.map((linha) => linha.lookId));
}
