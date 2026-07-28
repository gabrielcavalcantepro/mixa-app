import { startOfDay, subDays } from "date-fns";
import type { Usuario } from "@/db/schema";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import type { ItemResolvido } from "@/lib/rotina/tipos";
import { montarCriteriosDoDia } from "./contexto";
import type { DadosRotinaDoDia } from "./itens-rotina";
import {
  buscarIdsExibidosDesde,
  buscarIdsExibidosPorOcasiaoDesde,
  buscarUltimoExibidoPorOcasiaoDesde,
  registrarExibicao,
} from "./exibicoes";
import { buscarCandidatos, escolherLook, type CriteriosDoDia } from "../_lib/motor-decisao";

export interface CartaoDoDia {
  ocasiao: CriteriosDoDia["ocasiao"];
  look: LookAprovado | null;
  itens: ItemResolvido[];
}

/**
 * Ponto de entrada usado pela renderização normal da página: 1 cartão
 * por categoria distinta do dia (design.md), cada um estável entre
 * reloads (reaproveita o look já registrado hoje **pra aquela
 * categoria**, se ele ainda bate com o critério atual) e só escolhe de
 * novo quando não há nada ainda pra aquele cartão, ou quando o critério
 * mudou (o look antigo deixa de aparecer nos candidatos frescos e isso
 * já dispara nova escolha, sem lógica especial). `dadosRotina` vem de
 * quem chamou (ver `hoje/page.tsx`), buscado 1x só.
 *
 * `criteriosPorCategoria` e `idsRecentes` não dependem um do outro —
 * paralelizados. Dentro de cada categoria, `candidatos` (catálogo) e
 * `idExibidoHoje` (banco) também não dependem entre si — idem. Antes
 * era tudo `await` sequencial sem necessidade (confirmado rodando
 * local com `DEBUG_SQL=1`).
 */
export async function obterLooksDoDia(usuario: Usuario, dadosRotina: DadosRotinaDoDia): Promise<CartaoDoDia[]> {
  const inicioDoDia = startOfDay(new Date());
  const [criteriosPorCategoria, idsRecentes] = await Promise.all([
    montarCriteriosDoDia(usuario, dadosRotina),
    buscarIdsExibidosDesde(usuario.id, subDays(inicioDoDia, 14)),
  ]);

  return Promise.all(
    criteriosPorCategoria.map(async (criterios): Promise<CartaoDoDia> => {
      const [candidatos, idExibidoHoje] = await Promise.all([
        buscarCandidatos(criterios),
        buscarUltimoExibidoPorOcasiaoDesde(usuario.id, criterios.ocasiao, inicioDoDia),
      ]);

      if (idExibidoHoje) {
        const aindaValido = candidatos.find((look) => look.id === idExibidoHoje);
        if (aindaValido) return { ocasiao: criterios.ocasiao, look: aindaValido, itens: criterios.itens };
      }

      const idsHojeDestaCategoria = await buscarIdsExibidosPorOcasiaoDesde(
        usuario.id,
        criterios.ocasiao,
        inicioDoDia,
      );

      const escolhido = escolherLook({
        candidatos,
        perfilDominanteId: criterios.perfilDominanteId,
        camadasDeExclusao: [idsRecentes, idsHojeDestaCategoria],
      });

      if (escolhido) await registrarExibicao(usuario.id, escolhido.id, criterios.ocasiao);

      return { ocasiao: criterios.ocasiao, look: escolhido, itens: criterios.itens };
    }),
  );
}
