import { notFound } from "next/navigation";
import Link from "next/link";
import { getDistroBySlug } from "@/lib/distros";

type Props = { params: Promise<{ slug: string }> };

// `params` + MongoDB só existem em tempo de request.
export const instant = false;

export default async function DistroPage({ params }: Props) {
  const { slug } = await params;
  const distro = await getDistroBySlug(slug);

  if (!distro) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/distros" className="text-sm text-emerald-400 hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-4 text-4xl font-bold">{distro.nome}</h1>

      <div className="mt-3 flex flex-wrap gap-2">
        {distro.foco.map((f) => (
          <span
            key={f}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-emerald-400"
          >
            {f}
          </span>
        ))}
      </div>

      <p className="mt-6 text-zinc-300">{distro.descricao}</p>

      {distro.versao && (
        <p className="mt-4 text-sm text-zinc-500">Versão: {distro.versao}</p>
      )}

      <div className="mt-8 flex gap-3">
        <a
          href={distro.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-emerald-600 px-5 py-2 font-medium hover:bg-emerald-500"
        >
          Baixar
        </a>
        {distro.siteUrl && (
          <a
            href={distro.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zinc-700 px-5 py-2 hover:border-emerald-500"
          >
            Site oficial
          </a>
        )}
      </div>
    </main>
  );
}