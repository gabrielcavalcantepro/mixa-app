/**
 * Formas de dado que o mixa-app consome do catálogo. Espelham (mas não
 * importam — projetos separados, sem código compartilhado) o schema de
 * mixa-catalogo/db/schema/{enums,peca,look,perfil-estilo}.ts.
 */

export type Ocasiao = "trabalho" | "lazer" | "casa" | "treino" | "evento";

export type PesoClima = "leve" | "meia_estacao" | "pesada";

export type Slot =
  | "parte_de_cima"
  | "parte_de_baixo"
  | "peca_unica"
  | "calcado"
  | "sobreposicao"
  | "cinto"
  | "bolsa"
  | "acessorio_outro";

export interface ImagemPeca {
  url: string;
  ordem: number;
  isCapa: boolean;
}

export interface PecaDoLook {
  id: string;
  nome: string;
  slot: Slot;
  imagens: ImagemPeca[];
  linkAfiliado: string | null;
}

export interface CapsulaResumo {
  id: string;
  nome: string;
  dataLancamento: string;
}

export interface LookAprovado {
  id: string;
  nome: string | null;
  capsula: CapsulaResumo;
  ocasioes: Ocasiao[];
  perfisEstilo: string[];
  clima: PesoClima[];
  climaMisto: boolean;
  varianteDeId: string | null;
  pecas: PecaDoLook[];
}

export interface PerfilEstilo {
  id: string;
  nome: string;
  descricao: string | null;
}

export interface FiltroLooksAprovados {
  ocasiao?: Ocasiao;
  clima?: PesoClima;
  perfisEstilo?: string[];
}
