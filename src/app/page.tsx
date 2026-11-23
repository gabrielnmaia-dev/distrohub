import Link from "next/link";
import DistroCard from "@/components/DistroCard";
import { getDistros } from "@/lib/distros";
import { FOCOS } from "@/types";

// O catálogo vem do MongoDB em tempo de request; a rota pode bloquear.
export const instant = false;

export default async function Home() {
  const distros = await getDistros();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold">DnixHub</h1>
        <p className="mt-2 text-zinc-400">
          Distros Linux separadas por foco, com scripts de setup prontos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/quiz"
            className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-500"
          >
            Descobrir minha distro
          </Link>
          <Link
            href="/configurador"
            className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm font-medium hover:border-emerald-500 hover:text-emerald-400"
          >
            Montar meu pack
          </Link>
        </div>
      </section>

      <section className="mb-10 flex flex-wrap justify-center gap-2">
        {FOCOS.map((f) => (
          <Link
            key={f}
            href={`/distros?foco=${f}`}
            className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm hover:border-emerald-500 hover:text-emerald-400"
          >
            {f}
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Distros</h2>
          <Link href="/distros" className="text-sm text-emerald-400 hover:underline">
            Ver todas
          </Link>
        </div>

        {distros.length === 0 ? (
          <p className="text-zinc-400">Nenhuma distro cadastrada ainda.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {distros.slice(0, 6).map((d) => (
              <DistroCard key={d._id} distro={d} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}