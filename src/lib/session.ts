import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// Para páginas e layouts admin: redireciona quem não está logado ou não é admin
export async function requireAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/");
  return session;
}

// Para APIs admin: devolve a sessão se for admin, senão null
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// Para páginas autenticadas: redireciona para /login caso não esteja logado
export async function requireUserPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}

// Para APIs autenticadas: devolve a sessão do usuário logado ou null
export async function getUserSession() {
  const session = await getServerSession(authOptions);
  return session ?? null;
}
