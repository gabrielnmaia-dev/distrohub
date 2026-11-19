import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/session";
import { gerarSlug } from "@/lib/slug";
import Distro from "@/models/Distro";

export async function GET(req: Request) {
  await connectDB();

  const foco = new URL(req.url).searchParams.get("foco");
  const filtro = foco ? { foco } : {};

  const distros = await Distro.find(filtro).sort({ nome: 1 }).lean();
  return NextResponse.json(distros);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  const body = await req.json();

  if (!body.nome || !body.descricao || !body.downloadUrl) {
    return NextResponse.json(
      { erro: "Nome, descrição e link de download são obrigatórios." },
      { status: 400 }
    );
  }

  await connectDB();

  const slug = gerarSlug(body.nome);
  const existe = await Distro.findOne({ slug });
  if (existe) {
    return NextResponse.json(
      { erro: "Já existe uma distro com esse nome." },
      { status: 409 }
    );
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