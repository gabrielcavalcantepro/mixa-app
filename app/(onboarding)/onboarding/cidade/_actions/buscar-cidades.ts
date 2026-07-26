"use server";

import { getWeatherClient } from "@/lib/clima/open-weather";
import type { SugestaoCidade } from "@/lib/clima/tipos";

export async function buscarCidadesAction(consulta: string): Promise<SugestaoCidade[]> {
  return getWeatherClient().buscarCidades(consulta);
}
