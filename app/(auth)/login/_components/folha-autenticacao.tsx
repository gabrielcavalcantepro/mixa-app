"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ModoAutenticacao } from "./tela-abertura";
import { LoginForm } from "./login-form";
import { ContaForm } from "./conta-form";

/**
 * Sobe de baixo cobrindo só parte da tela, com física de mola (não
 * linear seco) — `type: "spring"` do `motion`, saída no mesmo estilo
 * invertido (a própria `AnimatePresence` cuida disso).
 */
export function FolhaAutenticacao({
  modo,
  aoFechar,
  aoTrocarModo,
}: {
  modo: ModoAutenticacao;
  aoFechar: () => void;
  aoTrocarModo: (modo: ModoAutenticacao) => void;
}) {
  return (
    <AnimatePresence>
      {modo && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={aoFechar}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-background px-6 pt-4 shadow-2xl"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2.5rem)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
            {modo === "entrar" ? (
              <>
                <h2 className="mb-5 text-2xl">Entrar</h2>
                <LoginForm />
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Ainda não tem conta?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => aoTrocarModo("criar-conta")}
                  >
                    Criar conta
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="mb-5 text-2xl">Crie sua conta</h2>
                <ContaForm />
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <button type="button" className="underline underline-offset-4" onClick={() => aoTrocarModo("entrar")}>
                    Entrar
                  </button>
                </p>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
