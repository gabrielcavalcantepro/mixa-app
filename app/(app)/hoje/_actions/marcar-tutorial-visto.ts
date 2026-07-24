"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

export async function marcarTutorialVisto() {
  const usuario = await usuarioAutenticado();
  if (!usuario) return;

  await db
    .update(usuarios)
    .set({ tutorialInstalacaoVistoEm: new Date() })
    .where(eq(usuarios.id, usuario.id));
}
