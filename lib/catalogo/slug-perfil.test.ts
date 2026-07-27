import { describe, expect, it } from "vitest";
import { slugPerfil } from "./slug-perfil";

describe("slugPerfil", () => {
  it("remove acentos e vira minúsculo", () => {
    expect(slugPerfil("Clássica")).toBe("classica");
    expect(slugPerfil("Romântica")).toBe("romantica");
  });

  it("troca espaço e barra por hífen", () => {
    expect(slugPerfil("Descontraída/casual-chic")).toBe("descontraida-casual-chic");
    expect(slugPerfil("Moderna/minimalista")).toBe("moderna-minimalista");
  });

  it("remove hífen nas pontas", () => {
    expect(slugPerfil("-Teste-")).toBe("teste");
  });
});
