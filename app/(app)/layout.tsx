import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { caminhoDoPasso, proximoPassoOnboarding } from "@/lib/onboarding";
import { BottomNav } from "@/components/shell/bottom-nav";
import { TransicaoDeAba } from "@/components/shell/transicao-de-aba";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const passo = await proximoPassoOnboarding(session.user.id);
  if (passo !== "completo") redirect(caminhoDoPasso(passo));

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <main className="flex-1">
        <TransicaoDeAba>{children}</TransicaoDeAba>
      </main>
      <BottomNav />
    </div>
  );
}
