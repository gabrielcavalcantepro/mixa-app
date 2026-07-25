"use client";

import { useState } from "react";
import { CarrosselAbertura } from "./carrossel-abertura";
import { FolhaAutenticacao } from "./folha-autenticacao";

export type ModoAutenticacao = "entrar" | "criar-conta" | null;

/** Orquestra o carrossel + a folha — qual delas está aberta e com qual formulário. */
export function TelaAbertura() {
  const [modo, setModo] = useState<ModoAutenticacao>(null);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <CarrosselAbertura aoTocarEntrar={() => setModo("entrar")} aoTocarCriarConta={() => setModo("criar-conta")} />
      <FolhaAutenticacao modo={modo} aoFechar={() => setModo(null)} aoTrocarModo={setModo} />
    </div>
  );
}
