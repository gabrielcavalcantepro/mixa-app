export type PesoClima = "leve" | "meia_estacao" | "pesada";

export interface ClimaDoDia {
  pesoClima: PesoClima;
  temperaturaC: number;
  descricao: string;
}

export interface Coordenada {
  lat: number;
  lon: number;
}
