import type { Ocasiao } from "@/db/schema";

/** Item permanente da rotina — 1 ou mais dias da semana, sem limite de itens por dia. */
export interface ItemRotina {
  id: string;
  rotulo: string;
  emoji: string | null;
  ocasiao: Ocasiao;
  diasSemana: number[];
}

/** Item avulso — "só hoje", ligado a uma data específica, não a um dia da semana. */
export interface ItemAvulso {
  id: string;
  rotulo: string;
  emoji: string | null;
  ocasiao: Ocasiao;
}

/** Um item já resolvido pro dia (fixo ativo ou avulso) — o que a UI mostra. */
export interface ItemResolvido {
  id: string;
  rotulo: string;
  emoji: string | null;
  ocasiao: Ocasiao;
  origem: "fixo" | "avulso";
}

export interface CategoriaDoDia {
  ocasiao: Ocasiao;
  itens: ItemResolvido[];
}
