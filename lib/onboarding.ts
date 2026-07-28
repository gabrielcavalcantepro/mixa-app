import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios, type Usuario } from "@/db/schema";

export type PassoOnboarding = "cidade" | "estilo" | "rotina" | "completo";

type CamposOnboarding = Pick<Usuario, "cidade" | "perfilDominanteId" | "rotinaConcluidaEm">;

/**
 * Pura, sem consulta — deriva o passo a partir de campos já carregados.
 * Extraída de `proximoPassoOnboarding` pra `(app)/layout.tsx` poder
 * reaproveitar o `usuario` que `usuarioAutenticado()` já buscou, em vez
 * de disparar uma 2ª consulta idêntica só pra reler os mesmos 3 campos
 * (confirmado redundante rodando local com `DEBUG_SQL=1`).
 */
export function derivarPassoOnboarding(usuario: CamposOnboarding): PassoOnboarding {
  if (!usuario.cidade) return "cidade";
  if (!usuario.perfilDominanteId) return "estilo";
  return usuario.rotinaConcluidaEm ? "completo" : "rotina";
}

/**
 * Onboarding completo é derivado dos dados já preenchidos, não uma flag
 * própria (evita dessincronizar). Usada pra decidir, em qualquer ponto
 * de entrada que só tem o id da sessão (raiz, login, cada passo do
 * onboarding) pra onde mandar a usuária — inclusive pra "empurrar pra
 * frente" quem já terminou e volta numa URL de onboarding antiga.
 * Quem já tem a linha completa da usuária (`(app)/layout.tsx`, via
 * `usuarioAutenticado()`) deve usar `derivarPassoOnboarding` direto,
 * sem passar por esta função — evita reconsultar.
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
  return derivarPassoOnboarding(usuario);
}

export function caminhoDoPasso(passo: PassoOnboarding): string {
  if (passo === "completo") return "/hoje";
  return `/onboarding/${passo}`;
}
