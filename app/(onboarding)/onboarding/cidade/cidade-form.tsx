"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { salvarCidade, type EstadoCidade } from "./actions";
import { buscarCidadesAction, type SugestaoCidade } from "./_actions/buscar-cidades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Autocomplete com seleção obrigatória (design.md): o campo visível
 * (`texto`) é livre, mas o que vai pro servidor (`cidade`/`uf`, hidden
 * inputs) só é preenchido ao tocar numa sugestão — digitar sem
 * selecionar não habilita o botão. Sugestões vêm da lista real de
 * municípios do IBGE (`buscarCidadesAction`), filtrada por prefixo —
 * não é mais eco do texto digitado.
 */
export function CidadeForm() {
  const [estado, formAction, pending] = useActionState<EstadoCidade | undefined, FormData>(
    salvarCidade,
    undefined,
  );
  const [texto, setTexto] = useState(estado?.valores?.cidade ?? "");
  const [sugestoes, setSugestoes] = useState<SugestaoCidade[]>([]);
  const [selecionada, setSelecionada] = useState<SugestaoCidade | null>(null);
  const [buscando, iniciarBusca] = useTransition();
  const atrasoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function aoDigitar(valor: string) {
    setTexto(valor);
    setSelecionada(null);
    if (atrasoRef.current) clearTimeout(atrasoRef.current);

    const termo = valor.trim();
    if (termo.length < 2) {
      setSugestoes([]);
      return;
    }
    atrasoRef.current = setTimeout(() => {
      iniciarBusca(async () => {
        const resultado = await buscarCidadesAction(termo);
        setSugestoes(resultado);
      });
    }, 300);
  }

  function selecionar(sugestao: SugestaoCidade) {
    setSelecionada(sugestao);
    setTexto(sugestao.label);
    setSugestoes([]);
  }

  const semResultado = !selecionada && !buscando && texto.trim().length >= 2 && sugestoes.length === 0;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="relative flex flex-col gap-2">
        <Label htmlFor="cidade-busca">Cidade</Label>
        <Input
          id="cidade-busca"
          type="text"
          required
          placeholder="Ex.: Fortaleza"
          autoComplete="off"
          value={texto}
          onChange={(evento) => aoDigitar(evento.target.value)}
        />
        <input type="hidden" name="cidade" value={selecionada?.nome ?? ""} />
        <input type="hidden" name="uf" value={selecionada?.uf ?? ""} />

        {sugestoes.length > 0 && (
          <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
            {sugestoes.map((sugestao, indice) => (
              <li key={`${sugestao.label}-${indice}`}>
                <button
                  type="button"
                  onClick={() => selecionar(sugestao)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-secondary"
                >
                  {sugestao.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {buscando && <p className="text-xs text-muted-foreground">Buscando...</p>}
        {semResultado && <p className="text-xs text-muted-foreground">Nenhuma cidade encontrada.</p>}
      </div>
      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending || !selecionada} className="mt-2">
        {pending ? "Salvando..." : "Continuar"}
      </Button>
    </form>
  );
}
