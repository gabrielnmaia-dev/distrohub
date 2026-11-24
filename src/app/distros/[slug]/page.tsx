import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDistroBySlug } from "@/lib/distros";
import { FOCO_LABELS, FOCO_PACK_MAP } from "@/types";

type Props = { params: Promise<{ slug: string }> };

// `params` + MongoDB só existem em tempo de request.
export const instant = false;

export default async function DistroPage({ params }: Props) {
  const { slug } = await params;
  const distro = await getDistroBySlug(slug);

  if (!distro) notFound();

  const defaultPack = distro.foco[0] ? FOCO_PACK_MAP[distro.foco[0]] : "dev";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/distros" className="text-sm text-emerald-400 hover:underline">
        ← Voltar para distros
      </Link>

      <div className="mt-5 flex items-center gap-4">
        {distro.iconeUrl ? (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <Image
              src={distro.iconeUrl}
              alt={`Ícone 3D do ${distro.nome}`}
              width={64}
              height={64}
              className="h-16 w-16 object-contain drop-shadow-lg"
            />
          </div>
        ) : null}
        <div>
          <h1 className="text-4xl font-bold">{distro.nome}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {distro.foco.map((f) => (
              <span
                key={f}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-emerald-400"
              >
                {FOCO_LABELS[f] ?? f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-zinc-300">{distro.descricao}</p>

      {distro.versao && (
        <p className="mt-4 text-sm text-zinc-500">Versão: {distro.versao}</p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/configurador?distro=${distro.slug}&pack=${defaultPack}`}
          className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-500"
        >
          Montar pack & script (.sh)
        </Link>
        <a
          href={distro.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium hover:border-emerald-500 hover:text-emerald-400"
        >
          Baixar ISO oficial ↗
        </a>
        {distro.siteUrl && distro.siteUrl !== distro.downloadUrl && (
          <a
            href={distro.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm hover:border-emerald-500"
          >
            Site oficial ↗
          </a>
        )}
      </div>
    </main>
  );
}
