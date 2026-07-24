"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favoritos } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

export async function alternarFavorito(formData: FormData) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const lookId = String(formData.get("lookId") ?? "");
  if (!lookId) return;

  const [existente] = await db
    .select({ lookId: favoritos.lookId })
    .from(favoritos)
    .where(and(eq(favoritos.usuarioId, usuario.id), eq(favoritos.lookId, lookId)))
    .limit(1);

  if (existente) {
    await db.delete(favoritos).where(and(eq(favoritos.usuarioId, usuario.id), eq(favoritos.lookId, lookId)));
  } else {
    await db.insert(favoritos).values({ usuarioId: usuario.id, lookId });
  }

  revalidatePath("/looks");
}
