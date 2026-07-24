import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";

const credenciaisSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credenciaisSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const [usuario] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.email, parsed.data.email))
          .limit(1);
        if (!usuario) return null;

        const senhaValida = await bcrypt.compare(parsed.data.senha, usuario.senhaHash);
        if (!senhaValida) return null;

        return { id: usuario.id, email: usuario.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
});

/**
 * Helper usado por várias fatias (Hoje, Looks, Perfil, onboarding) que
 * precisam da linha completa da usuária logada, não só do id da sessão.
 * `null` cobre tanto "sem sessão" quanto "sessão órfã" (usuário
 * removido do banco com JWT ainda válido).
 */
export async function usuarioAutenticado() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, session.user.id)).limit(1);
  return usuario ?? null;
}
