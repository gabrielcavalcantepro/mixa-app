import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { EntradaEscalonada } from "@/components/mixa/entrada-escalonada";
import { CidadeForm } from "./cidade-form";

export default async function OnboardingCidadePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const passo = await proximoPassoOnboarding(session.user.id);
  if (passo !== "cidade") redirect(caminhoDoPasso(passo));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EntradaEscalonada className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 pt-8 pb-6">
        <div>
          <h1 className="font-heading text-4xl leading-tight italic">Onde você mora?</h1>
          <p className="mt-2 text-muted-foreground">Usamos sua cidade pra saber o clima do dia.</p>
        </div>
        <CidadeForm />
      </EntradaEscalonada>

      {/* Imagem de apoio preenche 100% do espaço restante da tela —
          zero faixa de fundo sobrando antes do rodapé (design.md). O
          flex-1 aqui só funciona porque layout.tsx e
          transicao-de-passo.tsx também viraram flex column até aqui —
          sem essa cadeia, "resto da tela" não tem como ser calculado. */}
      <div className="relative min-h-40 w-full flex-1 overflow-hidden animate-in fade-in duration-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/abertura/hero-2.svg" alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
