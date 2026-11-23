"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CodePreview from "@/components/configurador/CodePreview";
import { compileScript, SCRIPT_FILENAME, summarizeSelection } from "@/lib/script-compiler";
import {
  FAMILY_LABELS,
  METHOD_LABELS,
  PACKS,
  PACK_LABELS,
  PACK_TAGLINES,
  type DistroHubDistro,
  type Pack,
  type PresetResponse,
  type SoftwarePackage,
} from "@/types/distrohub";

interface PackConfiguratorProps {
  distros: DistroHubDistro[];
  packages: SoftwarePackage[];
  initialDistroSlug: string;
  initialPack: Pack;
}

type ShareState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; response: PresetResponse };

function defaultsFor(packages: SoftwarePackage[], pack: Pack): string[] {
  return packages
    .filter((pkg) => pkg.pack === pack && pkg.defaultSelected)
    .map((pkg) => pkg.slug);
}

function isPresetResponse(value: unknown): value is PresetResponse {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.shortId === "string" &&
    typeof record.rawUrl === "string" &&
    typeof record.curlCommand === "string"
  );
}

function errorMessage(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record.erro === "string") return record.erro;
  }
  return "Não foi possível gerar o link. Tente novamente.";
}

export default function PackConfigurator({
  distros,
  packages,
  initialDistroSlug,
  initialPack,
}: PackConfiguratorProps) {
  const [distroSlug, setDistroSlug] = useState(
    initialDistroSlug || distros[0]?.slug || ""
  );
  const [pack, setPack] = useState<Pack>(initialPack);
  const [selected, setSelected] = useState<string[]>(() =>
    defaultsFor(packages, initialPack)
  );
  const [query, setQuery] = useState("");
  const [share, setShare] = useState<ShareState>({ status: "idle" });
  const [copied, setCopied] = useState<string | null>(null);

  const distro =
    distros.find((item) => item.slug === distroSlug) ?? distros[0] ?? null;

  const selectedPackages = useMemo(
    () => packages.filter((pkg) => selected.includes(pkg.slug)),
    [packages, selected]
  );

  const script = useMemo(() => {
    if (!distro) return "";
    return compileScript({
      distro: {
        slug: distro.slug,
        name: distro.name,
        family: distro.family,
        isoUrl: distro.isoUrl,
      },
      packages: selectedPackages,
    });
  }, [distro, selectedPackages]);

  const summary = useMemo(
    () =>
      distro
        ? summarizeSelection(
            {
              slug: distro.slug,
              name: distro.name,
              family: distro.family,
              isoUrl: distro.isoUrl,
            },
            selectedPackages
          )
        : null,
    [distro, selectedPackages]
  );

  const visiblePackages = useMemo(() => {
    const term = query.trim().toLowerCase();
    return packages
      .filter((pkg) => pkg.pack === pack)
      .filter((pkg) => {
        if (!term) return true;
        return (
          pkg.name.toLowerCase().includes(term) ||
          pkg.description.toLowerCase().includes(term) ||
          pkg.subcategory.toLowerCase().includes(term)
        );
      })
      .sort(
        (a, b) =>
          a.subcategory.localeCompare(b.subcategory, "pt-BR") ||
          a.name.localeCompare(b.name, "pt-BR")
      );
  }, [packages, pack, query]);

  const groups = useMemo(() => {
    const map = new Map<string, SoftwarePackage[]>();
    for (const pkg of visiblePackages) {
      const list = map.get(pkg.subcategory) ?? [];
      list.push(pkg);
      map.set(pkg.subcategory, list);
    }
    return [...map.entries()];
  }, [visiblePackages]);

  const countByPack = useMemo(() => {
    const selectedSet = new Set(selected);
    return PACKS.reduce<Record<Pack, number>>(
      (acc, item) => {
        acc[item] = packages.filter(
          (pkg) => pkg.pack === item && selectedSet.has(pkg.slug)
        ).length;
        return acc;
      },
      { dev: 0, creator: 0, gaming: 0 }
    );
  }, [packages, selected]);

  if (!distro) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
        Catálogo vazio. Rode <code className="text-emerald-400">npm run seed</code>{" "}
        para popular o banco.
      </p>
    );
  }

  function handleDistroChange(slug: string) {
    setDistroSlug(slug);
    setShare({ status: "idle" });
  }

  function handlePackChange(next: Pack) {
    setPack(next);
    setQuery("");
    setShare({ status: "idle" });

    const hasSelectionInPack = selected.some((slug) =>
      packages.some((pkg) => pkg.slug === slug && pkg.pack === next)
    );

    if (!hasSelectionInPack) {
      setSelected((prev) => [
        ...new Set([...prev, ...defaultsFor(packages, next)]),
      ]);
    }
  }

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
    setShare({ status: "idle" });
  }

  function selectDefaults() {
    setSelected((prev) => [
      ...new Set([...prev, ...defaultsFor(packages, pack)]),
    ]);
    setShare({ status: "idle" });
  }

  function clearPack() {
    const packSlugs = new Set(
      packages.filter((pkg) => pkg.pack === pack).map((pkg) => pkg.slug)
    );
    setSelected((prev) => prev.filter((slug) => !packSlugs.has(slug)));
    setShare({ status: "idle" });
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  function downloadScript() {
    const blob = new Blob([script], {
      type: "text/x-shellscript;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = SCRIPT_FILENAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function generateLink() {
    setShare({ status: "loading" });
    try {
      const response = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distroSlug: distro?.slug,
          selectedPackageSlugs: selectedPackages.map((pkg) => pkg.slug),
        }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        setShare({ status: "error", message: errorMessage(data) });
        return;
      }
      if (!isPresetResponse(data)) {
        setShare({
          status: "error",
          message: "Resposta inesperada da API de presets.",
        });
        return;
      }

      setShare({ status: "ready", response: data });
    } catch {
      setShare({
        status: "error",
        message: "Falha de rede ao gerar o link. Verifique sua conexão.",
      });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="min-w-0 space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <label
            htmlFor="distro-select"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Distro de destino
          </label>
          <select
            id="distro-select"
            value={distro.slug}
            onChange={(event) => handleDistroChange(event.target.value)}
            className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500"
          >
            {distros.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-400">
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-emerald-400">
              {FAMILY_LABELS[distro.family]}
            </span>
            <a
              href={distro.isoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              ISO oficial ↗
            </a>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-2">
            {PACKS.map((item) => {
              const active = item === pack;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePackChange(item)}
                  aria-pressed={active}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition sm:text-sm ${
                    active
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {PACK_LABELS[item]}
                  <span className="ml-1 text-[10px] text-zinc-500">
                    ({countByPack[item]})
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500">{PACK_TAGLINES[pack]}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar pacote..."
            className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={selectDefaults}
            className="rounded-md border border-zinc-700 px-3 py-2 text-xs hover:border-emerald-500 hover:text-emerald-400"
          >
            Selecionar padrão
          </button>
          <button
            type="button"
            onClick={clearPack}
            className="rounded-md border border-zinc-700 px-3 py-2 text-xs hover:border-red-500 hover:text-red-400"
          >
            Limpar
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
            Nenhum pacote encontrado para “{query}”.
          </p>
        ) : (
          <div className="space-y-5">
            {groups.map(([subcategory, items]) => (
              <div key={subcategory}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {subcategory}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((pkg) => {
                    const active = selected.includes(pkg.slug);
                    return (
                      <button
                        key={pkg.slug}
                        type="button"
                        onClick={() => toggle(pkg.slug)}
                        aria-pressed={active}
                        className={`flex h-full flex-col rounded-lg border p-3 text-left transition ${
                          active
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
                        }`}
                      >
                        <span className="flex items-start gap-2">
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                              active
                                ? "border-emerald-400 bg-emerald-500 text-zinc-950"
                                : "border-zinc-600 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="text-sm font-medium text-zinc-100">
                            {pkg.name}
                          </span>
                        </span>
                        <span className="mt-1 pl-6 text-xs leading-snug text-zinc-400">
                          {pkg.description}
                        </span>
                        <span className="mt-2 pl-6 text-[11px] text-zinc-500">
                          {METHOD_LABELS[pkg.targets[distro.family].method]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-200">
              Prévia do script
            </h2>
            <span className="text-xs text-zinc-500">
              {selectedPackages.length} pacote(s) · {script.split("\n").length}{" "}
              linhas
            </span>
          </div>

          {summary && (
            <p className="text-[11px] text-zinc-500">
              nativos {summary.native} · AUR {summary.aur} · Flatpak{" "}
              {summary.flatpak} · scripts {summary.script}
            </p>
          )}

          <CodePreview code={script} />

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => copyText(script, "script")}
              className="rounded-md border border-zinc-700 px-3 py-2 text-xs font-medium hover:border-emerald-500 hover:text-emerald-400"
            >
              {copied === "script" ? "Copiado!" : "Copiar Script"}
            </button>
            <button
              type="button"
              onClick={downloadScript}
              className="rounded-md border border-zinc-700 px-3 py-2 text-xs font-medium hover:border-emerald-500 hover:text-emerald-400"
            >
              Baixar {SCRIPT_FILENAME}
            </button>
          </div>

          <button
            type="button"
            onClick={generateLink}
            disabled={
              share.status === "loading" || selectedPackages.length === 0
            }
            className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {share.status === "loading"
              ? "Gerando link..."
              : "Gerar link curl | bash"}
          </button>

          {share.status === "error" && (
            <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {share.message}
            </p>
          )}

          {share.status === "ready" && (
            <div className="space-y-2 rounded-lg border border-emerald-800/60 bg-emerald-500/5 p-3">
              <p className="text-xs text-zinc-400">
                Cole no terminal da sua distro:
              </p>
              <pre className="overflow-x-auto rounded bg-zinc-950 p-2 text-[11.5px] text-emerald-300">
                {share.response.curlCommand}
              </pre>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyText(share.response.curlCommand, "curl")
                  }
                  className="rounded border border-emerald-700 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/10"
                >
                  {copied === "curl" ? "Copiado!" : "Copiar comando"}
                </button>
                <a
                  href={share.response.rawUrl}
                  className="rounded border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-emerald-500"
                >
                  Ver .sh ({share.response.shortId})
                </a>
                <Link
                  href="/quiz"
                  className="rounded border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-emerald-500"
                >
                  Refazer quiz
                </Link>
              </div>
            </div>
          )}

          <p className="text-[11px] leading-relaxed text-zinc-600">
            O script é gerado localmente, no seu navegador. O link{" "}
            <code className="text-zinc-400">curl | bash</code> guarda apenas a
            distro e os slugs dos pacotes — nada é executado no servidor.
          </p>
        </div>
      </aside>
    </div>
  );
}
