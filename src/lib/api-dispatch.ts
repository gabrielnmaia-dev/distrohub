import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { isValidObjectId } from "mongoose";
import bcrypt from "bcryptjs";
import { authOptions, isAuthConfigured } from "@/lib/auth";
import { CATALOG_DISTROS, CATALOG_PACKAGES } from "@/lib/distrohub-catalog";
import { memoryPresets } from "@/lib/distrohub-data";
import { connectDB } from "@/lib/mongodb";
import { generateShortId, SHORT_ID_PATTERN } from "@/lib/short-id";
import {
  compileScript,
  SCRIPT_FILENAME,
  type CompilerPackage,
} from "@/lib/script-compiler";
import { getAdminSession } from "@/lib/session";
import { gerarSlug } from "@/lib/slug";
import Distro from "@/models/Distro";
import HubDistro from "@/models/HubDistro";
import ScriptPreset from "@/models/ScriptPreset";
import SoftwarePackageModel from "@/models/SoftwarePackage";
import User from "@/models/User";
import type {
  DistroFamily,
  DistroHubDistro,
  PackageTargets,
  Pack,
  PresetRequest,
  PresetResponse,
  SoftwarePackage,
} from "@/types/distrohub";

/**
 * Despacho único de `/api/*`.
 *
 * O free tier da Vercel limita a quantidade de Functions por deployment. Em vez
 * de gerar uma Function por rota, todas as rotas são servidas por um único
 * catch-all (`src/app/api/[[...segments]]/route.ts`) — as URLs públicas
 * continuam exatamente as mesmas.
 */

const nextAuthHandler = NextAuth(authOptions);

const MAX_PACKAGES_PER_PRESET = 200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function erro(mensagem: string, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

function resolveOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  return (error as Record<string, unknown>).code === 11000;
}

function parsePresetRequest(value: unknown): PresetRequest | null {
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

async function health(): Promise<Response> {
  // Expor apenas flags (nunca o valor do secret) ajuda a diagnosticar o
  // `CLIENT_FETCH_ERROR` do NextAuth em produção sem acessar os logs da Vercel.
  const auth = {
    secretConfigured: isAuthConfigured,
    urlConfigured: Boolean(process.env.NEXTAUTH_URL?.trim()),
  };

  try {
    await connectDB();
    return NextResponse.json({
      status: "ok",
      db: "conectado",
      auth,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", db: "falhou", auth },
      { status: 500 }
    );
  }
}

async function distrosCollection(request: NextRequest): Promise<Response> {
  if (request.method === "GET") {
    await connectDB();
    const foco = request.nextUrl.searchParams.get("foco");
    const filtro = foco ? { foco } : {};
    const distros = await Distro.find(filtro).sort({ nome: 1 }).lean();
    return NextResponse.json(distros);
  }

  if (request.method === "POST") {
    const session = await getAdminSession();
    if (!session) return erro("Não autorizado.", 403);

    const body = await request.json();
    if (!body.nome || !body.descricao || !body.downloadUrl) {
      return erro("Nome, descrição e link de download são obrigatórios.");
    }

    await connectDB();

    const slug = gerarSlug(body.nome);
    if (await Distro.findOne({ slug })) {
      return erro("Já existe uma distro com esse nome.", 409);
    }

    const distro = await Distro.create({
      nome: body.nome,
      slug,
      foco: body.foco ?? [],
      descricao: body.descricao,
      versao: body.versao ?? "",
      downloadUrl: body.downloadUrl,
      siteUrl: body.siteUrl ?? "",
      iconeUrl: body.iconeUrl ?? "",
    });

    revalidatePath("/");
    revalidatePath("/distros");

    return NextResponse.json(distro, { status: 201 });
  }

  return erro("Método não permitido.", 405);
}

async function distroById(
  request: NextRequest,
  id: string
): Promise<Response> {
  const session = await getAdminSession();
  if (!session) return erro("Não autorizado.", 403);

  if (!isValidObjectId(id)) return erro("ID inválido.");

  if (request.method === "PUT") {
    const body = await request.json();
    await connectDB();

    const distro = await Distro.findByIdAndUpdate(
      id,
      {
        nome: body.nome,
        foco: body.foco,
        descricao: body.descricao,
        versao: body.versao,
        downloadUrl: body.downloadUrl,
        siteUrl: body.siteUrl,
        iconeUrl: body.iconeUrl,
      },
      { new: true, runValidators: true }
    );

    if (!distro) return erro("Distro não encontrada.", 404);

    revalidatePath("/");
    revalidatePath("/distros");
    revalidatePath(`/distros/${distro.slug}`);

    return NextResponse.json(distro);
  }

  if (request.method === "DELETE") {
    await connectDB();

    const distro = await Distro.findByIdAndDelete(id);
    if (!distro) return erro("Distro não encontrada.", 404);

    revalidatePath("/");
    revalidatePath("/distros");

    return NextResponse.json({ ok: true });
  }

  return erro("Método não permitido.", 405);
}

async function presets(request: NextRequest): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return erro("JSON inválido.");
  }

  const body = parsePresetRequest(payload);
  if (!body) return erro("Informe distroSlug e selectedPackageSlugs.");

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

  if (!distroExists) return erro("Distro não encontrada.", 404);

  const selectedPackageSlugs = body.selectedPackageSlugs.filter((slug) =>
    validSlugs.has(slug)
  );
  if (selectedPackageSlugs.length === 0) {
    return erro("Selecione pelo menos um pacote válido.");
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
    return erro("Não foi possível gerar um ID único. Tente novamente.", 500);
  }

  const rawUrl = `${resolveOrigin(request)}/api/script/${shortId}`;
  const response: PresetResponse = {
    shortId,
    rawUrl,
    curlCommand: `curl -fsSL ${rawUrl} | bash`,
  };

  return NextResponse.json(response, { status: 201 });
}

