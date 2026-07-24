import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import type { Ocasiao } from "@/db/schema";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import type { PesoClima } from "@/lib/clima/tipos";
import { buscarIdsFavoritos, listarLooksParaNavegar } from "./_queries/listar-looks";
import { Filtros } from "./_components/filtros";
import { LookGrid } from "./_components/look-grid";

interface Props {
  searchParams: Promise<{ ocasiao?: string; clima?: string }>;
}

interface GrupoCapsula {
  capsula: LookAprovado["capsula"];
  looks: LookAprovado[];
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

  const [looks, idsFavoritos] = await Promise.all([
    listarLooksParaNavegar({ ocasiao: ocasiao as Ocasiao | undefined, clima: clima as PesoClima | undefined }),
    buscarIdsFavoritos(usuario.id),
  ]);

  const capsulas = agruparPorCapsula(looks);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="text-sm text-muted-foreground">Looks</p>
        <h1 className="text-3xl">Guarda-roupa</h1>
      </div>

      <Filtros ocasiao={ocasiao} clima={clima} />

      {capsulas.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhum look encontrado com esse filtro.</p>
      ) : (
        capsulas.map(({ capsula, looks: looksDaCapsula }) => (
          <section key={capsula.id} className="flex flex-col gap-3">
            <h2 className="text-xl">{capsula.nome}</h2>
            <LookGrid looks={looksDaCapsula} idsFavoritos={idsFavoritos} />
          </section>
        ))
      )}
    </div>
  );
}
