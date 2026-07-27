import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favoritos } from "@/db/schema";
import { getCatalogoClient } from "@/lib/catalogo/cliente";
import type { LookAprovado } from "@/lib/catalogo/tipos";

/**
 * Compartilhado por Looks, Favoritos e o detalhe de look — favoritar é
 * a mesma operação em qualquer lugar que aparece, não uma lógica que
 * diverge por tela (diferente do padrão "duplica pequena lógica" usado
 * em formulários, ex.: o quiz de estilo do Perfil vs. onboarding).
 */
export async function buscarIdsFavoritos(usuarioId: string): Promise<Set<string>> {
  const linhas = await db
    .select({ lookId: favoritos.lookId })
    .from(favoritos)
    .where(eq(favoritos.usuarioId, usuarioId));
  return new Set(linhas.map((linha) => linha.lookId));
}

/** Favoritos é o feed de Looks filtrado só pro que foi favoritado — mesma fonte, sem endpoint próprio no catálogo. */
export async function listarLooksFavoritados(usuarioId: string): Promise<LookAprovado[]> {
  const [todos, idsFavoritos] = await Promise.all([
    getCatalogoClient().listarLooksAprovados({}),
    buscarIdsFavoritos(usuarioId),
  ]);
  return todos.filter((look) => idsFavoritos.has(look.id));
}
