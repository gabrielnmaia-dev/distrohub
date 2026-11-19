import { requireAdminPage } from "@/lib/session";

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