import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
    const { nome, email, senha } = await req.json();

    if (!nome || !email || !senha || senha.length < 6) {
        return NextResponse.json(
            { erro: "Preencha nome, email e uma senha de pelo menos 6 caracteres"},
            { status: 400 }

        );
    }

    await connectDB();

    const existe = await User.findOne({email: email.toLowerCase()});
    if (existe) {
        return NextResponse.json({ erro: "Email já cadastrado" }, { status: 409 }); 
    }


    const hash = await bcrypt.hash(senha, 10);
    await User.create({ nome, email, senha: hash });

    return NextResponse.json({ ok: true }, { status: 201 });
}