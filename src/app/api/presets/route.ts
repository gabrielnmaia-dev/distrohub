import { NextResponse } from "next/server";
import { CATALOG_DISTROS, CATALOG_PACKAGES } from "@/lib/distrohub-catalog";
import { memoryPresets } from "@/lib/distrohub-data";
import { connectDB } from "@/lib/mongodb";
import { generateShortId } from "@/lib/short-id";
import HubDistro from "@/models/HubDistro";
import ScriptPreset from "@/models/ScriptPreset";
import SoftwarePackageModel from "@/models/SoftwarePackage";
import type { PresetRequest, PresetResponse } from "@/types/distrohub";

const MAX_PACKAGES_PER_PRESET = 200;

function parseRequest(value: unknown): PresetRequest | null {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  const distroSlug = record.distroSlug;
  const rawSlugs = record.selectedPackageSlugs;

  if (typeof distroSlug !== "string" || distroSlug.trim().length === 0) {
    return null;
  }
  if (!Array.isArray(rawSlugs)) return null;

  const slugs = rawSlugs.filter(
    (item): item is string => typeof item === "string" && item.length > 0
  );

  return {
    distroSlug: distroSlug.trim(),
    selectedPackageSlugs: [...new Set(slugs)].slice(0, MAX_PACKAGES_PER_PRESET),
  };
}

function resolveOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  return record.code === 11000;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const body = parseRequest(payload);
  if (!body) {
    return NextResponse.json(
      { erro: "Informe distroSlug e selectedPackageSlugs." },
      { status: 400 }
    );
  }

  let dbConnected = false;
  try {
    await connectDB();
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  let distroExists = false;
  let validSlugs = new Set<string>();

  if (dbConnected) {
    const distro = await HubDistro.findOne({ slug: body.distroSlug })
      .select("slug")
      .lean();
    if (distro) {
      distroExists = true;
      const found = await SoftwarePackageModel.find({
        slug: { $in: body.selectedPackageSlugs },
      })
        .select("slug")
        .lean();
      validSlugs = new Set(found.map((doc) => doc.slug));
    }
  }

  if (!distroExists) {
    distroExists = CATALOG_DISTROS.some((d) => d.slug === body.distroSlug);
    validSlugs = new Set(CATALOG_PACKAGES.map((p) => p.slug));
  }

  if (!distroExists) {
    return NextResponse.json({ erro: "Distro não encontrada." }, { status: 404 });
  }

  const selectedPackageSlugs = body.selectedPackageSlugs.filter((slug) =>
    validSlugs.has(slug)
  );

  if (selectedPackageSlugs.length === 0) {
    return NextResponse.json(
      { erro: "Selecione pelo menos um pacote válido." },
      { status: 400 }
    );
  }

  let shortId = generateShortId();
  let created = false;

  if (dbConnected) {
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      shortId = generateShortId();
      try {
        await ScriptPreset.create({
          shortId,
          distroSlug: body.distroSlug,
          selectedPackageSlugs,
          downloadsCount: 0,
        });
        created = true;
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error;
      }
    }
  } else {
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      shortId = generateShortId();
      if (!memoryPresets.has(shortId)) {
        memoryPresets.set(shortId, {
          shortId,
          distroSlug: body.distroSlug,
          selectedPackageSlugs,
          downloadsCount: 0,
          createdAt: new Date().toISOString(),
        });
        created = true;
      }
    }
  }

  if (!created) {
    return NextResponse.json(
      { erro: "Não foi possível gerar um ID único. Tente novamente." },
      { status: 500 }
    );
  }

  const rawUrl = `${resolveOrigin(request)}/api/script/${shortId}`;
  const response: PresetResponse = {
    shortId,
    rawUrl,
    curlCommand: `curl -fsSL ${rawUrl} | bash`,
  };

  return NextResponse.json(response, { status: 201 });
}
