import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Mesmos valores de ocasião usados pelo catálogo (ver
 * mixa-catalogo/db/schema/enums.ts `ocasiaoEnum`) — o motor de decisão
 * cruza isso 1:1 com as tags dos looks vindos de lá, então os dois
 * enums precisam continuar sincronizados manualmente (projetos
 * separados, sem schema compartilhado).
 */
export const ocasiaoEnum = pgEnum("ocasiao", [
  "trabalho",
  "lazer",
  "casa",
  "treino",
  "evento",
]);

export type Ocasiao = (typeof ocasiaoEnum.enumValues)[number];
