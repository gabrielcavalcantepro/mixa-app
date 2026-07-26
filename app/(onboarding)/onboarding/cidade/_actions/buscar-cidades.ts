"use server";

import { listarMunicipios } from "../_lib/municipios-ibge";
import { filtrarMunicipios } from "../_lib/filtrar-municipios";

export interface SugestaoCidade {
  nome: string;
  uf: string;
  label: string;
}

export async function buscarCidadesAction(consulta: string): Promise<SugestaoCidade[]> {
  if (consulta.trim().length < 2) return [];

  const municipios = await listarMunicipios();
  return filtrarMunicipios(consulta, municipios).map((municipio) => ({
    nome: municipio.nome,
    uf: municipio.uf,
    label: `${municipio.nome}/${municipio.uf}`,
  }));
}
