"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      senha,
      redirect: false,
      callbackUrl,
    });

    setCarregando(false);

    if (res?.error) {
      setErro("Email ou senha inválidos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <h1 className="text-2xl font-bold">Entrar</h1>

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
        placeholder="Senha"
        autoComplete="current-password"
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
        {carregando ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-emerald-400 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="h-72 w-full max-w-sm animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
