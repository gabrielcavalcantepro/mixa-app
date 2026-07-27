"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

/**
 * Movida de `hoje/_actions/` pra cá: o card de instalar app saiu de
 * Hoje e virou a 1ª entrada da central de notificações, acessível de
 * qualquer aba (design.md) — deixou de ser algo específico da fatia
 * Hoje, então não podia mais morar lá (convenção: nada de importar
 * `_actions` de uma fatia a partir de outra).
 */
export async function marcarTutorialVisto() {
  const usuario = await usuarioAutenticado();
  if (!usuario) return;

  await db
    .update(usuarios)
    .set({ tutorialInstalacaoVistoEm: new Date() })
    .where(eq(usuarios.id, usuario.id));

  revalidatePath("/", "layout");
}
