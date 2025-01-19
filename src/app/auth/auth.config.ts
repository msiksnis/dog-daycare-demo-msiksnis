import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import { loginSchema } from "./login/loginSchema";
import { getUserByEmail } from "@/app/auth/data/user";

export default {
  providers: [
    Google,
    Credentials({
      async authorize(credentials) {
        const validatedData = loginSchema.safeParse(credentials);

        if (!validatedData.success) return null;

        const { email, password } = validatedData.data;

        const user = await getUserByEmail(email);
        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) return user;

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
