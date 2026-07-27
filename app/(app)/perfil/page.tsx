import { existsSync } from "node:fs";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { slugPerfil } from "@/lib/catalogo/slug-perfil";
import { AtivarNotificacoes } from "@/components/mixa/ativar-notificacoes";
import { Button } from "@/components/ui/button";
import { buscarComplementaresAtuais, buscarItensRotina, buscarPerfisDeEstilo } from "./_queries/buscar-perfil";
import { AssinaturaCard } from "./_components/assinatura-card";
import { NotificacaoForm } from "./_components/notificacao-form";
import { RotinaEditor } from "./_components/rotina-editor";
import { EstiloEditor } from "./_components/estilo-editor";
import { SeletorTema } from "./_components/seletor-tema";
import { sair } from "./_actions/sair";
import type { PerfilComImagem } from "@/components/mixa/cartao-perfil-estilo";

/**
 * Hierarquia real de seção (design.md) — cada bloco (Conta, Assinatura,
 * Aparência, Notificação, Rotina semanal, Estilo) ganha um título
 * Fraunces italic, mesmo peso visual dos títulos de seção usados em
 * Looks/Hoje. Antes, tudo tinha o mesmo `text-xl` sem distinção.
 */
function TituloSecao({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-xl italic">{children}</h2>;
}

export default async function PerfilPage() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const [itensRotina, complementaresAtuais, perfis] = await Promise.all([
    buscarItensRotina(usuario.id),
    buscarComplementaresAtuais(usuario.id),
    buscarPerfisDeEstilo(),
  ]);

  const perfisComImagem: PerfilComImagem[] = perfis.map((perfil) => {
    const slug = slugPerfil(perfil.nome);
    const caminhoAbsoluto = join(process.cwd(), "public", "estilos", `${slug}.svg`);
    return { ...perfil, imagemSrc: existsSync(caminhoAbsoluto) ? `/estilos/${slug}.svg` : null };
  });

  return (
    <div className="flex flex-col gap-8 p-4 pb-8">
      <section className="flex flex-col gap-3">
        <TituloSecao>Conta</TituloSecao>
        <div className="rounded-2xl bg-secondary p-4">
          <h1 className="text-2xl font-medium">{usuario.nome}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{usuario.email}</p>
          {usuario.cidade && <p className="mt-1 text-sm text-muted-foreground">{usuario.cidade}</p>}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <TituloSecao>Assinatura</TituloSecao>
        <AssinaturaCard trialIniciadoEm={usuario.trialIniciadoEm} />
      </section>

      <section className="flex flex-col gap-3">
        <TituloSecao>Aparência</TituloSecao>
        <SeletorTema />
      </section>

      <section className="flex flex-col gap-3">
        <TituloSecao>Notificação</TituloSecao>
        <NotificacaoForm horarioAtual={usuario.notificacaoHorario} />
        <AtivarNotificacoes />
      </section>

      <section className="flex flex-col gap-3">
        <TituloSecao>Rotina semanal</TituloSecao>
        <RotinaEditor itens={itensRotina} />
      </section>

      <section className="flex flex-col gap-3">
        <TituloSecao>Estilo</TituloSecao>
        <EstiloEditor
          perfis={perfisComImagem}
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
