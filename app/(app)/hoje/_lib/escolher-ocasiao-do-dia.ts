import type { Ocasiao } from "@/db/schema";

/**
 * Ocasião efetiva do dia: o ajuste manual "hoje eu vou..." tem
 * prioridade sobre a rotina padrão, quando presente. `"casa"` é a rede
 * de segurança final — não deveria ocorrer na prática (onboarding
 * sempre grava as 7 linhas de rotina), mas mantém a função total.
 */
export function escolherOcasiaoDoDia(input: {
  ajusteDeHoje: Ocasiao | null;
  ocasiaoDaRotina: Ocasiao | null;
}): Ocasiao {
  return input.ajusteDeHoje ?? input.ocasiaoDaRotina ?? "casa";
}
