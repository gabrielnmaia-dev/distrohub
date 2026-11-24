import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const senha = typeof body.senha === "string" ? body.senha : "";

    if (!nome || !email || !senha || senha.length < 6) {
      return NextResponse.json(
        {
          erro: "Preencha nome, email e uma senha de pelo menos 6 caracteres.",
        },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { erro: "Informe um endereço de email válido." },
        { status: 400 }
      );
    }

    await connectDB();

    const existe = await User.findOne({ email }).select("_id").lean();
    if (existe) {
      return NextResponse.json(
        { erro: "Email já cadastrado." },
        { status: 409 }
      );
    }

    // Se for o primeiro usuário cadastrado no banco, torna-o admin automaticamente
    const totalUsers = await User.countDocuments();
    const role = totalUsers === 0 ? "admin" : "user";

    const hash = await bcrypt.hash(senha, 10);
    await User.create({ nome, email, senha: hash, role });

    return NextResponse.json({ ok: true, role }, { status: 201 });
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível realizar o cadastro. Verifique a conexão com o banco." },
      { status: 500 }
    );
  }
}
