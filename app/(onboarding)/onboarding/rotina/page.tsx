import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { EntradaEscalonada } from "@/components/mixa/entrada-escalonada";
import { RotinaForm } from "./rotina-form";

export default async function OnboardingRotinaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const passo = await proximoPassoOnboarding(session.user.id);
  if (passo !== "rotina") redirect(caminhoDoPasso(passo));

  return (
    <EntradaEscalonada className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 pt-8 pb-10">
      <div>
        <h1 className="font-heading text-4xl leading-tight italic">Sua rotina semanal</h1>
        <p className="mt-2 text-muted-foreground">
          Isso ajusta o look sugerido pra cada dia. Dá pra editar depois.
        </p>
      </div>
      <RotinaForm />
    </EntradaEscalonada>
  );
}
