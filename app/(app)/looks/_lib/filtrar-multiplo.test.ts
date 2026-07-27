import { describe, expect, it } from "vitest";
import { filtrarLooksMultiplo } from "./filtrar-multiplo";
import type { LookAprovado } from "@/lib/catalogo/tipos";

function lookFake(overrides: Partial<LookAprovado> & { id: string }): LookAprovado {
  return {
    nome: null,
    capsula: { id: "capsula-1", nome: "Verão 2026", dataLancamento: "2026-01-15" },
    ocasioes: ["trabalho"],
    perfisEstilo: [],
    clima: ["leve"],
    climaMisto: false,
    varianteDeId: null,
    pecas: [],
    ...overrides,
  };
}

describe("filtrarLooksMultiplo", () => {
  it("sem filtro nenhum devolve tudo", () => {
    const looks = [lookFake({ id: "a" }), lookFake({ id: "b" })];
    expect(filtrarLooksMultiplo(looks, { ocasioes: [], climas: [] })).toHaveLength(2);
  });

  it("múltipla escolha de ocasião na mesma linha: 'trabalho OU evento'", () => {
    const trabalho = lookFake({ id: "a", ocasioes: ["trabalho"] });
    const evento = lookFake({ id: "b", ocasioes: ["evento"] });
    const treino = lookFake({ id: "c", ocasioes: ["treino"] });

    const resultado = filtrarLooksMultiplo([trabalho, evento, treino], {
      ocasioes: ["trabalho", "evento"],
      climas: [],
    });

    expect(resultado.map((l) => l.id).sort()).toEqual(["a", "b"]);
  });

  it("combina ocasião E clima (entre categorias continua sendo E, só dentro da mesma linha é OU)", () => {
    const bate = lookFake({ id: "a", ocasioes: ["trabalho"], clima: ["leve"] });
    const ocasiaoErrada = lookFake({ id: "b", ocasioes: ["treino"], clima: ["leve"] });
    const climaErrado = lookFake({ id: "c", ocasioes: ["trabalho"], clima: ["pesada"] });

    const resultado = filtrarLooksMultiplo([bate, ocasiaoErrada, climaErrado], {
      ocasioes: ["trabalho"],
      climas: ["leve"],
    });

    expect(resultado.map((l) => l.id)).toEqual(["a"]);
  });

  it("look sem clima definido (agnóstico) sempre bate, mesmo com filtro de clima ativo", () => {
    const agnostico = lookFake({ id: "a", clima: [] });
    const resultado = filtrarLooksMultiplo([agnostico], { ocasioes: [], climas: ["leve"] });
    expect(resultado.map((l) => l.id)).toEqual(["a"]);
  });
});
