import { integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";
import { ocasiaoEnum } from "./enums";

/**
 * Mapa dia-da-semana → ocasião padrão, montado no onboarding (passo
 * rotina) e editável campo a campo no Perfil. `diaSemana` segue a
 * convenção de `Date.getDay()`: 0 = domingo … 6 = sábado — evita
 * conversão entre índices na hora de calcular "hoje".
 */
export const rotinaDias = pgTable(
  "rotina_dia",
  {
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    diaSemana: integer("dia_semana").notNull(),
    ocasiao: ocasiaoEnum("ocasiao").notNull(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.diaSemana] })],
);

export type RotinaDia = typeof rotinaDias.$inferSelect;
export type NovaRotinaDia = typeof rotinaDias.$inferInsert;
