import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { getCatalogoClient } from "@/lib/catalogo/cliente";
import { EntradaEscalonada } from "@/components/mixa/entrada-escalonada";
import { EstiloQuiz, type PerfilComReferencia } from "./estilo-quiz";

export default async function OnboardingEstiloPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const passo = await proximoPassoOnboarding(session.user.id);
  if (passo !== "estilo") redirect(caminhoDoPasso(passo));

  const catalogo = getCatalogoClient();
  const perfis = await catalogo.listarPerfisEstilo();

  // Referência visual de cada estilo = colagem de 1 look aprovado
  // marcado com aquele perfil (decisão registrada no plano — a API do
  // catálogo só expõe nome+descrição pra perfil, sem imagem própria).
  const perfisComReferencia: PerfilComReferencia[] = await Promise.all(
    perfis.map(async (perfil) => {
      const looks = await catalogo.listarLooksAprovados({ perfisEstilo: [perfil.id] });
      return { ...perfil, lookReferencia: looks[0] ?? null };
    }),
  );

  return (
    <EntradaEscalonada className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Qual é o seu estilo?</h1>
        <p className="text-muted-foreground">
          Escolha 1 estilo dominante e, se quiser, até 2 complementares.
        </p>
      </div>
      <EstiloQuiz perfis={perfisComReferencia} />
    </EntradaEscalonada>
  );
}
