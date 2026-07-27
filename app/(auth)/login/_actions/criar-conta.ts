"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { signIn } from "@/lib/auth";

const contaSchema = z
  .object({
    nome: z.string().trim().min(1, "Digite seu nome."),
    email: z.string().email("E-mail inválido."),
    senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export interface EstadoConta {
  erro?: string;
  valores?: { nome?: string; email?: string };
}

/**
 * Continua sendo o mesmo passo 1 do onboarding (conta → cidade → estilo
 * → rotina) — só mudou de onde é apresentado: antes era a página
 * `/onboarding/conta`, agora é a folha de autenticação sobre o
 * carrossel de abertura (ver design.md). A lógica em si não mudou.
 */
export async function criarConta(
  _estadoAnterior: EstadoConta | undefined,
  formData: FormData,
): Promise<EstadoConta> {
  const valoresBrutos = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = contaSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos.", valores: valoresBrutos };
  }

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, parsed.data.email))
    .limit(1);
  if (existente) {
    return { erro: "Já existe uma conta com esse e-mail.", valores: valoresBrutos };
  }

  const senhaHash = await bcrypt.hash(parsed.data.senha, 10);
  // trialIniciadoEm usa o default (agora) — conta criada = trial iniciado.
  await db.insert(usuarios).values({ nome: parsed.data.nome, email: parsed.data.email, senhaHash });

  // signIn com redirectTo lança NEXT_REDIRECT internamente quando dá
  // certo — esperado, não deve ser capturado (mesma convenção do
  // mixa-catalogo).
  await signIn("credentials", {
    email: parsed.data.email,
    senha: parsed.data.senha,
    redirectTo: "/onboarding/cidade",
  });
  return {};
}
