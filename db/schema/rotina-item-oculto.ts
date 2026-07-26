import { date, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { rotinaItens } from "./rotina-item";

/**
 * Esconde 1 item fixo numa data específica, sem apagar a recorrência
 * dele (design.md: "hoje não vou treinar" não cancela o treino de toda
 * semana, só o de hoje). Puro marcador — a linha existir já é o
 * suficiente, não guarda mais nada.
 */
export const rotinaItensOcultos = pgTable(
  "rotina_item_oculto",
  {
    rotinaItemId: uuid("rotina_item_id")
      .notNull()
      .references(() => rotinaItens.id, { onDelete: "cascade" }),
    data: date("data", { mode: "string" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.rotinaItemId, t.data] })],
);

export type RotinaItemOculto = typeof rotinaItensOcultos.$inferSelect;
