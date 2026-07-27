import type { LookAprovado } from "@/lib/catalogo/tipos";
import type { Ocasiao } from "@/db/schema";
import type { PesoClima } from "@/lib/clima/tipos";

/**
 * Filtro de múltipla escolha dentro da mesma linha (design.md) —
 * "Trabalho OU Evento" ao mesmo tempo, não só "Trabalho" sozinho. O
 * cliente do catálogo (`FiltroLooksAprovados`) só filtra por 1 valor
 * — usado pelo motor de decisão de Hoje, que sempre quer exatidão de 1
 * critério, nunca "qualquer um destes". Por isso este filtro é local à
 * fatia de Looks, pura e testada, em vez de mexer no filtro
 * compartilhado.
 */
export function filtrarLooksMultiplo(
  looks: LookAprovado[],
  filtro: { ocasioes: Ocasiao[]; climas: PesoClima[] },
): LookAprovado[] {
  return looks.filter((look) => {
    if (filtro.ocasioes.length > 0 && !filtro.ocasioes.some((o) => look.ocasioes.includes(o))) return false;
    // Look sem clima definido é agnóstico de clima — sempre bate, igual ao filtro de 1 valor.
    if (filtro.climas.length > 0 && look.clima.length > 0 && !filtro.climas.some((c) => look.clima.includes(c))) {
      return false;
    }
    return true;
  });
}
