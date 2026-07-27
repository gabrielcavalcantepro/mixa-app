import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { usuarioAutenticado } from "@/lib/auth";
import { ordenarPorSlot } from "@/lib/catalogo/ordem-slots";
import { buscarIdsFavoritos } from "@/lib/favoritos/queries";
import { BotaoFavoritar } from "@/components/mixa/botao-favoritar";
import { buscarLookPorId } from "../_queries/listar-looks";
import { TiraMiniaturas } from "./_components/tira-miniaturas";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LookDetalhePage({ params }: Props) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const { id } = await params;
  const [look, idsFavoritos] = await Promise.all([buscarLookPorId(id), buscarIdsFavoritos(usuario.id)]);
  if (!look) notFound();

  const pecas = ordenarPorSlot(look.pecas);
  const favoritado = idsFavoritos.has(look.id);

  return (
    <div className="flex flex-col gap-5 pb-40">
      <div className="flex items-center gap-1 p-4 pb-0">
        <Link href="/looks" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="size-4" />
          Looks
        </Link>
      </div>

      <TiraMiniaturas pecas={pecas} />

      <div className="flex flex-col gap-4 px-4">
        <div>
          <p className="text-sm text-muted-foreground">{look.capsula.nome}</p>
          {look.nome && <h1 className="font-heading text-3xl italic">{look.nome}</h1>}
        </div>

        <ul className="flex flex-col gap-2">
          {pecas.map((peca) => (
            <li key={peca.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm">
              <span>{peca.nome}</span>
              {peca.linkAfiliado ? (
                <a
                  href={peca.linkAfiliado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-xs underline-offset-4 hover:underline"
                >
                  Comprar
                </a>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">Em breve</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Ação principal fixa embaixo, sempre visível — acima da barra de
          navegação flutuante (não colada nela, as duas ficam visíveis). */}
      <div
        className="fixed inset-x-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur"
        style={{ bottom: "5.5rem" }}
      >
        <div className="mx-auto flex max-w-sm items-center gap-3">
          <BotaoFavoritar lookId={look.id} favoritado={favoritado} />
          <span className="text-sm text-muted-foreground">
            {favoritado ? "Nos seus favoritos" : "Favoritar este look"}
          </span>
        </div>
      </div>
    </div>
  );
}
