import { redirect } from "next/navigation";
import { Tag } from "lucide-react";
import { usuarioAutenticado } from "@/lib/auth";

/**
 * Shell da aba — depende inteiramente de infraestrutura de afiliados
 * que ainda não existe (ver SPEC, "Fora de escopo"). Sem fonte de dado
 * real por enquanto, de propósito; só ganha o mesmo tratamento de
 * cartão (rounded-2xl + hierarquia Fraunces) das outras abas, sem
 * inventar nenhuma funcionalidade de promoção nova nesta rodada.
 */
export default async function PromosPage() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary py-12 text-center text-muted-foreground">
        <Tag className="size-8" strokeWidth={1.5} />
        <p>Em breve, promoções de peças das lojas parceiras por aqui.</p>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <p className="font-heading text-xl italic">Grupo VIP de Promoções</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Bônus da sua assinatura — ofertas exclusivas no WhatsApp, enquanto sua assinatura estiver
          ativa.
        </p>
        <button
          type="button"
          disabled
          className="mt-3 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground opacity-50"
        >
          Entrar no grupo (em breve)
        </button>
      </div>
    </div>
  );
}
