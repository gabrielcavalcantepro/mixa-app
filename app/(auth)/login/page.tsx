import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { LogoMarca } from "@/components/mixa/logo-marca";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect(caminhoDoPasso(await proximoPassoOnboarding(session.user.id)));
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-6">
      {/*
        Logo grande + tagline como elemento dominante da tela (não mais
        um <img> do tamanho de um ícone) — o formulário abaixo fica
        deliberadamente menor/quieto. Vertical (não horizontal) porque é
        empilhado centralizado, o encaixe natural pra um hero assim.
      */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
        <LogoMarca variante="vertical" className="h-44 w-auto" />
        <p className="text-center font-heading text-xl italic text-muted-foreground">
          Seu look do dia, pronto — todo dia.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xs pb-12">
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
