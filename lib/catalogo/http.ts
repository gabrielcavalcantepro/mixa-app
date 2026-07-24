import type { CatalogoClient } from "./cliente";
import { filtrarLooks } from "./filtrar";
import type { FiltroLooksAprovados, LookAprovado, Ocasiao, PecaDoLook, PerfilEstilo, PesoClima, Slot } from "./tipos";

/**
 * Formato de resposta real de `mixa-catalogo` (`app/api/v1/looks`,
 * confirmado lendo o código-fonte de lá em 2026-07-24) — mais aninhado
 * que o nosso `LookAprovado` interno de propósito (peça sob `.peca`,
 * perfis como `{id,nome}`, clima como `{climas,misto}`). `mapearLook`
 * abaixo é a única fronteira que conhece esse formato; o resto do app
 * só vê `LookAprovado`, isolado de mudança de contrato do catálogo.
 */
interface LookApiResposta {
  id: string;
  nome: string | null;
  capsula: { id: string; nome: string; dataLancamento: string };
  clima: { climas: string[]; misto: boolean };
  ocasioes: string[];
  perfisEstilo: { id: string; nome: string }[];
  pecas: { slot: string; peca: { id: string; nome: string; imagens: { url: string; isCapa: boolean }[] } }[];
  varianteDe: { id: string; nome: string | null } | null;
}

function mapearLook(bruto: LookApiResposta): LookAprovado {
  const pecas: PecaDoLook[] = bruto.pecas.map((item) => ({
    id: item.peca.id,
    nome: item.peca.nome,
    slot: item.slot as Slot,
    imagens: item.peca.imagens.map((imagem, ordem) => ({ url: imagem.url, ordem, isCapa: imagem.isCapa })),
    // Link de compra não vem embutido em /looks (só em /pecas, por peça)
    // — null aqui até a integração de afiliados existir (fora de escopo
    // nesta fase, ver CLAUDE.md).
    linkAfiliado: null,
  }));

  return {
    id: bruto.id,
    nome: bruto.nome,
    capsula: bruto.capsula,
    ocasioes: bruto.ocasioes as Ocasiao[],
    perfisEstilo: bruto.perfisEstilo.map((perfil) => perfil.id),
    clima: bruto.clima.climas as PesoClima[],
    climaMisto: bruto.clima.misto,
    varianteDeId: bruto.varianteDe?.id ?? null,
    pecas,
  };
}

/**
 * Consome `mixa-catalogo`. `GET /api/v1/looks` devolve a lista inteira
 * (sem filtro por query param — a API não suporta isso, ver
 * `filtrar.ts`), então o filtro é sempre aplicado aqui depois de buscar
 * tudo; o Next dedupa/cacheia a mesma URL entre chamadas (`revalidate`).
 */
export class HttpCatalogoClient implements CatalogoClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor() {
    const baseUrl = process.env.CATALOGO_API_URL;
    const token = process.env.CATALOGO_API_TOKEN;
    if (!baseUrl || !token) {
      throw new Error(
        "CATALOGO_API_URL/CATALOGO_API_TOKEN não configurados — necessários quando CATALOGO_API_MODE=http",
      );
    }
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async buscar<T>(caminho: string): Promise<T> {
    const resposta = await fetch(`${this.baseUrl}${caminho}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      next: { revalidate: 60 },
    });
    if (!resposta.ok) {
      throw new Error(`Catálogo respondeu ${resposta.status} em ${caminho}`);
    }
    return resposta.json() as Promise<T>;
  }

  async listarLooksAprovados(filtro: FiltroLooksAprovados = {}): Promise<LookAprovado[]> {
    const brutos = await this.buscar<LookApiResposta[]>("/api/v1/looks");
    return filtrarLooks(brutos.map(mapearLook), filtro);
  }

  async listarPerfisEstilo(): Promise<PerfilEstilo[]> {
    return this.buscar<PerfilEstilo[]>("/api/v1/perfis-de-estilo");
  }
}
