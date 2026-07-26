export interface Municipio {
  nome: string;
  uf: string;
}

interface MunicipioIbge {
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla?: string } } } | null;
  "regiao-imediata"?: { "regiao-intermediaria"?: { UF?: { sigla?: string } } } | null;
}

/**
 * A API do IBGE tem 2 caminhos pra chegar na UF (`microrregiao.mesorregiao.UF`
 * e `regiao-imediata.regiao-intermediaria.UF`) — quase todo município tem os
 * dois, mas ao menos 1 (visto direto na API: "Boa Esperança do Norte/MT")
 * só tem o segundo (`microrregiao` vem `null`), por isso o fallback.
 */
function extrairUf(bruto: MunicipioIbge): string | undefined {
  return bruto.microrregiao?.mesorregiao?.UF?.sigla ?? bruto["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla;
}

export function normalizarMunicipiosIbge(bruto: MunicipioIbge[]): Municipio[] {
  return bruto
    .map((item) => ({ nome: item.nome, uf: extrairUf(item) }))
    .filter((item): item is Municipio => Boolean(item.uf));
}

let cache: Municipio[] | undefined;

/**
 * Lista completa dos ~5.570 municípios brasileiros (IBGE, gratuito, sem
 * chave) — buscada 1x por processo e mantida em memória (design.md: "não
 * em toda tecla digitada"), não a cada chamada de `buscarCidadesAction`.
 */
export async function listarMunicipios(): Promise<Municipio[]> {
  if (cache) return cache;

  const resposta = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios");
  if (!resposta.ok) throw new Error(`Consulta de municípios (IBGE) falhou (${resposta.status})`);

  const bruto = (await resposta.json()) as MunicipioIbge[];
  cache = normalizarMunicipiosIbge(bruto);
  return cache;
}
