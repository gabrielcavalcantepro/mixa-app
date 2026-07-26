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
    <EntradaEscalonada className="flex flex-col gap-8 pb-10">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 pt-8">
        <div>
          <h1 className="font-heading text-4xl leading-tight italic">Onde você mora?</h1>
          <p className="mt-2 text-muted-foreground">Usamos sua cidade pra saber o clima do dia.</p>
        </div>
        <CidadeForm />
      </div>

      {/* Imagem de apoio de borda a borda, ~metade da altura da tela —
          ocupa o espaço que antes ficava em branco embaixo do
          formulário (design.md, não um cartão menor com respiro). */}
      <div className="relative h-[48vh] min-h-64 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/abertura/hero-2.svg" alt="" className="h-full w-full object-cover" />
      </div>
    </EntradaEscalonada>
  );
}
