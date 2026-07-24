import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { obterLookDoDia } from "./_queries/look-do-dia";
import { HojeInterativo } from "./_components/hoje-interativo";
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

        <HojeInterativo look={look} criterios={criterios} />
      </div>
    </div>
  );
}
