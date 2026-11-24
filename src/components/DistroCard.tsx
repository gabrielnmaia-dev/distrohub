"use client";

import Image from "next/image";
import Link from "next/link";
import { useDistroHubStore } from "@/store/useDistroHubStore";
import { FOCO_LABELS, type Distro } from "@/types";

export default function DistroCard({ distro }: { distro: Distro }) {
  const isFavorite = useDistroHubStore((s) =>
    s.favoriteDistros.includes(distro.slug)
  );
  const toggleFavoriteDistro = useDistroHubStore(
    (s) => s.toggleFavoriteDistro
  );

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 transition hover:border-emerald-500 hover:bg-zinc-900">
      <button
        type="button"
        onClick={() => toggleFavoriteDistro(distro.slug)}
        aria-label={
          isFavorite
            ? `Remover ${distro.nome} dos favoritos`
            : `Favoritar ${distro.nome}`
        }
        aria-pressed={isFavorite}
        className={`absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition ${
          isFavorite
            ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
            : "border-zinc-800 bg-zinc-950/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
        }`}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <Link href={`/distros/${distro.slug}`} className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3.5 pr-8">
            {distro.iconeUrl ? (
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/70 p-2 transition group-hover:border-emerald-500/40">
                <Image
                  src={distro.iconeUrl}
                  alt={`Ícone 3D do ${distro.nome}`}
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110"
                />
              </div>
            ) : null}
            <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-emerald-400">
              {distro.nome}
            </h3>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
            {distro.descricao}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {distro.foco.map((f) => (
            <span
              key={f}
              className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-emerald-400"
            >
              {FOCO_LABELS[f] ?? f}
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
}
