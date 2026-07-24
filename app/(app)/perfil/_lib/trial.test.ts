import { describe, expect, it } from "vitest";
import { diasRestantesTrial } from "./trial";

describe("diasRestantesTrial", () => {
  it("retorna 7 no exato instante da criação da conta", () => {
    const inicio = new Date("2026-07-01T10:00:00Z");
    expect(diasRestantesTrial(inicio, inicio)).toBe(7);
  });

  it("conta dias corridos completos", () => {
    const inicio = new Date("2026-07-01T10:00:00Z");
    const agora = new Date("2026-07-04T10:00:00Z");
    expect(diasRestantesTrial(inicio, agora)).toBe(4);
  });

  it("nunca fica negativo depois do 7º dia", () => {
    const inicio = new Date("2026-07-01T10:00:00Z");
    const agora = new Date("2026-08-01T10:00:00Z");
    expect(diasRestantesTrial(inicio, agora)).toBe(0);
  });
});
