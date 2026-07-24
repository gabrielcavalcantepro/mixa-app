import { date, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

/**
 * 1 chamada à API de clima por cidade/dia (a spec pede cache explícito —
 * ver lib/clima/cache.ts). `payload` guarda só o necessário pro motor de
 * decisão, não a resposta bruta da API.
 */
export const climaCache = pgTable(
  "clima_cache",
  {
    cidade: text("cidade").notNull(),
    data: date("data", { mode: "string" }).notNull(),
    payload: jsonb("payload")
      .$type<{ pesoClima: "leve" | "meia_estacao" | "pesada"; temperaturaC: number; descricao: string }>()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.cidade, t.data] })],
);

export type ClimaCache = typeof climaCache.$inferSelect;
