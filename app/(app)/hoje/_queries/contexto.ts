import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ajustesDiarios, rotinaDias, usuarioPerfisComplementares, type Usuario } from "@/db/schema";
import { getWeatherClient } from "@/lib/clima/open-weather";
import { dataDeHojeISO } from "@/lib/data";
import { escolherOcasiaoDoDia } from "../_lib/escolher-ocasiao-do-dia";
import type { CriteriosDoDia } from "../_lib/motor-decisao";

/**
 * Junta clima + ocasião efetiva + estilo da usuária num único critério
 * pro motor de decisão. `usuario` já vem com cidade/perfilDominanteId
 * garantidos — (app)/layout.tsx só deixa chegar aqui com onboarding
 * completo.
 */
export async function montarCriteriosDoDia(usuario: Usuario): Promise<CriteriosDoDia> {
  const dataHoje = dataDeHojeISO();
  const diaSemana = new Date().getDay();

  const [ajuste] = await db
    .select({ ocasiao: ajustesDiarios.ocasiao })
    .from(ajustesDiarios)
    .where(and(eq(ajustesDiarios.usuarioId, usuario.id), eq(ajustesDiarios.data, dataHoje)))
    .limit(1);

  const [rotina] = await db
    .select({ ocasiao: rotinaDias.ocasiao })
    .from(rotinaDias)
    .where(and(eq(rotinaDias.usuarioId, usuario.id), eq(rotinaDias.diaSemana, diaSemana)))
    .limit(1);

  const ocasiao = escolherOcasiaoDoDia({
    ajusteDeHoje: ajuste?.ocasiao ?? null,
    ocasiaoDaRotina: rotina?.ocasiao ?? null,
  });

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

  return {
    ocasiao,
    clima: clima.pesoClima,
    perfilDominanteId: usuario.perfilDominanteId!,
    perfisComplementaresIds: complementares.map((c) => c.perfilEstiloId),
  };
}
