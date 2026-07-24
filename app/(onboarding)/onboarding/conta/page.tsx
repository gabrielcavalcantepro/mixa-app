import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { ContaForm } from "./conta-form";

export default async function OnboardingContaPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect(caminhoDoPasso(await proximoPassoOnboarding(session.user.id)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Crie sua conta</h1>
        <p className="text-muted-foreground">
          É só o primeiro passo — os próximos ajustam o look certo pra você.
        </p>
      </div>
      <ContaForm />
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </div>
  );
}
