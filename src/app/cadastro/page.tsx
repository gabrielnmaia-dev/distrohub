"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const normalizedEmail = email.trim().toLowerCase();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim(), email: normalizedEmail, senha }),
    });

    if (!res.ok) {
      setCarregando(false);
      const data = await res.json().catch(() => ({}));
      setErro(data.erro ?? "Erro ao cadastrar.");
      return;
    }

    // Autentica automaticamente após criar a conta (seta o cookie HttpOnly)
    const loginRes = await signIn("credentials", {
      email: normalizedEmail,
      senha,
      redirect: false,
    });

    setCarregando(false);

    if (loginRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h1 className="text-2xl font-bold">Criar conta</h1>

        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 outline-none focus:border-emerald-500"
          placeholder="Nome"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 outline-none focus:border-emerald-500"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 p-2 outline-none focus:border-emerald-500"
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          autoComplete="new-password"
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-md bg-emerald-600 p-2 font-medium text-zinc-950 hover:bg-emerald-500 disabled:opacity-50"
        >
          {carregando ? "Criando..." : "Cadastrar"}
        </button>

        <p className="text-center text-sm text-zinc-400">
          Já tem conta?{" "}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
