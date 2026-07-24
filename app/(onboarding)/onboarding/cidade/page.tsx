import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { CidadeForm } from "./cidade-form";

export default async function OnboardingCidadePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const passo = await proximoPassoOnboarding(session.user.id);
  if (passo !== "cidade") redirect(caminhoDoPasso(passo));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Onde você mora?</h1>
        <p className="text-muted-foreground">Usamos sua cidade pra saber o clima do dia.</p>
      </div>
      <CidadeForm />
    </div>
  );
}
