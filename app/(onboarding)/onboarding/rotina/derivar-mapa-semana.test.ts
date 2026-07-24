import { describe, expect, it } from "vitest";
import { derivarMapaSemana } from "./derivar-mapa-semana";

describe("derivarMapaSemana", () => {
  it("marca dias de trabalho como 'trabalho'", () => {
    const mapa = derivarMapaSemana({ diasTrabalho: [1, 2, 3, 4, 5], diasTreino: [] });
    expect(mapa.find((d) => d.diaSemana === 1)?.ocasiao).toBe("trabalho");
  });

  it("marca dias de treino como 'treino'", () => {
    const mapa = derivarMapaSemana({ diasTrabalho: [], diasTreino: [2, 4] });
    expect(mapa.find((d) => d.diaSemana === 2)?.ocasiao).toBe("treino");
  });

  it("treino tem prioridade sobre trabalho no mesmo dia", () => {
    const mapa = derivarMapaSemana({ diasTrabalho: [3], diasTreino: [3] });
    expect(mapa.find((d) => d.diaSemana === 3)?.ocasiao).toBe("treino");
  });

  it("dias sem marcação viram 'casa'", () => {
    const mapa = derivarMapaSemana({ diasTrabalho: [1], diasTreino: [] });
    expect(mapa.find((d) => d.diaSemana === 0)?.ocasiao).toBe("casa");
  });

  it("sempre retorna as 7 posições, na ordem de Date.getDay()", () => {
    const mapa = derivarMapaSemana({ diasTrabalho: [], diasTreino: [] });
    expect(mapa.map((d) => d.diaSemana)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
