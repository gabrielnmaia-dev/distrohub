import Link from "next/link";
import { Suspense } from "react";
import PackConfigurator from "@/components/configurador/PackConfigurator";
import { getCatalogPackages, getQuizDistros } from "@/lib/distrohub-data";
import { PACKS, type Pack } from "@/types/distrohub";

export const metadata = {
  title: "Configurador de packs — DistroHub",
  description:
    "Monte seu setup como no Ninite: escolha a distro, marque os pacotes e gere um script .sh com preview em tempo real.",
};

type SearchParams = Promise<{ distro?: string; pack?: string }>;

export default function ConfiguradorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Configurador
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-50 sm:text-4xl">
          Monte seu setup, gere um script
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Escolha a distro, marque os pacotes e acompanhe o{" "}
          <code className="text-emerald-400">.sh</code> sendo montado em tempo
          real. Sem conta, sem telemetria.
        </p>
        <Link
          href="/quiz"
          className="mt-3 inline-block text-xs text-emerald-400 hover:underline"
        >
          Não sabe qual distro escolher? Faça o quiz →
        </Link>
      </header>

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-[32rem] animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
            <div className="h-[32rem] animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
          </div>
        }
      >
        <ConfiguratorLoader searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ConfiguratorLoader({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [params, distros, packages] = await Promise.all([
    searchParams,
    getQuizDistros(),
    getCatalogPackages(),
  ]);

  const initialPack: Pack = PACKS.find((pack) => pack === params.pack) ?? "dev";
  const initialDistroSlug =
    distros.find((distro) => distro.slug === params.distro)?.slug ??
    distros[0]?.slug ??
    "";
  const hasExplicitParams = Boolean(params.distro || params.pack);

  return (
    <PackConfigurator
      distros={distros}
      packages={packages}
      initialDistroSlug={initialDistroSlug}
      initialPack={initialPack}
      hasExplicitParams={hasExplicitParams}
    />
  );
}
