import { CATALOG_DISTROS, getDistroIconUrl } from "@/lib/distrohub-catalog";
import { connectDB } from "@/lib/mongodb";
import Distro from "@/models/Distro";
import { FOCOS, type Distro as DistroType, type Foco } from "@/types";
import type { DistroHubDistro } from "@/types/distrohub";

function normalizeFoco(raw: string): Foco | null {
  if (raw === "produtividade" || raw === "creator" || raw === "criadores") {
    return "criadores";
  }
  if (raw === "gaming" || raw === "jogos") {
    return "jogos";
  }
  if ((FOCOS as readonly string[]).includes(raw)) {
    return raw as Foco;
  }
  return null;
}

export function toLegacyDistro(distro: DistroHubDistro): DistroType {
  const foco = new Set<Foco>();
  if (distro.recommendedPacks.includes("dev")) foco.add("dev");
  if (distro.recommendedPacks.includes("creator")) foco.add("criadores");
  if (distro.recommendedPacks.includes("gaming")) foco.add("jogos");
  if (distro.quizWeights.expBeginner >= 8) foco.add("iniciantes");

  return {
    _id: distro.slug,
    nome: distro.name,
    slug: distro.slug,
    foco: [...foco],
    descricao: distro.tagline,
    versao: "",
    downloadUrl: distro.isoUrl,
    siteUrl: distro.isoUrl,
    iconeUrl: getDistroIconUrl(distro.slug, distro.iconUrl),
    createdAt: "",
    updatedAt: "",
  };
}

function normalizeDistroDoc(distro: DistroType): DistroType {
  const normalizedFocos = new Set<Foco>();
  for (const item of distro.foco ?? []) {
    const mapped = normalizeFoco(item);
    if (mapped) normalizedFocos.add(mapped);
  }

  // Se a distro existir no catálogo canônico do PDF, garante os focos do PDF
  const catalogMatch = CATALOG_DISTROS.find((d) => d.slug === distro.slug);
  if (catalogMatch) {
    for (const f of toLegacyDistro(catalogMatch).foco) {
      normalizedFocos.add(f);
    }
  }

  return {
    ...distro,
    foco: [...normalizedFocos],
    iconeUrl: getDistroIconUrl(distro.slug, distro.iconeUrl),
  };
}

function getFallbackDistros(foco?: string): DistroType[] {
  const all = CATALOG_DISTROS.map(toLegacyDistro).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
  const targetFoco = foco ? normalizeFoco(foco) : null;
  if (!targetFoco) return all;
  return all.filter((d) => d.foco.includes(targetFoco));
}

export async function getDistros(foco?: string): Promise<DistroType[]> {
  const targetFoco = foco ? normalizeFoco(foco) : null;

  try {
    await connectDB();
    const docs = await Distro.find({}).sort({ nome: 1 }).lean();
    if (docs.length === 0) return getFallbackDistros(foco);

    const parsed: DistroType[] = JSON.parse(JSON.stringify(docs));
    const mergedBySlug = new Map<string, DistroType>();

    for (const catalogDistro of CATALOG_DISTROS) {
      mergedBySlug.set(catalogDistro.slug, toLegacyDistro(catalogDistro));
    }
    for (const doc of parsed) {
      mergedBySlug.set(doc.slug, normalizeDistroDoc(doc));
    }

    const all = [...mergedBySlug.values()].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR")
    );

    if (!targetFoco) return all;
    return all.filter((d) => d.foco.includes(targetFoco));
  } catch {
    return getFallbackDistros(foco);
  }
}

export async function getDistroBySlug(slug: string): Promise<DistroType | null> {
  try {
    await connectDB();
    const distro = await Distro.findOne({ slug }).lean();
    if (distro) {
      const parsed: DistroType = JSON.parse(JSON.stringify(distro));
      return normalizeDistroDoc(parsed);
    }
  } catch {
    // Fallback para o catálogo estático quando o MongoDB não está disponível
  }
  const found = CATALOG_DISTROS.find((d) => d.slug === slug);
  return found ? toLegacyDistro(found) : null;
}
