import { pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Conta da usuária final + todo o estado do onboarding que não vive em
 * tabela própria. `perfilDominanteId` guarda o id do perfil de estilo no
 * catálogo (serviço externo) — sem FK, o catálogo não é consultável no
 * nosso banco por definição (bancos separados, API é a única ponte).
 *
 * Não há campo `nome`: a spec só pede e-mail/senha no onboarding e nada
 * no produto usa nome de exibição.
 *
 * Onboarding completo é **derivado**, não uma flag própria: sem sessão →
 * login; sem `cidade` → passo cidade; sem `perfilDominanteId` → passo
 * estilo; sem linhas em `rotina_dia` → passo rotina; senão liberado (ver
 * `app/(app)/layout.tsx`).
 */
export const usuarios = pgTable("usuario", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  cidade: text("cidade"),
  cidadeLat: text("cidade_lat"),
  cidadeLon: text("cidade_lon"),
  perfilDominanteId: text("perfil_dominante_id"),
  notificacaoHorario: time("notificacao_horario").notNull().default("07:00:00"),
  trialIniciadoEm: timestamp("trial_iniciado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
  tutorialInstalacaoVistoEm: timestamp("tutorial_instalacao_visto_em", {
    withTimezone: true,
  }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Usuario = typeof usuarios.$inferSelect;
export type NovoUsuario = typeof usuarios.$inferInsert;
