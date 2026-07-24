import type { Ocasiao } from "@/db/schema";

export interface DiaDaSemana {
  diaSemana: number;
  ocasiao: Ocasiao;
}

/**
 * Ponto de partida da rotina semanal a partir das respostas do
 * onboarding — editável dia a dia depois no Perfil. Regra assumida
 * (documentada no CLAUDE.md): treino tem prioridade sobre trabalho num
 * dia marcado como os dois; dias sem marcação nenhuma viram "casa".
 * `diaSemana` segue `Date.getDay()`: 0 = domingo … 6 = sábado.
 */
export function derivarMapaSemana(input: { diasTrabalho: number[]; diasTreino: number[] }): DiaDaSemana[] {
  const diasTreino = new Set(input.diasTreino);
  const diasTrabalho = new Set(input.diasTrabalho);

  return Array.from({ length: 7 }, (_, diaSemana) => {
    let ocasiao: Ocasiao = "casa";
    if (diasTreino.has(diaSemana)) ocasiao = "treino";
    else if (diasTrabalho.has(diaSemana)) ocasiao = "trabalho";
    return { diaSemana, ocasiao };
  });
}
