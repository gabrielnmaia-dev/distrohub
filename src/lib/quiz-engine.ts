import {
  QUIZ_EXPERIENCES,
  QUIZ_GOALS,
  QUIZ_GPUS,
  QUIZ_UPDATE_STYLES,
  type DistroHubDistro,
  type Pack,
  type QuizAnswers,
  type QuizExperience,
  type QuizGoal,
  type QuizGpu,
  type QuizUpdates,
  type RankedDistro,
} from "@/types/distrohub";

/** Cada resposta vale no máximo 10 pontos. */
const MAX_POINTS_PER_ANSWER = 10;
const MAX_SCORE = MAX_POINTS_PER_ANSWER * 4;

function oneOf<T extends string>(
  values: readonly T[],
  value: string | null | undefined
): value is T {
  if (value === null || value === undefined) return false;
  return (values as readonly string[]).includes(value);
}

export function isQuizGoal(value: string | null | undefined): value is QuizGoal {
  return oneOf(QUIZ_GOALS, value);
}

export function isQuizGpu(value: string | null | undefined): value is QuizGpu {
  return oneOf(QUIZ_GPUS, value);
}

export function isQuizUpdates(
  value: string | null | undefined
): value is QuizUpdates {
  return oneOf(QUIZ_UPDATE_STYLES, value);
}

export function isQuizExperience(
  value: string | null | undefined
): value is QuizExperience {
  return oneOf(QUIZ_EXPERIENCES, value);
}

/**
 * Converte respostas parciais (string) em `QuizAnswers` validadas.
 * Retorna `null` enquanto o quiz não estiver completo.
 */
export function toQuizAnswers(
  answers: Readonly<Record<string, string | undefined>>
): QuizAnswers | null {
  const { goal, gpu, updates, experience } = answers;
  if (
    !isQuizGoal(goal) ||
    !isQuizGpu(gpu) ||
    !isQuizUpdates(updates) ||
    !isQuizExperience(experience)
  ) {
    return null;
  }
  return { goal, gpu, updates, experience };
}

export function scoreDistro(
  distro: DistroHubDistro,
  answers: QuizAnswers
): number {
  const weights = distro.quizWeights;

  const goalScore =
    answers.goal === "dev"
      ? weights.goalDev
      : answers.goal === "creator"
        ? weights.goalCreator
        : weights.goalGaming;

  const gpuScore =
    answers.gpu === "nvidia" ? weights.gpuNvidia : weights.gpuAmdIntel;

  const updatesScore =
    answers.updates === "stable"
      ? weights.updatesStable
      : answers.updates === "balanced"
        ? weights.updatesBalanced
        : weights.updatesRolling;

  const experienceScore =
    answers.experience === "beginner"
      ? weights.expBeginner
      : weights.expAdvanced;

  return goalScore + gpuScore + updatesScore + experienceScore;
}

export function rankDistros(
  distros: readonly DistroHubDistro[],
  answers: QuizAnswers
): RankedDistro[] {
  return distros
    .map((distro) => {
      const score = scoreDistro(distro, answers);
      return {
        distro,
        score,
        percentage: Math.round((score / MAX_SCORE) * 100),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.distro.name.localeCompare(b.distro.name, "pt-BR");
    });
}

/**
 * Pack que deve vir pré-selecionado no configurador ao sair do quiz.
 * Prioriza o objetivo do usuário e cai para o primeiro pack recomendado.
 */
export function packForAnswers(
  distro: DistroHubDistro,
  answers: QuizAnswers
): Pack {
  const preferred: Pack = answers.goal;
  if (distro.recommendedPacks.includes(preferred)) return preferred;
  return distro.recommendedPacks[0] ?? preferred;
}
