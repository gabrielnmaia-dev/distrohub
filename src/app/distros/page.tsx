import Link from "next/link";
import DistroCard from "@/components/DistroCard";
import { getDistros } from "@/lib/distros";
import { FOCOS, FOCO_LABELS, type Foco } from "@/types";

type Props = { searchParams: Promise<{ foco?: string }> };

// `searchParams` + MongoDB só existem em tempo de request.
export const instant = false;

export default async function DistrosPage({ searchParams }: Props) {
  const { foco } = await searchParams;
  const distros = await getDistros(foco);

  const baseChip = "rounded-full border px-4 py-1.5 text-sm transition";
  const ativo = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
  const inativo =
    "border-zinc-700 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400";

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Catálogo
          </p>
          <h1 className="mt-1 text-3xl font-bold">Distros por Foco</h1>
        </div>
        <span className="text-xs text-zinc-500">
          {distros.length} distro(s) encontrada(s)
        </span>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/distros" className={`${baseChip} ${!foco ? ativo : inativo}`}>
          Todas
        </Link>
        {FOCOS.map((f: Foco) => (
          <Link
            key={f}
            href={`/distros?foco=${f}`}
            className={`${baseChip} ${foco === f ? ativo : inativo}`}
          >
            {FOCO_LABELS[f]}
          </Link>
        ))}
      </div>

      {distros.length === 0 ? (
        <p className="text-zinc-400">Nenhuma distro encontrada.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {distros.map((d) => (
            <DistroCard key={d._id} distro={d} />
          ))}
        </div>
      )}
    </main>
  );
}
