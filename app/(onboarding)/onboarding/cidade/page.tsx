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
    <EntradaEscalonada className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Onde você mora?</h1>
        <p className="text-muted-foreground">Usamos sua cidade pra saber o clima do dia.</p>
      </div>
      <CidadeForm />
      {/* Tela dividida, imagem na parte de baixo — mesmo princípio do
          carrossel de abertura, sem ser o carrossel em si (design.md). */}
      <div className="relative h-48 overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/abertura/hero-2.svg" alt="" className="h-full w-full object-cover" />
      </div>
    </EntradaEscalonada>
  );
}
