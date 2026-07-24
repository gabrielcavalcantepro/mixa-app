import { describe, expect, it } from "vitest";
import { filtrarLooks } from "./filtrar";
import type { LookAprovado } from "./tipos";

function lookFake(overrides: Partial<LookAprovado> & { id: string }): LookAprovado {
  return {
    nome: null,
    capsula: { id: "c1", nome: "Verão 2026", dataLancamento: "2026-01-15" },
    ocasioes: ["trabalho"],
    perfisEstilo: ["perfil-a"],
    clima: ["leve"],
    climaMisto: false,
    varianteDeId: null,
    pecas: [],
    ...overrides,
  };
}

describe("filtrarLooks", () => {
  it("filtra por ocasião", () => {
    const looks = [lookFake({ id: "1", ocasioes: ["trabalho"] }), lookFake({ id: "2", ocasioes: ["treino"] })];
    expect(filtrarLooks(looks, { ocasiao: "treino" }).map((l) => l.id)).toEqual(["2"]);
  });

  it("filtra por clima, mas look sem clima definido é agnóstico (sempre bate)", () => {
    const looks = [
      lookFake({ id: "1", clima: ["pesada"] }),
      lookFake({ id: "2", clima: [] }),
      lookFake({ id: "3", clima: ["leve"] }),
    ];
    const resultado = filtrarLooks(looks, { clima: "leve" }).map((l) => l.id);
    expect(resultado).toEqual(["2", "3"]);
  });

  it("filtra por perfil de estilo (qualquer um bate, dominante ou complementar)", () => {
    const looks = [
      lookFake({ id: "1", perfisEstilo: ["perfil-a"] }),
      lookFake({ id: "2", perfisEstilo: ["perfil-b"] }),
      lookFake({ id: "3", perfisEstilo: ["perfil-c"] }),
    ];
    const resultado = filtrarLooks(looks, { perfisEstilo: ["perfil-a", "perfil-b"] }).map((l) => l.id);
    expect(resultado).toEqual(["1", "2"]);
  });

  it("sem filtro nenhum, devolve tudo", () => {
    const looks = [lookFake({ id: "1" }), lookFake({ id: "2" })];
    expect(filtrarLooks(looks, {})).toHaveLength(2);
  });
});
