export type PesoClima = "leve" | "meia_estacao" | "pesada";

export interface ClimaDoDia {
  pesoClima: PesoClima;
  temperaturaC: number;
  descricao: string;
}

export interface SugestaoCidade {
  label: string;
  lat: number;
  lon: number;
}
