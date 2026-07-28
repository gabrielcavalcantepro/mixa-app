import { describe, expect, it } from "vitest";
import { derivarPassoOnboarding } from "./onboarding";

describe("derivarPassoOnboarding", () => {
  it("sem cidade -> passo cidade", () => {
    expect(derivarPassoOnboarding({ cidade: null, perfilDominanteId: null, rotinaConcluidaEm: null })).toBe(
      "cidade",
    );
  });

  it("com cidade, sem perfil dominante -> passo estilo", () => {
    expect(
      derivarPassoOnboarding({ cidade: "São Paulo, SP", perfilDominanteId: null, rotinaConcluidaEm: null }),
    ).toBe("estilo");
  });

  it("com cidade e perfil, sem rotina concluída -> passo rotina", () => {
    expect(
      derivarPassoOnboarding({ cidade: "São Paulo, SP", perfilDominanteId: "perfil-1", rotinaConcluidaEm: null }),
    ).toBe("rotina");
  });

  it("com os 3 preenchidos -> completo (rotina legitimamente vazia não trava o loop)", () => {
    expect(
      derivarPassoOnboarding({
        cidade: "São Paulo, SP",
        perfilDominanteId: "perfil-1",
        rotinaConcluidaEm: new Date(),
      }),
    ).toBe("completo");
  });
});
