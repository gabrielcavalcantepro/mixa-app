import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { dataDeHojeISO } from "@/lib/data";
import { obterLooksDoDia } from "./_queries/look-do-dia";
import { buscarItensOcultosHoje } from "./_queries/itens-rotina";
import { HojeInterativo } from "./_components/hoje-interativo";

export default async function HojePage() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const cartoes = await obterLooksDoDia(usuario);
  const itensOcultosHoje = await buscarItensOcultosHoje(usuario.id, new Date().getDay(), dataDeHojeISO());

  return (
    <div className="flex flex-col gap-6 p-4">
      <HojeInterativo cartoes={cartoes} itensOcultosHoje={itensOcultosHoje} />
    </div>
  );
}
