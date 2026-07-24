import { startOfDay, subDays } from "date-fns";
import type { Usuario } from "@/db/schema";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import { montarCriteriosDoDia } from "./contexto";
import { buscarIdsExibidosDesde, buscarUltimoExibidoDesde, registrarExibicao } from "./exibicoes";
import { buscarCandidatos, escolherLook, type CriteriosDoDia } from "../_lib/motor-decisao";

export interface LookDoDiaResultado {
  look: LookAprovado | null;
  criterios: CriteriosDoDia;
}

/**
 * Ponto de entrada usado pela renderização normal da página: estável
 * entre reloads (reaproveita o look já registrado hoje, se ele ainda
 * bate com o critério atual) e só escolhe de novo quando não há nada
 * pra hoje ainda, ou quando o critério mudou (ex.: "hoje eu vou..." —
 * o look antigo deixa de aparecer nos candidatos frescos e isso já
 * dispara uma nova escolha, sem lógica especial pro ajuste).
 */
export async function obterLookDoDia(usuario: Usuario): Promise<LookDoDiaResultado> {
  const criterios = await montarCriteriosDoDia(usuario);
  const candidatos = await buscarCandidatos(criterios);

  const inicioDoDia = startOfDay(new Date());
  const idExibidoHoje = await buscarUltimoExibidoDesde(usuario.id, inicioDoDia);

  if (idExibidoHoje) {
    const aindaValido = candidatos.find((look) => look.id === idExibidoHoje);
    if (aindaValido) return { look: aindaValido, criterios };
  }

  const idsRecentes = await buscarIdsExibidosDesde(usuario.id, subDays(inicioDoDia, 14));
  const idsHoje = idExibidoHoje ? new Set([idExibidoHoje]) : new Set<string>();

  const escolhido = escolherLook({
    candidatos,
    perfilDominanteId: criterios.perfilDominanteId,
    camadasDeExclusao: [idsRecentes, idsHoje],
  });

  if (escolhido) await registrarExibicao(usuario.id, escolhido.id);

  return { look: escolhido, criterios };
}
