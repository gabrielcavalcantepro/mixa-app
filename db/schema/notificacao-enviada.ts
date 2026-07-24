import { date, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";

/**
 * Log de envio do push diário — evita reenviar mais de uma vez no mesmo
 * dia pro mesmo usuário quando o cron roda em janelas de poucos minutos
 * (ver app/api/cron/notificacoes-diarias/route.ts).
 */
export const notificacoesEnviadas = pgTable(
  "notificacao_enviada",
  {
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    data: date("data", { mode: "string" }).notNull(),
    enviadoEm: timestamp("enviado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.data] })],
);

export type NotificacaoEnviada = typeof notificacoesEnviadas.$inferSelect;
