import type { FiltroLooksAprovados, LookAprovado, PerfilEstilo } from "./tipos";
import { HttpCatalogoClient } from "./http";
import { MockCatalogoClient } from "./mock";

/**
 * Único ponto de contato com o catálogo — Hoje, Looks e o quiz de
 * estilo do onboarding só enxergam esta interface, nunca a
 * implementação. Trocar de mock pra HTTP real é só mudar
 * CATALOGO_API_MODE no .env, sem tocar em nenhuma tela.
 */
export interface CatalogoClient {
  listarLooksAprovados(filtro?: FiltroLooksAprovados): Promise<LookAprovado[]>;
  listarPerfisEstilo(): Promise<PerfilEstilo[]>;
}

let instancia: CatalogoClient | undefined;

export function getCatalogoClient(): CatalogoClient {
  if (!instancia) {
    instancia =
      process.env.CATALOGO_API_MODE === "http"
        ? new HttpCatalogoClient()
        : new MockCatalogoClient();
  }
  return instancia;
}
