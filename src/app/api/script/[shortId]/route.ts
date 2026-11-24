import { NextResponse } from "next/server";
import { CATALOG_DISTROS, CATALOG_PACKAGES } from "@/lib/distrohub-catalog";
import { memoryPresets } from "@/lib/distrohub-data";
import { connectDB } from "@/lib/mongodb";
import {
  compileScript,
  SCRIPT_FILENAME,
  type CompilerPackage,
} from "@/lib/script-compiler";
import { SHORT_ID_PATTERN } from "@/lib/short-id";
import HubDistro from "@/models/HubDistro";
import ScriptPreset from "@/models/ScriptPreset";
import SoftwarePackageModel from "@/models/SoftwarePackage";
import type {
  DistroFamily,
  DistroHubDistro,
  PackageTargets,
  Pack,
  SoftwarePackage,
} from "@/types/distrohub";

type Context = { params: Promise<{ shortId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { shortId } = await params;

  if (!SHORT_ID_PATTERN.test(shortId)) {
    return NextResponse.json({ erro: "Preset inválido." }, { status: 404 });
  }

  let presetData: { distroSlug: string; selectedPackageSlugs: string[] } | null =
    null;
  let dbConnected = false;

  try {
    await connectDB();
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  if (dbConnected) {
    const preset = await ScriptPreset.findOne({ shortId }).lean();
    if (preset) {
      await ScriptPreset.updateOne(
        { _id: preset._id },
        { $inc: { downloadsCount: 1 } }
      );
      presetData = {
        distroSlug: preset.distroSlug,
        selectedPackageSlugs: preset.selectedPackageSlugs,
      };
    }
  }

  if (!presetData) {
    const mem = memoryPresets.get(shortId);
    if (mem) {
      mem.downloadsCount += 1;
      presetData = {
        distroSlug: mem.distroSlug,
        selectedPackageSlugs: mem.selectedPackageSlugs,
      };
    }
  }

  if (!presetData) {
    return NextResponse.json({ erro: "Preset não encontrado." }, { status: 404 });
  }

  let distro: DistroHubDistro | null = dbConnected
    ? await HubDistro.findOne({ slug: presetData.distroSlug }).lean()
    : null;
  if (!distro) {
    distro =
      CATALOG_DISTROS.find((d) => d.slug === presetData.distroSlug) ?? null;
  }

  if (!distro) {
    return NextResponse.json(
      { erro: "A distro deste preset não existe mais." },
      { status: 410 }
    );
  }

  let docs: SoftwarePackage[] = dbConnected
    ? await SoftwarePackageModel.find({
        slug: { $in: presetData.selectedPackageSlugs },
      }).lean()
    : [];
  if (docs.length === 0) {
    docs = CATALOG_PACKAGES.filter((p) =>
      presetData.selectedPackageSlugs.includes(p.slug)
    );
  }

  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));

  const packages: CompilerPackage[] = presetData.selectedPackageSlugs
    .map((slug) => bySlug.get(slug))
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc))
    .map((doc) => ({
      slug: doc.slug,
      name: doc.name,
      pack: doc.pack as Pack,
      targets: doc.targets as PackageTargets,
    }));

  const script = compileScript({
    distro: {
      slug: distro.slug,
      name: distro.name,
      family: distro.family as DistroFamily,
      isoUrl: distro.isoUrl,
    },
    packages,
  });

  return new Response(script, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Content-Disposition": `attachment; filename="${SCRIPT_FILENAME}"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
