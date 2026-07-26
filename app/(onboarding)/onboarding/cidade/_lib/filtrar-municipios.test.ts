import { describe, expect, it } from "vitest";
import { filtrarMunicipios } from "./filtrar-municipios";
import type { Municipio } from "./municipios-ibge";

const MUNICIPIOS: Municipio[] = [
  { nome: "Fortaleza", uf: "CE" },
  { nome: "Formosa", uf: "GO" },
  { nome: "Formoso", uf: "MG" },
  { nome: "São Paulo", uf: "SP" },
  { nome: "São Bernardo do Campo", uf: "SP" },
  { nome: "Alta Floresta D'Oeste", uf: "RO" },
];

describe("filtrarMunicipios", () => {
  it("prefixo bate antes de ocorrência no meio do nome", () => {
    const resultado = filtrarMunicipios("For", MUNICIPIOS);
    expect(resultado.map((m) => m.nome)).toEqual(["Formosa", "Formoso", "Fortaleza"]);
  });

  it("ignora acento e caixa na comparação", () => {
    const resultado = filtrarMunicipios("sao pau", MUNICIPIOS);
    expect(resultado.map((m) => m.nome)).toEqual(["São Paulo"]);
  });

  it("também bate ocorrência no meio do nome, depois dos prefixos", () => {
    const resultado = filtrarMunicipios("Paulo", MUNICIPIOS);
    expect(resultado.map((m) => m.nome)).toEqual(["São Paulo"]);
  });

  it("string vazia não retorna nada", () => {
    expect(filtrarMunicipios("", MUNICIPIOS)).toEqual([]);
    expect(filtrarMunicipios("   ", MUNICIPIOS)).toEqual([]);
  });

  it("respeita o limite", () => {
    const resultado = filtrarMunicipios("For", MUNICIPIOS, 2);
    expect(resultado).toHaveLength(2);
  });

  it("sem nenhuma ocorrência retorna lista vazia", () => {
    expect(filtrarMunicipios("Xyzabc", MUNICIPIOS)).toEqual([]);
  });

  it("desempata prefixo por tamanho de nome — cidade conhecida não fica enterrada atrás de várias pequenas", () => {
    // Caso real (IBGE): 8 municípios "Formo-" alfabeticamente cabem
    // todos antes de "Fortaleza" — desempate alfabético puro cortava
    // Fortaleza fora do limite. design.md cita "Fortaleza/CE" como
    // resultado esperado pra "For".
    const comMuitasFormo: Municipio[] = [
      { nome: "Formiga", uf: "MG" },
      { nome: "Formigueiro", uf: "RS" },
      { nome: "Formosa", uf: "GO" },
      { nome: "Formosa da Serra Negra", uf: "MA" },
      { nome: "Formosa do Oeste", uf: "PR" },
      { nome: "Formosa do Rio Preto", uf: "BA" },
      { nome: "Formosa do Sul", uf: "SC" },
      { nome: "Formoso", uf: "MG" },
      { nome: "Fortaleza", uf: "CE" },
    ];
    const resultado = filtrarMunicipios("For", comMuitasFormo, 8);
    expect(resultado.map((m) => m.nome)).toContain("Fortaleza");
  });
});
