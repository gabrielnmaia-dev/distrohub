import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// Para páginas e layouts: redireciona quem não pode entrar
export async function requireAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");
  return session;
}

// Para APIs: devolve a sessão se for admin, senão null
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session;
}