import { NextResponse } from "next/server";
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
import type { DistroFamily, PackageTargets, Pack } from "@/types/distrohub";

type Context = { params: Promise<{ shortId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { shortId } = await params;

  if (!SHORT_ID_PATTERN.test(shortId)) {
    return NextResponse.json({ erro: "Preset inválido." }, { status: 404 });
  }

  await connectDB();

  const preset = await ScriptPreset.findOne({ shortId }).lean();

  if (!preset) {
    return NextResponse.json({ erro: "Preset não encontrado." }, { status: 404 });
  }

  const distro = await HubDistro.findOne({ slug: preset.distroSlug }).lean();
  if (!distro) {
    return NextResponse.json(
      { erro: "A distro deste preset não existe mais." },
      { status: 410 }
    );
  }

  await ScriptPreset.updateOne({ _id: preset._id }, { $inc: { downloadsCount: 1 } });

  const docs = await SoftwarePackageModel.find({
    slug: { $in: preset.selectedPackageSlugs },
  }).lean();

  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));

  const packages: CompilerPackage[] = preset.selectedPackageSlugs
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
