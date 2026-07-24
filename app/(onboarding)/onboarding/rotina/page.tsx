import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { RotinaForm } from "./rotina-form";

export default async function OnboardingRotinaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const passo = await proximoPassoOnboarding(session.user.id);
  if (passo !== "rotina") redirect(caminhoDoPasso(passo));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Sua rotina semanal</h1>
        <p className="text-muted-foreground">
          Isso ajusta o look sugerido pra cada dia. Dá pra editar depois.
        </p>
      </div>
      <RotinaForm />
    </div>
  );
}
