import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarioPerfisComplementares, type Usuario } from "@/db/schema";
import { getWeatherClient } from "@/lib/clima/open-weather";
import { dataDeHojeISO } from "@/lib/data";
import { buscarCategoriasDoDia } from "./itens-rotina";
import type { CriteriosDoDia } from "../_lib/motor-decisao";

/**
 * Junta clima + categorias do dia (1 ou mais, cada uma com seus itens)
 * + estilo da usuária num critério por categoria pro motor de decisão
 * — 1 `CriteriosDoDia` por cartão que Hoje vai mostrar, não 1 só pro
 * dia inteiro (design.md: "dia → um ou mais itens, cada um com sua
 * categoria"). `usuario` já vem com cidade/perfilDominanteId
 * garantidos — (app)/layout.tsx só deixa chegar aqui com onboarding
 * completo.
 */
export async function montarCriteriosDoDia(usuario: Usuario): Promise<CriteriosDoDia[]> {
  const dataHoje = dataDeHojeISO();
  const diaSemana = new Date().getDay();

  const categorias = await buscarCategoriasDoDia(usuario.id, diaSemana, dataHoje);

  const complementares = await db
    .select({ perfilEstiloId: usuarioPerfisComplementares.perfilEstiloId })
    .from(usuarioPerfisComplementares)
    .where(eq(usuarioPerfisComplementares.usuarioId, usuario.id));

  const clima = await getWeatherClient().climaDoDia({
    cidade: usuario.cidade!,
    lat: Number(usuario.cidadeLat),
    lon: Number(usuario.cidadeLon),
    data: dataHoje,
  });

  return categorias.map((categoria) => ({
    ocasiao: categoria.ocasiao,
    clima: clima.pesoClima,
    perfilDominanteId: usuario.perfilDominanteId!,
    perfisComplementaresIds: complementares.map((c) => c.perfilEstiloId),
    itens: categoria.itens,
  }));
}
