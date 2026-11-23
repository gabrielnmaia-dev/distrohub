import { requireAdminPage } from "@/lib/session";

// A sessão é lida via cookie: a rota pode bloquear (não há shell estático
// útil para um painel autenticado). Sem isso, o `next build` falha ao
// tentar pré-renderizar /admin.
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <p className="mb-6 text-sm uppercase tracking-wide text-zinc-500">
        Painel admin
      </p>
      {children}
    </div>
  );
}