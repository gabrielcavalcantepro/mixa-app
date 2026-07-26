import type { Municipio } from "./municipios-ibge";

const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(MARCAS_DIACRITICAS, "").toLowerCase();
}

/**
 * Filtra a lista completa de municípios pelo texto digitado — prefixo
 * bate antes de ocorrência no meio do nome (design.md), sem acento/caixa
 * importando na comparação. Pura e testada — quem busca de verdade
 * (fetch + cache) mora em `municipios-ibge.ts`.
 *
 * Desempate por tamanho do nome (mais curto primeiro), não alfabético:
 * o IBGE não expõe população nesse endpoint (design.md escopa só
 * nome+UF), e desempate alfabético puro enterra cidade conhecida atrás
 * de várias cidades pequenas de nome composto — ex.: "For" batia só em
 * "Formiga/Formigueiro/Formosa (+variantes)/Formoso" antes de
 * "Fortaleza" aparecer, e o limite cortava antes de chegar lá (bug
 * visto rodando; o próprio design.md cita "Fortaleza/CE" como resultado
 * esperado pra "For"). Nome mais curto é uma aproximação imperfeita mas
 * simples de "cidade principal, não distrito/composto" sem precisar de
 * uma 2ª fonte de dado (população) só pra isso.
 */
export function filtrarMunicipios(consulta: string, municipios: Municipio[], limite = 8): Municipio[] {
  const termo = normalizar(consulta.trim());
  if (!termo) return [];

  return municipios
    .reduce<{ municipio: Municipio; rank: number; indice: number }[]>((acumulado, municipio) => {
      const indice = normalizar(municipio.nome).indexOf(termo);
      if (indice !== -1) acumulado.push({ municipio, rank: indice === 0 ? 0 : 1, indice });
      return acumulado;
    }, [])
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.indice - b.indice ||
        a.municipio.nome.length - b.municipio.nome.length ||
        a.municipio.nome.localeCompare(b.municipio.nome),
    )
    .slice(0, limite)
    .map((item) => item.municipio);
}
