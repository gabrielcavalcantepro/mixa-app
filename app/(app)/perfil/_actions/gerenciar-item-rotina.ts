"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { ocasiaoEnum, rotinaItens } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

const itemSchema = z.object({
  rotulo: z.string().trim().min(1).max(60),
  emoji: z.string().trim().max(8).nullable(),
  ocasiao: z.enum(ocasiaoEnum.enumValues),
  diasSemana: z.array(z.number().int().min(0).max(6)).min(1),
});

/**
 * Substitui o antigo `atualizarDiaRotina` (upsert por dia, preso à PK
 * `(usuarioId, diaSemana)` que não existe mais — um dia agora aceita
 * vários itens). Cada toque no editor (rotina-editor.tsx) já é a ação,
 * sem botão "Salvar" — mesmo padrão de UI otimista do resto do app.
 */
export async function adicionarItemRotina(input: z.infer<typeof itemSchema>) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return;

  await db.insert(rotinaItens).values({ usuarioId: usuario.id, ...parsed.data });

  revalidatePath("/perfil");
  revalidatePath("/hoje");
}

export async function atualizarItemRotina(id: string, input: z.infer<typeof itemSchema>) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return;

  await db
    .update(rotinaItens)
    .set(parsed.data)
    .where(and(eq(rotinaItens.id, id), eq(rotinaItens.usuarioId, usuario.id)));

  revalidatePath("/perfil");
  revalidatePath("/hoje");
}

export async function removerItemRotina(id: string) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  await db.delete(rotinaItens).where(and(eq(rotinaItens.id, id), eq(rotinaItens.usuarioId, usuario.id)));

  revalidatePath("/perfil");
  revalidatePath("/hoje");
}
