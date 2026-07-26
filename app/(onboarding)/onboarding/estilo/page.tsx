import { existsSync } from "node:fs";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { getCatalogoClient } from "@/lib/catalogo/cliente";
import { EntradaEscalonada } from "@/components/mixa/entrada-escalonada";
import { slugPerfil } from "./_lib/slug-perfil";
import { EstiloQuiz, type PerfilComImagem } from "./estilo-quiz";

export default async function OnboardingEstiloPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const passo = await proximoPassoOnboarding(session.user.id);
  if (passo !== "estilo") redirect(caminhoDoPasso(passo));

  const catalogo = getCatalogoClient();
  const perfis = await catalogo.listarPerfisEstilo();

  // Imagem própria por perfil (retangular, vertical), não mais colagem
  // de peça do catálogo (design.md). Resolvida server-side via
  // fs.existsSync — qualquer perfil novo já mapeia pra um caminho
  // previsível (slugPerfil), sem precisar editar código pra soltar o
  // arquivo depois. Sem o arquivo ainda, cai no placeholder "Em breve".
  const perfisComImagem: PerfilComImagem[] = perfis.map((perfil) => {
    const slug = slugPerfil(perfil.nome);
    const caminhoAbsoluto = join(process.cwd(), "public", "estilos", `${slug}.svg`);
    return { ...perfil, imagemSrc: existsSync(caminhoAbsoluto) ? `/estilos/${slug}.svg` : null };
  });

  return (
    <EntradaEscalonada className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 pt-8 pb-10">
      <div>
        <h1 className="font-heading text-4xl leading-tight italic">Qual é o seu estilo?</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha 1 estilo dominante e, se quiser, até 2 complementares.
        </p>
      </div>
      <EstiloQuiz perfis={perfisComImagem} />
    </EntradaEscalonada>
  );
}
