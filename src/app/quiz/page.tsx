import Link from "next/link";
import { Suspense } from "react";
import QuizWizard from "@/components/quiz/QuizWizard";
import { getQuizDistros } from "@/lib/distrohub-data";

export const metadata = {
  title: "Quiz de distros — DistroHub",
  description:
    "Responda 4 perguntas e descubra qual distro Linux combina com o seu objetivo, GPU e nível de experiência.",
};

export default function QuizPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Quiz
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-50 sm:text-4xl">
          Qual distro combina com você?
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Quatro perguntas rápidas. No final você recebe a distro vencedora, duas
          alternativas e pode montar um script de instalação sob medida.
        </p>
        <Link
          href="/configurador"
          className="mt-3 inline-block text-xs text-emerald-400 hover:underline"
        >
          Pular o quiz e ir direto ao configurador →
        </Link>
      </header>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
        }
      >
        <QuizLoader />
      </Suspense>
    </main>
  );
}

async function QuizLoader() {
  const distros = await getQuizDistros();
  return <QuizWizard distros={distros} />;
}
