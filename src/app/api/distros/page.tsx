import Link from "next/link";
import DistroCard from "@/components/DistroCard";
import { getDistros } from "@/lib/distros";
import { FOCOS } from "@/types";

type Props = { searchParams: Promise<{ foco?: string }> };

export default async function DistrosPage({ searchParams }: Props) {
  const { foco } = await searchParams;
  const distros = await getDistros(foco);

  const baseChip = "rounded-full border px-4 py-1.5 text-sm";
  const ativo = "border-emerald-500 text-emerald-400";
  const inativo = "border-zinc-700 hover:border-emerald-500";

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Distros</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/distros" className={`${baseChip} ${!foco ? ativo : inativo}`}>
          Todas
        </Link>
        {FOCOS.map((f) => (
          <Link
            key={f}
            href={`/distros?foco=${f}`}
            className={`${baseChip} ${foco === f ? ativo : inativo}`}
          >
            {f}
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