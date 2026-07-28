import { describe, expect, it } from "vitest";
import { slugPerfil } from "./slug-perfil";

describe("slugPerfil", () => {
  it("remove acentos e vira minúsculo", () => {
    expect(slugPerfil("Dramático urbano")).toBe("dramatico-urbano");
    expect(slugPerfil("Romântico")).toBe("romantico");
  });

  it("troca espaço e barra por hífen", () => {
    expect(slugPerfil("Dramático urbano")).toBe("dramatico-urbano");
    expect(slugPerfil("Casual/chic")).toBe("casual-chic");
  });

  it("remove hífen nas pontas", () => {
    expect(slugPerfil("-Teste-")).toBe("teste");
  });
});
