import { getCatalogoClient } from "@/lib/catalogo/cliente";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import type { Ocasiao } from "@/db/schema";
import type { PesoClima } from "@/lib/clima/tipos";

export interface CriteriosDoDia {
  ocasiao: Ocasiao;
  clima: PesoClima;
  perfilDominanteId: string;
  perfisComplementaresIds: string[];
}

/** Busca candidatos no catálogo (clima+ocasião+estilo) e ordena com preferência pro perfil dominante. */
export async function buscarCandidatos(criterios: CriteriosDoDia): Promise<LookAprovado[]> {
  const catalogo = getCatalogoClient();
  return catalogo.listarLooksAprovados({
    ocasiao: criterios.ocasiao,
    clima: criterios.clima,
    perfisEstilo: [criterios.perfilDominanteId, ...criterios.perfisComplementaresIds],
  });
}

/**
 * Escolhe 1 look dentre os candidatos — pura, sem I/O, por isso
 * testável direto. `camadasDeExclusao` é tentada em ordem (mais
 * restritiva primeiro): a primeira camada que ainda deixa candidatos
 * sobrando vence; se todas esvaziarem o resultado, cai pros candidatos
 * completos sem exclusão nenhuma (catálogo pequeno pode genuinamente não
 * ter alternativa — melhor repetir um look do que não mostrar nada).
 *
 * Desempate: 1) look que bate o perfil dominante (não só complementar),
 * 2) cápsula mais recente, 3) id (estabilidade determinística).
 */
export function escolherLook(input: {
  candidatos: LookAprovado[];
  perfilDominanteId: string;
  camadasDeExclusao: Set<string>[];
}): LookAprovado | null {
  const { candidatos, perfilDominanteId, camadasDeExclusao } = input;
  if (candidatos.length === 0) return null;

  let pool = candidatos;
  for (const excluidos of camadasDeExclusao) {
    const filtrado = candidatos.filter((look) => !excluidos.has(look.id));
    if (filtrado.length > 0) {
      pool = filtrado;
      break;
    }
  }

  const ordenados = [...pool].sort((a, b) => {
    const prefA = a.perfisEstilo.includes(perfilDominanteId) ? 0 : 1;
    const prefB = b.perfisEstilo.includes(perfilDominanteId) ? 0 : 1;
    if (prefA !== prefB) return prefA - prefB;

    const capsulaDiff =
      new Date(b.capsula.dataLancamento).getTime() - new Date(a.capsula.dataLancamento).getTime();
    if (capsulaDiff !== 0) return capsulaDiff;

    return a.id.localeCompare(b.id);
  });

  return ordenados[0];
}
