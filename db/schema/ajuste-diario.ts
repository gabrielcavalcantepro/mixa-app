import { date, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";
import { ocasiaoEnum } from "./enums";

/**
 * "Hoje eu vou..." — sobrescreve a ocasião só do dia marcado, sem tocar
 * em `rotina_dia`. Unique por (usuarioId, data): upsert no submit, e a
 * própria data funciona como expiração natural (só o registro de hoje é
 * lido pelo motor de decisão).
 */
export const ajustesDiarios = pgTable(
  "ajuste_diario",
  {
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    data: date("data", { mode: "string" }).notNull(),
    ocasiao: ocasiaoEnum("ocasiao").notNull(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.data] })],
);

export type AjusteDiario = typeof ajustesDiarios.$inferSelect;
