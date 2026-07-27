import { pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Conta da usuária final + todo o estado do onboarding que não vive em
 * tabela própria. `perfilDominanteId` guarda o id do perfil de estilo no
 * catálogo (serviço externo) — sem FK, o catálogo não é consultável no
 * nosso banco por definição (bancos separados, API é a única ponte).
 *
 * `nome` existe desde design.md passada 5 — vira o título principal do
 * Perfil (e-mail passa a secundário). Coletado na criação de conta.
 *
 * Onboarding completo é **derivado**, não uma flag própria: sem sessão →
 * login; sem `cidade` → passo cidade; sem `perfilDominanteId` → passo
 * estilo; sem `rotinaConcluidaEm` → passo rotina; senão liberado (ver
 * `app/(app)/layout.tsx`). `rotinaConcluidaEm` (não checar linhas em
 * `rotina_item`) porque terminar o passo rotina **sem nenhum item** é
 * uma escolha válida (tudo cai em "casa") — checar existência de linha
 * quebrava exatamente esse caso, achado rodando o app de verdade.
 */
export const usuarios = pgTable("usuario", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  cidade: text("cidade"),
  cidadeLat: text("cidade_lat"),
  cidadeLon: text("cidade_lon"),
  perfilDominanteId: text("perfil_dominante_id"),
  rotinaConcluidaEm: timestamp("rotina_concluida_em", { withTimezone: true }),
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
