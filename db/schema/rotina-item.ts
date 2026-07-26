import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";
import { ocasiaoEnum } from "./enums";

/**
 * Item permanente da rotina — rótulo livre + 1 categoria + os dias da
 * semana em que ele acontece (array, não 1 linha por dia: um dia pode
 * ter vários itens, de categorias iguais ou diferentes, sem exclusão
 * nenhuma — design.md, "correção de modelo"). Cada valor dentro do
 * array segue a mesma convenção de sempre pra dia da semana
 * (`Date.getDay()`: 0 = domingo … 6 = sábado).
 */
export const rotinaItens = pgTable("rotina_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  rotulo: text("rotulo").notNull(),
  emoji: text("emoji"),
  ocasiao: ocasiaoEnum("ocasiao").notNull(),
  diasSemana: integer("dias_semana").array().notNull(),
});

export type RotinaItem = typeof rotinaItens.$inferSelect;
export type NovoRotinaItem = typeof rotinaItens.$inferInsert;
