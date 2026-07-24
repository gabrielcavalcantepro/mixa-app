import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { obterLookDoDia } from "./_queries/look-do-dia";
import { opcaoAjusteHojeParaOcasiao } from "./_lib/opcoes-ajuste";
import { AjusteHojeBotoes } from "./_components/ajuste-hoje-botoes";
import { LookDoDiaCard } from "./_components/look-do-dia-card";
import { TutorialInstalacao } from "./_components/tutorial-instalacao";

export default async function HojePage() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const { look, criterios } = await obterLookDoDia(usuario);

  return (
    <div className="flex flex-col">
      {!usuario.tutorialInstalacaoVistoEm && <TutorialInstalacao />}

      <div className="flex flex-col gap-6 p-4">
        <div>
          <p className="text-sm text-muted-foreground">Hoje</p>
          <h1 className="text-3xl">Seu look do dia</h1>
        </div>

        <AjusteHojeBotoes ativa={opcaoAjusteHojeParaOcasiao(criterios.ocasiao)} />

        {look ? (
          <LookDoDiaCard look={look} />
        ) : (
          <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
            <p>Ainda não temos um look pra essa combinação de clima, ocasião e estilo.</p>
            <p className="mt-1 text-sm">O catálogo está sempre crescendo — volte em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
