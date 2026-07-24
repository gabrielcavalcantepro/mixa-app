import { describe, expect, it } from "vitest";
import { escolherOcasiaoDoDia } from "./escolher-ocasiao-do-dia";

describe("escolherOcasiaoDoDia", () => {
  it("prioriza o ajuste manual de hoje sobre a rotina", () => {
    expect(escolherOcasiaoDoDia({ ajusteDeHoje: "treino", ocasiaoDaRotina: "trabalho" })).toBe("treino");
  });

  it("cai pra rotina quando não há ajuste manual", () => {
    expect(escolherOcasiaoDoDia({ ajusteDeHoje: null, ocasiaoDaRotina: "trabalho" })).toBe("trabalho");
  });

  it("cai pra 'casa' quando nem ajuste nem rotina existem", () => {
    expect(escolherOcasiaoDoDia({ ajusteDeHoje: null, ocasiaoDaRotina: null })).toBe("casa");
  });
});
