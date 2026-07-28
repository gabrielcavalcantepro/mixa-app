import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { rotinaItens, rotinaItensAvulsos, rotinaItensOcultos } from "@/db/schema";
import type { ItemAvulso, ItemRotina } from "@/lib/rotina/tipos";

export interface DadosRotinaDoDia {
  itens: ItemRotina[];
  avulsos: ItemAvulso[];
  ocultosIds: Set<string>;
}

/**
 * Busca os 3 dados brutos de rotina que o dia precisa — itens fixos,
 * avulsos de hoje e o conjunto de ids ocultados hoje — numa única
 * chamada, buscados 1x só por `hoje/page.tsx` e reaproveitados tanto
 * por `categoriasDoDia` (motor de decisão) quanto por
 * `derivarItensOcultosHoje` (painel "Ajustar hoje"), ambas puras em
 * `lib/rotina/itens-do-dia.ts`. Antes, cada consumidor buscava
 * `rotina_item` de novo por conta própria — 2 idas idênticas ao banco
 * por navegação, confirmado rodando local com `DEBUG_SQL=1`.
 *
 * `itens`/`avulsos` não dependem um do outro — paralelizados; `ocultos`
 * depende dos ids de `itens` pro `inArray`, por isso vem depois.
 */
export async function buscarDadosRotinaDoDia(usuarioId: string, dataISO: string): Promise<DadosRotinaDoDia> {
  const [itens, avulsos] = await Promise.all([
    db
      .select({
        id: rotinaItens.id,
        rotulo: rotinaItens.rotulo,
        emoji: rotinaItens.emoji,
        ocasiao: rotinaItens.ocasiao,
        diasSemana: rotinaItens.diasSemana,
      })
      .from(rotinaItens)
      .where(eq(rotinaItens.usuarioId, usuarioId)),
    db
      .select({
        id: rotinaItensAvulsos.id,
        rotulo: rotinaItensAvulsos.rotulo,
        emoji: rotinaItensAvulsos.emoji,
        ocasiao: rotinaItensAvulsos.ocasiao,
      })
      .from(rotinaItensAvulsos)
      .where(and(eq(rotinaItensAvulsos.usuarioId, usuarioId), eq(rotinaItensAvulsos.data, dataISO))),
  ]);

  const ocultos =
    itens.length === 0
      ? []
      : await db
          .select({ rotinaItemId: rotinaItensOcultos.rotinaItemId })
          .from(rotinaItensOcultos)
          .where(
            and(
              eq(rotinaItensOcultos.data, dataISO),
              inArray(
                rotinaItensOcultos.rotinaItemId,
                itens.map((item) => item.id),
              ),
            ),
          );

  return { itens, avulsos, ocultosIds: new Set(ocultos.map((o) => o.rotinaItemId)) };
}
