import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";

/** Até 2 perfis complementares por usuária (ver onboarding/estilo). */
export const usuarioPerfisComplementares = pgTable(
  "usuario_perfil_complementar",
  {
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    perfilEstiloId: text("perfil_estilo_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.perfilEstiloId] })],
);

export type UsuarioPerfilComplementar = typeof usuarioPerfisComplementares.$inferSelect;
