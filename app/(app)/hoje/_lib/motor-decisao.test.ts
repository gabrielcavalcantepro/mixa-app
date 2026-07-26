import { describe, expect, it } from "vitest";
import { buscarFamiliaDoLook, escolherLook } from "./motor-decisao";
import type { LookAprovado } from "@/lib/catalogo/tipos";

function lookFake(overrides: Partial<LookAprovado> & { id: string }): LookAprovado {
  return {
    nome: null,
    capsula: { id: "capsula-1", nome: "Verão 2026", dataLancamento: "2026-01-15" },
    ocasioes: ["trabalho"],
    perfisEstilo: ["perfil-a"],
    clima: ["leve"],
    climaMisto: false,
    varianteDeId: null,
    pecas: [],
    ...overrides,
  };
}

describe("escolherLook", () => {
  it("retorna null quando não há candidatos", () => {
    expect(escolherLook({ candidatos: [], perfilDominanteId: "perfil-a", camadasDeExclusao: [] })).toBeNull();
  });

  it("prefere um look que bate o perfil dominante sobre um que só bate complementar", () => {
    const soComplementar = lookFake({ id: "look-comp", perfisEstilo: ["perfil-b"] });
    const comDominante = lookFake({ id: "look-dom", perfisEstilo: ["perfil-a", "perfil-b"] });

    const escolhido = escolherLook({
      candidatos: [soComplementar, comDominante],
      perfilDominanteId: "perfil-a",
      camadasDeExclusao: [],
    });

    expect(escolhido?.id).toBe("look-dom");
  });

  it("desempata por cápsula mais recente", () => {
    const antigo = lookFake({
      id: "look-antigo",
      capsula: { id: "c1", nome: "Inverno 2025", dataLancamento: "2025-06-01" },
    });
    const novo = lookFake({
      id: "look-novo",
      capsula: { id: "c2", nome: "Verão 2026", dataLancamento: "2026-01-15" },
    });

    const escolhido = escolherLook({
      candidatos: [antigo, novo],
      perfilDominanteId: "perfil-a",
      camadasDeExclusao: [],
    });

    expect(escolhido?.id).toBe("look-novo");
  });

  it("exclui a primeira camada quando ainda sobra opção", () => {
    const a = lookFake({ id: "look-a" });
    const b = lookFake({ id: "look-b" });

    const escolhido = escolherLook({
      candidatos: [a, b],
      perfilDominanteId: "perfil-a",
      camadasDeExclusao: [new Set(["look-a"])],
    });

    expect(escolhido?.id).toBe("look-b");
  });

  it("passa pra próxima camada quando a mais restritiva zera os candidatos", () => {
    const a = lookFake({ id: "look-a" });
    const b = lookFake({ id: "look-b" });

    const escolhido = escolherLook({
      candidatos: [a, b],
      perfilDominanteId: "perfil-a",
      // 1ª camada exclui tudo -> deve cair pra 2ª camada (só exclui "look-a")
      camadasDeExclusao: [new Set(["look-a", "look-b"]), new Set(["look-a"])],
    });

    expect(escolhido?.id).toBe("look-b");
  });

  it("cai pro pool completo (repete) quando todas as camadas esvaziam", () => {
    const unico = lookFake({ id: "look-unico" });

    const escolhido = escolherLook({
      candidatos: [unico],
      perfilDominanteId: "perfil-a",
      camadasDeExclusao: [new Set(["look-unico"])],
    });

    expect(escolhido?.id).toBe("look-unico");
  });
});

describe("buscarFamiliaDoLook", () => {
  it("look atual não é variante de nada: família é quem tem varianteDeId apontando pra ele", () => {
    const base = lookFake({ id: "look-base" });
    const variante = lookFake({ id: "look-variante", varianteDeId: "look-base" });
    const independente = lookFake({ id: "look-independente" });

    const familia = buscarFamiliaDoLook(base, [base, variante, independente]);
    expect(familia.map((l) => l.id)).toEqual(["look-variante"]);
  });

  it("look atual é variante: família inclui a base e os irmãos, nunca ele mesmo", () => {
    const base = lookFake({ id: "look-base" });
    const atual = lookFake({ id: "look-atual", varianteDeId: "look-base" });
    const irmao = lookFake({ id: "look-irmao", varianteDeId: "look-base" });
    const independente = lookFake({ id: "look-independente" });

    const familia = buscarFamiliaDoLook(atual, [base, atual, irmao, independente]);
    expect(familia.map((l) => l.id).sort()).toEqual(["look-base", "look-irmao"]);
  });

  it("sem variante cadastrada, família fica vazia", () => {
    const unico = lookFake({ id: "look-unico" });
    expect(buscarFamiliaDoLook(unico, [unico])).toEqual([]);
  });
});
