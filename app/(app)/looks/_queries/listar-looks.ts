import { getCatalogoClient } from "@/lib/catalogo/cliente";
import type { Ocasiao } from "@/db/schema";
import type { PesoClima } from "@/lib/clima/tipos";
import { filtrarLooksMultiplo } from "../_lib/filtrar-multiplo";

/**
 * Busca tudo e filtra localmente com `filtrarLooksMultiplo` (múltipla
 * escolha por linha, design.md) — o filtro do cliente do catálogo
 * (`listarLooksAprovados({ocasiao, clima})`) só aceita 1 valor de cada,
 * é o que o motor de decisão de Hoje precisa; a busca multivalor é
 * coisa da tela de Looks, fica local aqui.
 */
export async function listarLooksParaNavegar(filtro: { ocasioes: Ocasiao[]; climas: PesoClima[] }) {
  const todos = await getCatalogoClient().listarLooksAprovados({});
  return filtrarLooksMultiplo(todos, filtro);
}

/**
 * O cliente do catálogo não tem busca por id (só filtro por
 * ocasião/clima/perfil) — busca tudo e acha localmente. Aceitável no
 * volume atual; revisitar se o catálogo crescer muito.
 */
export async function buscarLookPorId(id: string) {
  const looks = await getCatalogoClient().listarLooksAprovados({});
  return looks.find((look) => look.id === id) ?? null;
}
