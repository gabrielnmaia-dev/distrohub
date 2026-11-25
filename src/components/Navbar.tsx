"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-zinc-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-emerald-400"
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          DistroHub
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/distros" className="hover:text-emerald-400">
            Distros
          </Link>
          <Link href="/quiz" className="hover:text-emerald-400">
            Quiz
          </Link>
          <Link href="/configurador" className="hover:text-emerald-400">
            Configurador
          </Link>

          {session?.user.role === "admin" && (
            <Link href="/admin" className="hover:text-emerald-400">
              Admin
            </Link>
          )}

          {status === "loading" ? null : session ? (
            <>
              <span className="text-zinc-400">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-zinc-700 px-3 py-1.5 hover:border-emerald-500"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-emerald-400">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium hover:bg-emerald-500"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
