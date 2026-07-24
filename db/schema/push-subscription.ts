import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";

/** Uma usuária pode ter mais de uma inscrição (mais de um dispositivo/PWA instalado). */
export const pushSubscriptions = pgTable("push_subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NovaPushSubscription = typeof pushSubscriptions.$inferInsert;
