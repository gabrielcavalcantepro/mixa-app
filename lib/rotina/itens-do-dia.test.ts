import { describe, expect, it } from "vitest";
import { agruparPorCategoria, categoriasDoDia, itensDoDia, mapaSemanalPorCategoria } from "./itens-do-dia";
import type { ItemAvulso, ItemRotina } from "./tipos";

const ITENS: ItemRotina[] = [
  { id: "crossfit", rotulo: "Crossfit", emoji: "🏋️", ocasiao: "treino", diasSemana: [1] },
  { id: "musculacao", rotulo: "Musculação", emoji: null, ocasiao: "treino", diasSemana: [1, 3] },
  { id: "empresa", rotulo: "Empresa", emoji: "💼", ocasiao: "trabalho", diasSemana: [1, 2, 3, 4, 5] },
  { id: "yoga", rotulo: "Yoga", emoji: "🧘", ocasiao: "lazer", diasSemana: [0] },
];

describe("itensDoDia", () => {
  it("junta vários itens de categorias iguais ou diferentes no mesmo dia, sem exclusão", () => {
    const resultado = itensDoDia({ itens: ITENS, avulsos: [], ocultosIds: new Set(), diaSemana: 1 });
    expect(resultado.map((i) => i.id)).toEqual(["crossfit", "musculacao", "empresa"]);
  });

  it("item oculto hoje não aparece, mas continua existindo pros outros dias", () => {
    const resultado = itensDoDia({
      itens: ITENS,
      avulsos: [],
      ocultosIds: new Set(["crossfit"]),
      diaSemana: 1,
    });
    expect(resultado.map((i) => i.id)).toEqual(["musculacao", "empresa"]);
  });

  it("avulso de hoje entra junto, independente de dia da semana", () => {
    const avulso: ItemAvulso = { id: "dentista", rotulo: "Dentista", emoji: null, ocasiao: "evento" };
    const resultado = itensDoDia({ itens: [], avulsos: [avulso], ocultosIds: new Set(), diaSemana: 4 });
    expect(resultado).toEqual([{ ...avulso, origem: "avulso" }]);
  });

  it("dia sem item nenhum devolve lista vazia", () => {
    expect(itensDoDia({ itens: ITENS, avulsos: [], ocultosIds: new Set(), diaSemana: 6 })).toEqual([]);
  });
});

describe("agruparPorCategoria", () => {
  it("agrupa por categoria distinta, ordem fixa (trabalho, lazer, casa, treino, evento)", () => {
    const resolvidos = itensDoDia({ itens: ITENS, avulsos: [], ocultosIds: new Set(), diaSemana: 1 });
    const agrupado = agruparPorCategoria(resolvidos);
    expect(agrupado.map((c) => c.ocasiao)).toEqual(["trabalho", "treino"]);
    expect(agrupado.find((c) => c.ocasiao === "treino")?.itens.map((i) => i.id)).toEqual([
      "crossfit",
      "musculacao",
    ]);
  });
});

describe("categoriasDoDia", () => {
  it("dia sem nenhum item cai em casa (fallback)", () => {
    const resultado = categoriasDoDia({ itens: ITENS, avulsos: [], ocultosIds: new Set(), diaSemana: 6 });
    expect(resultado).toEqual([{ ocasiao: "casa", itens: [] }]);
  });

  it("exemplo do design.md: 5 itens, 3 categorias distintas -> 3 cartões", () => {
    const resultado = categoriasDoDia({ itens: ITENS, avulsos: [], ocultosIds: new Set(), diaSemana: 1 });
    expect(resultado).toHaveLength(2); // treino + trabalho nesse fixture (sem casa nem lazer na segunda)
  });
});

describe("mapaSemanalPorCategoria", () => {
  it("junta categorias distintas por dia, sem duplicar quando 2 itens da mesma categoria caem no mesmo dia", () => {
    const mapa = mapaSemanalPorCategoria(ITENS);
    expect(mapa[1]).toEqual(["treino", "trabalho"]); // crossfit+musculação (treino) + empresa (trabalho)
    expect(mapa[3]).toEqual(["treino", "trabalho"]); // musculação + empresa, sem repetir "treino"
    expect(mapa[0]).toEqual(["lazer"]);
  });

  it("dia sem item nenhum não aparece no mapa (quem lê decide o fallback)", () => {
    const mapa = mapaSemanalPorCategoria(ITENS);
    expect(mapa[6]).toBeUndefined();
  });
});
