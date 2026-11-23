"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  packForAnswers,
  rankDistros,
  toQuizAnswers,
} from "@/lib/quiz-engine";
import {
  FAMILY_LABELS,
  PACK_LABELS,
  type DistroHubDistro,
  type QuizAnswers,
} from "@/types/distrohub";

interface QuizOption {
  value: string;
  label: string;
  description: string;
}

interface QuizQuestion {
  id: keyof QuizAnswers;
  title: string;
  hint: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "goal",
    title: "Qual é o seu objetivo principal?",
    hint: "O que vai ocupar a maior parte do seu tempo na máquina.",
    options: [
      {
        value: "dev",
        label: "Desenvolvimento & IA",
        description: "IDEs, containers, agentes de IA e bancos de dados.",
      },
      {
        value: "creator",
        label: "Criação & Edição de Mídia",
        description: "Foto, vídeo, design, áudio e motion graphics.",
      },
      {
        value: "gaming",
        label: "Jogos & Performance",
        description: "Steam, Proton, HUDs e máximo FPS por watt.",
      },
    ],
  },
  {
    id: "gpu",
    title: "Qual placa de vídeo você usa?",
    hint: "Ajuda a escolher quem entrega drivers e codecs sem dor de cabeça.",
    options: [
      {
        value: "nvidia",
        label: "NVIDIA",
        description: "Drivers proprietários, CUDA e Wayland recente.",
      },
      {
        value: "amd-intel",
        label: "AMD ou Intel (integrada)",
        description: "Drivers no kernel, Mesa e VA-API — plug and play.",
      },
    ],
  },
  {
    id: "updates",
    title: "Qual estilo de atualização você prefere?",
    hint: "Isso define o quão perto do bleeding edge você quer viver.",
    options: [
      {
        value: "stable",
        label: "Estabilidade máxima",
        description: "Tudo testado, nada quebra, atualizações previsíveis.",
      },
      {
        value: "balanced",
        label: "Equilibrado",
        description: "Tecnologia recente com um ciclo de testes sério.",
      },
      {
        value: "rolling",
        label: "Rolling release",
        description: "Sempre na última versão, atualizando todo dia.",
      },
    ],
  },
  {
    id: "experience",
    title: "Qual seu nível com Linux?",
    hint: "Sem julgamento — só para calibrar a curva de aprendizado.",
    options: [
      {
        value: "beginner",
        label: "Iniciante vindo do Windows",
        description: "Quero instalar e usar, com tudo pronto.",
      },
      {
        value: "advanced",
        label: "Intermediário / Avançado",
        description: "Gosto de configurar, scriptar e entender o sistema.",
      },
    ],
  },
];

interface QuizWizardProps {
  distros: DistroHubDistro[];
}

export default function QuizWizard({ distros }: QuizWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const quizAnswers = useMemo(() => toQuizAnswers(answers), [answers]);

  const ranked = useMemo(
    () => (quizAnswers ? rankDistros(distros, quizAnswers) : []),
    [distros, quizAnswers]
  );

  const question = QUESTIONS[step];
  const progress = finished
    ? 100
    : Math.round(((step + 1) / QUESTIONS.length) * 100);

  function choose(questionId: keyof QuizAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    setFinished(true);
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setFinished(false);
  }

  if (finished && quizAnswers && ranked.length > 0) {
    const winner = ranked[0];
    const alternatives = ranked.slice(1, 3);
    const pack = packForAnswers(winner.distro, quizAnswers);
    const configuratorUrl = `/configurador?distro=${winner.distro.slug}&pack=${pack}`;

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-700/60 bg-emerald-500/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Combinação {winner.percentage}%
          </p>
          <h2 className="mt-2 text-3xl font-bold text-zinc-50">
            {winner.distro.name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-300">
            {winner.distro.tagline}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
              {FAMILY_LABELS[winner.distro.family]}
            </span>
            {winner.distro.recommendedPacks.map((item) => (
              <span
                key={item}
                className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300"
              >
                pack {PACK_LABELS[item]}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={winner.distro.isoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-500"
            >
              Baixar ISO oficial ↗
            </a>
            <button
              type="button"
              onClick={() => router.push(configuratorUrl)}
              className="rounded-md border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10"
            >
              Personalizar Pack & Gerar Script
            </button>
            <button
              type="button"
              onClick={restart}
              className="rounded-md border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Refazer quiz
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">
            Alternativas que também combinam
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {alternatives.map((item) => (
              <div
                key={item.distro.slug}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-zinc-100">
                    {item.distro.name}
                  </h4>
                  <span className="text-xs text-zinc-500">
                    {item.percentage}%
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                  {item.distro.tagline}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    {FAMILY_LABELS[item.distro.family]}
                  </span>
                  <Link
                    href={`/configurador?distro=${item.distro.slug}&pack=${packForAnswers(
                      item.distro,
                      quizAnswers
                    )}`}
                    className="text-emerald-400 hover:underline"
                  >
                    Montar script →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-500">
          Quer comparar tudo?{" "}
          <Link href="/distros" className="text-emerald-400 hover:underline">
            Ver todas as distros cadastradas
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Pergunta {step + 1} de {QUESTIONS.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-zinc-50">{question.title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{question.hint}</p>

      <div className="mt-5 grid gap-2">
        {question.options.map((option) => {
          const active = answers[question.id] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(question.id, option.value)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-600"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-medium text-zinc-100">{option.label}</span>
                {active && (
                  <span className="text-xs text-emerald-400">selecionado</span>
                )}
              </span>
              <span className="mt-1 block text-xs text-zinc-400">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          disabled={step === 0}
          className="text-xs text-zinc-400 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Voltar
        </button>
        {quizAnswers && !finished && (
          <button
            type="button"
            onClick={() => setFinished(true)}
            className="text-xs font-medium text-emerald-400 hover:underline"
          >
            Ver resultado agora →
          </button>
        )}
      </div>
    </div>
  );
}
