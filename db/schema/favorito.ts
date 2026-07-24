import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";

/** `lookId` é o id do look no catálogo (serviço externo) — sem FK. */
export const favoritos = pgTable(
  "favorito",
  {
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    lookId: text("look_id").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.lookId] })],
);

export type Favorito = typeof favoritos.$inferSelect;
