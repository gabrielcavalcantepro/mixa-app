import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";
import { ocasiaoEnum } from "./enums";

/**
 * Item avulso — "só hoje", ligado a uma data específica (não a um dia
 * da semana), nunca vira rotina permanente. Metade "adicionar" da
 * unificação do ajuste pontual (design.md, ex.: ir ao dentista) — a
 * outra metade ("esconder item fixo só hoje") é `rotina_item_oculto`.
 */
export const rotinaItensAvulsos = pgTable("rotina_item_avulso", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  data: date("data", { mode: "string" }).notNull(),
  rotulo: text("rotulo").notNull(),
  emoji: text("emoji"),
  ocasiao: ocasiaoEnum("ocasiao").notNull(),
});

export type RotinaItemAvulso = typeof rotinaItensAvulsos.$inferSelect;
export type NovoRotinaItemAvulso = typeof rotinaItensAvulsos.$inferInsert;
