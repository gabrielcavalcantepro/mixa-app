import type { PerfilEstilo } from "../tipos";

/**
 * Mesmos 4 perfis já seedados em mixa-catalogo/db/seed.ts — mantém o
 * mock coerente com o que o catálogo real vai ter quando o endpoint
 * existir.
 */
export const PERFIS_ESTILO: PerfilEstilo[] = [
  {
    id: "perfil-classica",
    nome: "Clássica",
    descricao: "Linhas limpas, alfaiataria e cores neutras — elegância atemporal.",
  },
  {
    id: "perfil-casual",
    nome: "Descontraída/casual-chic",
    descricao: "Conforto com intenção — peças fáceis que ainda parecem pensadas.",
  },
  {
    id: "perfil-moderna",
    nome: "Moderna/minimalista",
    descricao: "Poucas peças, cortes precisos, sem excesso.",
  },
  {
    id: "perfil-romantica",
    nome: "Romântica",
    descricao: "Texturas suaves, curvas e detalhes delicados.",
  },
];
