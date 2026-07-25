import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { TelaAbertura } from "./_components/tela-abertura";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect(caminhoDoPasso(await proximoPassoOnboarding(session.user.id)));
  }

  return <TelaAbertura />;
}
