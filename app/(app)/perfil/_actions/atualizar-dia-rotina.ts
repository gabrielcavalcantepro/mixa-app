"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rotinaDias, type Ocasiao } from "@/db/schema";
import { db } from "@/db";
import { usuarioAutenticado } from "@/lib/auth";

/**
 * Upsert de 1 dia só — substitui o antigo modelo "manda os 7 juntos
 * atrás de um botão Salvar" (ver CLAUDE.md/plano de refinamento). A
 * tira semanal (rotina-editor.tsx) chama isso por `.bind(null, dia,
 * ocasiao)` a cada toque, mesmo padrão de `hoje/_actions/ajustar-hoje.ts`.
 */
export async function atualizarDiaRotina(diaSemana: number, ocasiao: Ocasiao) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  await db
    .insert(rotinaDias)
    .values({ usuarioId: usuario.id, diaSemana, ocasiao })
    .onConflictDoUpdate({ target: [rotinaDias.usuarioId, rotinaDias.diaSemana], set: { ocasiao } });

  revalidatePath("/perfil");
  revalidatePath("/hoje");
}
