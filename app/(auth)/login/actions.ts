"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function autenticar(_estadoAnterior: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      senha: formData.get("senha"),
      redirectTo: "/hoje",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "E-mail ou senha inválidos.";
    }
    throw error;
  }
}
