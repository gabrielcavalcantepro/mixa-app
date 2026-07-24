import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { AtivarNotificacoes } from "@/components/mixa/ativar-notificacoes";
import { Button } from "@/components/ui/button";
import { buscarComplementaresAtuais, buscarPerfisDeEstilo, buscarRotinaAtual } from "./_queries/buscar-perfil";
import { AssinaturaCard } from "./_components/assinatura-card";
import { NotificacaoForm } from "./_components/notificacao-form";
import { RotinaEditor } from "./_components/rotina-editor";
import { EstiloEditor } from "./_components/estilo-editor";
import { SeletorTema } from "./_components/seletor-tema";
import { sair } from "./_actions/sair";

export default async function PerfilPage() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const [rotinaAtual, complementaresAtuais, perfis] = await Promise.all([
    buscarRotinaAtual(usuario.id),
    buscarComplementaresAtuais(usuario.id),
    buscarPerfisDeEstilo(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-4 pb-8">
      <div>
        <p className="text-sm text-muted-foreground">Perfil</p>
        <h1 className="text-2xl">{usuario.email}</h1>
        <p className="text-sm text-muted-foreground">{usuario.cidade}</p>
      </div>

      <AssinaturaCard trialIniciadoEm={usuario.trialIniciadoEm} />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Aparência</h2>
        <SeletorTema />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Notificação</h2>
        <NotificacaoForm horarioAtual={usuario.notificacaoHorario} />
        <AtivarNotificacoes />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Rotina semanal</h2>
        <RotinaEditor rotinaAtual={rotinaAtual} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">Estilo</h2>
        <EstiloEditor
          perfis={perfis}
          dominanteAtual={usuario.perfilDominanteId}
          complementaresAtuais={complementaresAtuais}
        />
      </section>

      <form action={sair}>
        <Button type="submit" variant="outline" className="w-full">
          Sair
        </Button>
      </form>
    </div>
  );
}
