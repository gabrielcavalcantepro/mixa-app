import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import type { Ocasiao } from "@/db/schema";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import type { PesoClima } from "@/lib/clima/tipos";
import { buscarIdsFavoritos } from "@/lib/favoritos/queries";
import { LookGrid } from "@/components/mixa/look-grid";
import { listarLooksParaNavegar } from "./_queries/listar-looks";
import { Filtros } from "./_components/filtros";

interface Props {
  searchParams: Promise<{ ocasiao?: string | string[]; clima?: string | string[] }>;
}

interface GrupoCapsula {
  capsula: LookAprovado["capsula"];
  looks: LookAprovado[];
}

function paraArray(valor: string | string[] | undefined): string[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function agruparPorCapsula(looks: LookAprovado[]): GrupoCapsula[] {
  const grupos = new Map<string, GrupoCapsula>();
  for (const look of looks) {
    const grupo = grupos.get(look.capsula.id) ?? { capsula: look.capsula, looks: [] };
    grupo.looks.push(look);
    grupos.set(look.capsula.id, grupo);
  }
  return [...grupos.values()].sort(
    (a, b) => new Date(b.capsula.dataLancamento).getTime() - new Date(a.capsula.dataLancamento).getTime(),
  );
}

export default async function LooksPage({ searchParams }: Props) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const { ocasiao, clima } = await searchParams;
  const ocasioes = paraArray(ocasiao) as Ocasiao[];
  const climas = paraArray(clima) as PesoClima[];

  const [looks, idsFavoritos] = await Promise.all([
    listarLooksParaNavegar({ ocasioes, climas }),
    buscarIdsFavoritos(usuario.id),
  ]);

  const capsulas = agruparPorCapsula(looks);

  return (
    <div className="flex flex-col gap-6 p-4">
      <Filtros ocasioes={ocasioes} climas={climas} />

      {capsulas.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum look encontrado com esse filtro.</p>
      ) : (
        capsulas.map(({ capsula, looks: looksDaCapsula }) => (
          <section key={capsula.id} className="flex flex-col gap-3">
            <h2 className="font-heading text-2xl italic">{capsula.nome}</h2>
            <LookGrid looks={looksDaCapsula} idsFavoritos={idsFavoritos} />
          </section>
        ))
      )}
    </div>
  );
}
