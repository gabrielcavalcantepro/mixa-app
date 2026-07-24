import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";

/**
 * Histórico de exibição do look do dia — usado pelo motor de decisão
 * pra não repetir look recente (ver
 * app/(app)/hoje/_lib/motor-decisao.ts). `lookId` é o id externo do
 * catálogo.
 */
export const looksExibidos = pgTable("look_exibido", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  lookId: text("look_id").notNull(),
  exibidoEm: timestamp("exibido_em", { withTimezone: true }).notNull().defaultNow(),
});

export type LookExibido = typeof looksExibidos.$inferSelect;
export type NovoLookExibido = typeof looksExibidos.$inferInsert;
