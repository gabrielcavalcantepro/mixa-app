import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect(caminhoDoPasso(await proximoPassoOnboarding(session.user.id)));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logotipo-horizontal-preto.svg" alt="Mixa" className="h-9 w-auto" />
        </h1>
        <p className="mb-8 text-muted-foreground">Seu look do dia, pronto — todo dia.</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/onboarding/conta" className="underline underline-offset-4">
            Comece por aqui
          </Link>
        </p>
      </div>
    </main>
  );
}
