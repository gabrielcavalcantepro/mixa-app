import { redirect } from "next/navigation";
import { Tag } from "lucide-react";
import { auth } from "@/lib/auth";

/**
 * Shell da aba — depende inteiramente de infraestrutura de afiliados
 * que ainda não existe (ver SPEC, "Fora de escopo"). Sem fonte de dado
 * real por enquanto, de propósito.
 */
export default async function PromosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="text-sm text-muted-foreground">Promos</p>
        <h1 className="text-3xl">Promoções</h1>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
        <Tag className="size-8" strokeWidth={1.5} />
        <p>Em breve, promoções de peças das lojas parceiras por aqui.</p>
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="font-medium">Grupo VIP de Promoções</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Bônus da sua assinatura — ofertas exclusivas no WhatsApp, enquanto sua assinatura estiver
          ativa.
        </p>
        <button
          type="button"
          disabled
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground opacity-50"
        >
          Entrar no grupo (em breve)
        </button>
      </div>
    </div>
  );
}