async function script(shortId: string): Promise<Response> {
  if (!SHORT_ID_PATTERN.test(shortId)) return erro("Preset inválido.", 404);

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

  if (!presetData) return erro("Preset não encontrado.", 404);

  let distro: DistroHubDistro | null = dbConnected
    ? await HubDistro.findOne({ slug: presetData.distroSlug }).lean()
    : null;
  if (!distro) {
    distro =
      CATALOG_DISTROS.find((d) => d.slug === presetData.distroSlug) ?? null;
  }
  if (!distro) {
    return erro("A distro deste preset não existe mais.", 410);
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

  const scriptText = compileScript({
    distro: {
      slug: distro.slug,
      name: distro.name,
      family: distro.family as DistroFamily,
      isoUrl: distro.isoUrl,
    },
    packages,
  });

  return new Response(scriptText, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Content-Disposition": `attachment; filename="${SCRIPT_FILENAME}"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function register(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const senha = typeof body.senha === "string" ? body.senha : "";

    if (!nome || !email || !senha || senha.length < 6) {
      return erro(
        "Preencha nome, email e uma senha de pelo menos 6 caracteres."
      );
    }
    if (!EMAIL_REGEX.test(email)) return erro("Informe um endereço de email válido.");

    await connectDB();

    if (await User.findOne({ email }).select("_id").lean()) {
      return erro("Email já cadastrado.", 409);
    }

    const totalUsers = await User.countDocuments();
    const role = totalUsers === 0 ? "admin" : "user";

    const hash = await bcrypt.hash(senha, 10);
    await User.create({ nome, email, senha: hash, role });

    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch {
    return erro(
      "Não foi possível realizar o cadastro. Verifique a conexão com o banco.",
      500
    );
  }
}

export async function dispatchApi(
  request: NextRequest,
  segments: string[]
): Promise<Response> {
  const [resource, second, ...rest] = segments;

  switch (resource) {
    case "health":
      return request.method === "GET" ? health() : erro("Método não permitido.", 405);

    case "distros":
      if (!second) return distrosCollection(request);
      return distroById(request, second);

    case "presets":
      return request.method === "POST" ? presets(request) : erro("Método não permitido.", 405);

    case "script":
      return request.method === "GET" && second
        ? script(second)
        : erro("Preset inválido.", 404);

    case "register":
      return request.method === "POST" ? register(request) : erro("Método não permitido.", 405);

    case "auth":
      // `nextauth` é o parâmetro da rota dinâmica original; os handlers do NextAuth
      // precisam dele para descobrir a ação (session, csrf, callback/...).
      return nextAuthHandler(request, {
        params: Promise.resolve({ nextauth: [second ?? "", ...rest] }),
      });

    default:
      return erro("Rota não encontrada.", 404);
  }
}
