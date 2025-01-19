import { auth } from "@/auth";

export async function currentUserServer() {
  const session = await auth();

  return session?.user;
}

export async function currentRoleServer() {
  const session = await auth();

  return session?.user?.role;
}
