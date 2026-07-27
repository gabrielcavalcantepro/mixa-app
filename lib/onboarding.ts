import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios } from "@/db/schema";

export type PassoOnboarding = "cidade" | "estilo" | "rotina" | "completo";

/**
 * Onboarding completo é derivado dos dados já preenchidos, não uma flag
 * própria (evita dessincronizar). Usada pra decidir, em qualquer ponto
 * de entrada (raiz, onboarding, abas), pra onde mandar a usuária —
 * inclusive pra "empurrar pra frente" quem já terminou e volta numa URL
 * de onboarding antiga.
 */
export async function proximoPassoOnboarding(usuarioId: string): Promise<PassoOnboarding> {
  const [usuario] = await db
    .select({
      cidade: usuarios.cidade,
      perfilDominanteId: usuarios.perfilDominanteId,
      rotinaConcluidaEm: usuarios.rotinaConcluidaEm,
    })
    .from(usuarios)
    .where(eq(usuarios.id, usuarioId))
    .limit(1);

  if (!usuario) return "cidade";
  if (!usuario.cidade) return "cidade";
  if (!usuario.perfilDominanteId) return "estilo";
  return usuario.rotinaConcluidaEm ? "completo" : "rotina";
}

export function caminhoDoPasso(passo: PassoOnboarding): string {
  if (passo === "completo") return "/hoje";
  return `/onboarding/${passo}`;
}
