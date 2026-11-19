import Link from "next/link";
import type { Distro } from "@/types";

export default function DistroCard({ distro }: { distro: Distro }) {
  return (
    <Link
      href={`/distros/${distro.slug}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-emerald-500"
    >
      <h3 className="text-lg font-semibold">{distro.nome}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
        {distro.descricao}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {distro.foco.map((f) => (
          <span
            key={f}
            className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-emerald-400"
          >
            {f}
          </span>
        ))}
      </div>
    </Link>
  );
}