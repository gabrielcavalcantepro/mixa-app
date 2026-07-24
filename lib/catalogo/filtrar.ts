import type { FiltroLooksAprovados, LookAprovado } from "./tipos";

/**
 * Compartilhado por mock.ts e http.ts: a API real do catálogo
 * (`GET /api/v1/looks`) não aceita query params de filtro — devolve a
 * lista inteira (que já É só looks aprovados, a tabela `look` nunca
 * guarda candidato pendente/reprovado) e o filtro é aplicado aqui, do
 * lado do app. O mock replica esse mesmo comportamento.
 */
export function filtrarLooks(looks: LookAprovado[], filtro: FiltroLooksAprovados): LookAprovado[] {
  return looks.filter((look) => {
    if (filtro.ocasiao && !look.ocasioes.includes(filtro.ocasiao)) return false;
    // Look sem clima definido é agnóstico de clima — sempre bate.
    if (filtro.clima && look.clima.length > 0 && !look.clima.includes(filtro.clima)) return false;
    if (filtro.perfisEstilo?.length) {
      const bate = look.perfisEstilo.some((id) => filtro.perfisEstilo!.includes(id));
      if (!bate) return false;
    }
    return true;
  });
}
