import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/session";
import Distro from "@/models/Distro";

type Contexto = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Contexto) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
  }

  const body = await req.json();

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

  if (!distro) {
    return NextResponse.json({ erro: "Distro não encontrada." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/distros");
  revalidatePath(`/distros/${distro.slug}`);

  return NextResponse.json(distro);
}

export async function DELETE(_req: Request, { params }: Contexto) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
  }

  await connectDB();

  const distro = await Distro.findByIdAndDelete(id);
  if (!distro) {
    return NextResponse.json({ erro: "Distro não encontrada." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/distros");

  return NextResponse.json({ ok: true });
}