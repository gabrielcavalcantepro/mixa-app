"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";

// Texto real ainda não existe (ver design.md) — lorem ipsum de propósito.
const SLIDES = [
  {
    src: "/abertura/hero-1.svg",
    titulo: "Lorem ipsum dolor sit amet",
    subtitulo: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  },
  {
    src: "/abertura/hero-2.svg",
    titulo: "Ut enim ad minim veniam",
    subtitulo: "Quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    src: "/abertura/hero-3.svg",
    titulo: "Duis aute irure dolor",
    subtitulo: "In reprehenderit in voluptate velit esse cillum dolore.",
  },
  {
    src: "/abertura/hero-4.svg",
    titulo: "Excepteur sint occaecat",
    subtitulo: "Cupidatat non proident, sunt in culpa qui officia.",
  },
];

const DURACAO_MS = 5000;

/**
 * Carrossel estilo Stories, loop infinito. Ken Burns (zoom lento e
 * contínuo enquanto a imagem está visível, não só na troca) + crossfade
 * entre slides — os dois via `motion`, que passou a valer a pena aqui
 * (diferente da passada anterior, que resolveu 3 momentos pontuais só
 * com CSS): física de mola da folha abaixo + esse zoom contínuo
 * sincronizado com a barra de progresso ficariam bem mais frágeis
 * reimplementados à mão com CSS puro.
 */
export function CarrosselAbertura({
  aoTocarEntrar,
  aoTocarCriarConta,
}: {
  aoTocarEntrar: () => void;
  aoTocarCriarConta: () => void;
}) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const temporizador = setTimeout(() => setIndice((atual) => (atual + 1) % SLIDES.length), DURACAO_MS);
    return () => clearTimeout(temporizador);
  }, [indice]);

  const slide = SLIDES[indice];

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence mode="sync">
        <motion.div
          key={indice}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <motion.img
            src={slide.src}
            alt=""
            className="h-full w-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: DURACAO_MS / 1000, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <div className="absolute inset-x-4 flex gap-1.5" style={{ top: "max(env(safe-area-inset-top), 16px)" }}>
        {SLIDES.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            {i < indice ? (
              <div className="h-full w-full bg-white" />
            ) : i === indice ? (
              <motion.div
                key={indice}
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: DURACAO_MS / 1000, ease: "linear" }}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-6 pb-10">
        {/* Logo primeiro, depois título/subtítulo (ordem pedida no
            design.md) — sempre a versão branca aqui, independente do
            tema do app, porque o que manda é ter foto escura atrás, não
            o tema claro/escuro (diferente de um logo sobre bg-background,
            que precisaria reagir ao tema). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logotipo-horizontal-branco.svg" alt="Mixa" className="h-7 w-auto" />

        <AnimatePresence mode="wait">
          <motion.div
            key={indice}
            className="text-center text-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-heading text-3xl italic">{slide.titulo}</h1>
            <p className="mt-2 text-white/80">{slide.subtitulo}</p>
          </motion.div>
        </AnimatePresence>

        <div className="grid w-full grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-white/70 bg-transparent text-white hover:bg-white/10"
            onClick={aoTocarEntrar}
          >
            Entrar
          </Button>
          <Button className="bg-white text-black hover:bg-white/90" onClick={aoTocarCriarConta}>
            Criar conta
          </Button>
        </div>
      </div>
    </div>
  );
}
