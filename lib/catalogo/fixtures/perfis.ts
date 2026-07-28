import type { PerfilEstilo } from "../tipos";

/**
 * Os 7 perfis fixos do catálogo (mixa-catalogo, não mais uma entidade
 * administrável por lá — ver CLAUDE.md desse projeto). Mantém o mock
 * coerente com o que o catálogo real vai devolver: Esportivo,
 * Tradicional, Elegante, Romântico, Criativo, Sexy, Dramático urbano.
 * Descrições são só ilustrativas (nenhuma foi fornecida junto com os
 * nomes) — trocar se/quando existir copy real.
 */
export const PERFIS_ESTILO: PerfilEstilo[] = [
  {
    id: "perfil-esportivo",
    nome: "Esportivo",
    descricao: "Conforto em primeiro lugar — peças fáceis de mover, pro dia a dia ativo.",
  },
  {
    id: "perfil-tradicional",
    nome: "Tradicional",
    descricao: "Alfaiataria e cortes clássicos — elegância que não sai de moda.",
  },
  {
    id: "perfil-elegante",
    nome: "Elegante",
    descricao: "Linhas limpas e cortes precisos — sofisticação sem excesso.",
  },
  {
    id: "perfil-romantico",
    nome: "Romântico",
    descricao: "Texturas suaves, curvas e detalhes delicados.",
  },
  {
    id: "perfil-criativo",
    nome: "Criativo",
    descricao: "Misturas inesperadas, estampas e cor — expressão sem regras.",
  },
  {
    id: "perfil-sexy",
    nome: "Sexy",
    descricao: "Peças que valorizam o corpo, com confiança e atitude.",
  },
  {
    id: "perfil-dramatico-urbano",
    nome: "Dramático urbano",
    descricao: "Silhuetas fortes, preto predominante, atitude urbana.",
  },
];
