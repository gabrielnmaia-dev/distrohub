import { io } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import HubDistro from "@/models/HubDistro";
import SoftwarePackageModel from "@/models/SoftwarePackage";
import {
  CATALOG_DISTROS,
  CATALOG_PACKAGES,
  getDistroIconUrl,
} from "@/lib/distrohub-catalog";
import type {
  DistroHubDistro,
  SoftwarePackage,
  TargetSpec,
} from "@/types/distrohub";

/**
 * Camada de leitura do catálogo.
 *
 * Se o banco ainda não foi populado (ou está indisponível), as páginas
 * continuam funcionando com o catálogo estático — o seed é idempotente e
 * pode rodar a qualquer momento.
 */

type LeanDistro = Omit<DistroHubDistro, "_id"> & { _id?: unknown };
type LeanPackage = Omit<SoftwarePackage, "_id"> & { _id?: unknown };

function toDistro(doc: LeanDistro): DistroHubDistro {
  return {
    slug: doc.slug,
    name: doc.name,
    family: doc.family,
    recommendedPacks: [...doc.recommendedPacks],
    tagline: doc.tagline,
    isoUrl: doc.isoUrl,
    iconUrl: getDistroIconUrl(doc.slug, doc.iconUrl),
    quizWeights: { ...doc.quizWeights },
  };
}

function toTarget(target: TargetSpec): TargetSpec {
  return target.postHook
    ? { method: target.method, pkg: target.pkg, postHook: target.postHook }
    : { method: target.method, pkg: target.pkg };
}

function toPackage(doc: LeanPackage): SoftwarePackage {
  return {
    slug: doc.slug,
    name: doc.name,
    pack: doc.pack,
    subcategory: doc.subcategory,
    description: doc.description,
    defaultSelected: doc.defaultSelected,
    targets: {
      debian: toTarget(doc.targets.debian),
      fedora: toTarget(doc.targets.fedora),
      "fedora-atomic": toTarget(doc.targets["fedora-atomic"]),
      arch: toTarget(doc.targets.arch),
    },
  };
}

function sortDistros(distros: DistroHubDistro[]): DistroHubDistro[] {
  return [...distros].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function sortPackages(packages: SoftwarePackage[]): SoftwarePackage[] {
  return [...packages].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export interface MemoryPreset {
  shortId: string;
  distroSlug: string;
  selectedPackageSlugs: string[];
  downloadsCount: number;
  createdAt: string;
}

declare global {
  var memoryPresetsCache: Map<string, MemoryPreset> | undefined;
}

export const memoryPresets: Map<string, MemoryPreset> =
  global.memoryPresetsCache ?? (global.memoryPresetsCache = new Map());

export async function getQuizDistros(): Promise<DistroHubDistro[]> {
  // O Mongoose usa `new Date()` internamente nas queries. Fora do request isso
  // quebra o prerender com Cache Components; `io()` mantém a leitura fora do
  // shell estático (funciona também no free tier da Vercel).
  await io();
  try {
    await connectDB();
    const docs = (await HubDistro.find({}).lean()) as unknown as LeanDistro[];
    if (docs.length === 0) return sortDistros(CATALOG_DISTROS);
    return sortDistros(docs.map(toDistro));
  } catch {
    return sortDistros(CATALOG_DISTROS);
  }
}

export async function getCatalogPackages(): Promise<SoftwarePackage[]> {
  await io();
  try {
    await connectDB();
    const docs = (await SoftwarePackageModel.find({}).lean()) as unknown as LeanPackage[];
    if (docs.length === 0) return sortPackages(CATALOG_PACKAGES);
    return sortPackages(docs.map(toPackage));
  } catch {
    return sortPackages(CATALOG_PACKAGES);
  }
}
