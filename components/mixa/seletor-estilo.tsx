"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CartaoPerfilEstilo, type PerfilComImagem } from "./cartao-perfil-estilo";

/**
 * Regra de dominante/complementar — mora só aqui (design.md), reaproveitada
 * pelos 2 únicos consumidores (quiz de estilo do onboarding e modal de
 * estilo do Perfil), em vez de duplicada entre os dois:
 * - Dominante é obrigatório, 1 entre os perfis que a API devolver (nunca
 *   assume uma quantidade fixa — `perfis` pode ter qualquer tamanho).
 * - Complementares mostra todos os outros, exceto o dominante atual, até
 *   2 marcados.
 * - Trocar o dominante remove ele da lista de complementares
 *   automaticamente, se estava lá — nunca fica marcado nos dois ao mesmo
 *   tempo.
 */
export function useSeletorEstilo(dominanteInicial: string, complementaresIniciais: string[]) {
  const [dominante, setDominante] = useState(dominanteInicial);
  const [complementares, setComplementares] = useState<string[]>(complementaresIniciais);

  function selecionarDominante(id: string) {
    setDominante(id);
    setComplementares((atual) => atual.filter((c) => c !== id));
  }

  function alternarComplementar(id: string, marcado: boolean) {
    if (marcado) {
      if (complementares.length >= 2) return;
      setComplementares((atual) => [...atual, id]);
    } else {
      setComplementares((atual) => atual.filter((c) => c !== id));
    }
  }

  return { dominante, complementares, selecionarDominante, alternarComplementar };
}

/**
 * Grade de cartões (mesmo `CartaoPerfilEstilo` do onboarding) + os hidden
 * inputs `dominante`/`complementares` prontos pro FormData da Server
 * Action de cada consumidor. Título/subtítulo e o peso da legenda ficam
 * configuráveis porque o onboarding pede hierarquia grande (design.md,
 * "títulos de seção... maiores/mais fortes que o corpo") enquanto o modal
 * do Perfil é mais compacto (já tem `DialogDescription` explicando) — só
 * a matemática de seleção e a grade em si são compartilhadas de verdade.
 */
export function SeletorEstilo({
  perfis,
  dominante,
  complementares,
  selecionarDominante,
  alternarComplementar,
  idPrefix,
  tituloDominante,
  subtituloDominante,
  tituloComplementares,
  subtituloComplementares,
  classeLegenda = "font-heading text-xl font-semibold",
}: {
  perfis: PerfilComImagem[];
  dominante: string;
  complementares: string[];
  selecionarDominante: (id: string) => void;
  alternarComplementar: (id: string, marcado: boolean) => void;
  idPrefix: string;
  tituloDominante: React.ReactNode;
  subtituloDominante?: string;
  tituloComplementares: React.ReactNode;
  subtituloComplementares?: string;
  classeLegenda?: string;
}) {
  return (
    <>
      <input type="hidden" name="dominante" value={dominante} />
      {complementares.map((id) => (
        <input key={id} type="hidden" name="complementares" value={id} />
      ))}

      <fieldset className="flex flex-col">
        <legend className={classeLegenda}>{tituloDominante}</legend>
        {subtituloDominante && (
          <p className="mt-1 mb-4 text-sm text-muted-foreground">{subtituloDominante}</p>
        )}
        <RadioGroup
          value={dominante}
          onValueChange={selecionarDominante}
          className={`grid grid-cols-2 gap-3 ${subtituloDominante ? "" : "mt-3"}`}
        >
          {perfis.map((perfil) => (
            <CartaoPerfilEstilo
              key={perfil.id}
              perfil={perfil}
              selecionado={dominante === perfil.id}
              htmlFor={`${idPrefix}-dominante-${perfil.id}`}
              controle={<RadioGroupItem value={perfil.id} id={`${idPrefix}-dominante-${perfil.id}`} />}
            />
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="flex flex-col">
        <legend className={classeLegenda}>{tituloComplementares}</legend>
        {subtituloComplementares && (
          <p className="mt-1 mb-4 text-sm text-muted-foreground">{subtituloComplementares}</p>
        )}
        <div className={`grid grid-cols-2 gap-3 ${subtituloComplementares ? "" : "mt-3"}`}>
          {perfis
            .filter((perfil) => perfil.id !== dominante)
            .map((perfil) => {
              const marcado = complementares.includes(perfil.id);
              const bloqueado = !marcado && complementares.length >= 2;
              return (
                <CartaoPerfilEstilo
                  key={perfil.id}
                  perfil={perfil}
                  selecionado={marcado}
                  bloqueado={bloqueado}
                  htmlFor={`${idPrefix}-complementar-${perfil.id}`}
                  controle={
                    <Checkbox
                      id={`${idPrefix}-complementar-${perfil.id}`}
                      checked={marcado}
                      disabled={bloqueado}
                      onCheckedChange={(valor) => alternarComplementar(perfil.id, valor === true)}
                    />
                  }
                />
              );
            })}
        </div>
      </fieldset>
    </>
  );
}
