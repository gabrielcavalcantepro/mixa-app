import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { dataDeHojeISO } from "@/lib/data";
import { derivarItensOcultosHoje } from "@/lib/rotina/itens-do-dia";
import { obterLooksDoDia } from "./_queries/look-do-dia";
import { buscarDadosRotinaDoDia } from "./_queries/itens-rotina";
import { HojeInterativo } from "./_components/hoje-interativo";

export default async function HojePage() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const diaSemana = new Date().getDay();
  // Buscado 1x só, reaproveitado pelos cartões do dia (obterLooksDoDia)
  // e pelo painel "Ajustar hoje" (derivarItensOcultosHoje, pura) — antes
  // cada um buscava rotina_item de novo por conta própria.
  const dadosRotina = await buscarDadosRotinaDoDia(usuario.id, dataDeHojeISO());

  const cartoes = await obterLooksDoDia(usuario, dadosRotina);
  const itensOcultosHoje = derivarItensOcultosHoje({
    itens: dadosRotina.itens,
    ocultosIds: dadosRotina.ocultosIds,
    diaSemana,
  });

  return (
    <div className="flex flex-col gap-6 p-4">
      <HojeInterativo cartoes={cartoes} itensOcultosHoje={itensOcultosHoje} />
    </div>
  );
}
