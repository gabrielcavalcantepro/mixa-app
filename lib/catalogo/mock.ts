import type { CatalogoClient } from "./cliente";
import type { FiltroLooksAprovados, LookAprovado, PerfilEstilo } from "./tipos";
import { filtrarLooks } from "./filtrar";
import { LOOKS_APROVADOS } from "./fixtures/looks";
import { PERFIS_ESTILO } from "./fixtures/perfis";

/** Implementação sem rede, usada enquanto o catálogo não tem looks reais curados (ver CLAUDE.md). */
export class MockCatalogoClient implements CatalogoClient {
  async listarLooksAprovados(filtro: FiltroLooksAprovados = {}): Promise<LookAprovado[]> {
    return filtrarLooks(LOOKS_APROVADOS, filtro);
  }

  async listarPerfisEstilo(): Promise<PerfilEstilo[]> {
    return PERFIS_ESTILO;
  }
}
