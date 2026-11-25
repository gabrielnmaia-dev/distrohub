import {
  QUIZ_DESKTOPS,
  QUIZ_DEVICES,
  QUIZ_EXPERIENCES,
  QUIZ_GOALS,
  QUIZ_GPUS,
  QUIZ_HARDWARE_PROFILES,
  QUIZ_PACKAGE_STYLES,
  QUIZ_SYSTEM_STYLES,
  QUIZ_UPDATE_STYLES,
  type DistroHubDistro,
  type Pack,
  type QuizAnswers,
  type QuizDesktop,
  type QuizDevice,
  type QuizExperience,
  type QuizGoal,
  type QuizGpu,
  type QuizHardware,
  type QuizPackageStyle,
  type QuizSystem,
  type QuizUpdates,
  type QuizWeights,
  type RankedDistro,
} from "@/types/distrohub";

/** Cada resposta vale no máximo 10 pontos. */
const MAX_POINTS_PER_ANSWER = 10;

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

export function isQuizDesktop(
  value: string | null | undefined
): value is QuizDesktop {
  return oneOf(QUIZ_DESKTOPS, value);
}

export function isQuizHardware(
  value: string | null | undefined
): value is QuizHardware {
  return oneOf(QUIZ_HARDWARE_PROFILES, value);
}

export function isQuizDevice(
  value: string | null | undefined
): value is QuizDevice {
  return oneOf(QUIZ_DEVICES, value);
}

export function isQuizSystem(
  value: string | null | undefined
): value is QuizSystem {
  return oneOf(QUIZ_SYSTEM_STYLES, value);
}

export function isQuizPackageStyle(
  value: string | null | undefined
): value is QuizPackageStyle {
  return oneOf(QUIZ_PACKAGE_STYLES, value);
}

/**
 * Converte respostas parciais (string) em `QuizAnswers` validadas.
 * Retorna `null` enquanto as quatro perguntas obrigatórias não foram respondidas.
 *
 * As perguntas extras são opcionais: respostas salvas antes delas continuam
 * sendo aceitas e apenas os critérios presentes entram na pontuação.
 */
export function toQuizAnswers(
  answers: Readonly<Record<string, string | undefined>>
): QuizAnswers | null {
  const {
    goal,
    gpu,
    updates,
    experience,
    desktop,
    hardware,
    device,
    system,
    packageStyle,
  } = answers;
  if (
    !isQuizGoal(goal) ||
    !isQuizGpu(gpu) ||
    !isQuizUpdates(updates) ||
    !isQuizExperience(experience)
  ) {
    return null;
  }

  const result: QuizAnswers = { goal, gpu, updates, experience };
  if (isQuizDesktop(desktop)) result.desktop = desktop;
  if (isQuizHardware(hardware)) result.hardware = hardware;
  if (isQuizDevice(device)) result.device = device;
  if (isQuizSystem(system)) result.system = system;
  if (isQuizPackageStyle(packageStyle)) result.packageStyle = packageStyle;
  return result;
}

type WeightMap = Readonly<Record<string, keyof QuizWeights>>;

const GOAL_WEIGHTS: Readonly<Record<QuizGoal, keyof QuizWeights>> = {
  dev: "goalDev",
  creator: "goalCreator",
  gaming: "goalGaming",
};

const GPU_WEIGHTS: Readonly<Record<QuizGpu, keyof QuizWeights>> = {
  nvidia: "gpuNvidia",
  "amd-intel": "gpuAmdIntel",
};

const UPDATES_WEIGHTS: Readonly<Record<QuizUpdates, keyof QuizWeights>> = {
  stable: "updatesStable",
  balanced: "updatesBalanced",
  rolling: "updatesRolling",
};

const EXPERIENCE_WEIGHTS: Readonly<Record<QuizExperience, keyof QuizWeights>> = {
  beginner: "expBeginner",
  advanced: "expAdvanced",
};

const DESKTOP_WEIGHTS: Readonly<Record<QuizDesktop, keyof QuizWeights>> = {
  gnome: "desktopGnome",
  kde: "desktopKde",
  tiling: "desktopTiling",
  classic: "desktopClassic",
};

const HARDWARE_WEIGHTS: Readonly<Record<QuizHardware, keyof QuizWeights>> = {
  light: "hardwareLight",
  balanced: "hardwareBalanced",
  powerful: "hardwarePowerful",
};

const DEVICE_WEIGHTS: Readonly<Record<QuizDevice, keyof QuizWeights>> = {
  desktop: "deviceDesktop",
  laptop: "deviceLaptop",
  handheld: "deviceHandheld",
};

const SYSTEM_WEIGHTS: Readonly<Record<QuizSystem, keyof QuizWeights>> = {
  immutable: "systemImmutable",
  snapshots: "systemSnapshots",
  traditional: "systemTraditional",
};

const PACKAGE_WEIGHTS: Readonly<Record<QuizPackageStyle, keyof QuizWeights>> = {
  aur: "packageAur",
  flatpak: "packageFlatpak",
  official: "packageOfficial",
};

/** Cada critério respondido contribui com no máximo 10 pontos. */
function answerRules(
  answers: QuizAnswers
): ReadonlyArray<readonly [string | undefined, WeightMap]> {
  return [
    [answers.goal, GOAL_WEIGHTS],
    [answers.gpu, GPU_WEIGHTS],
    [answers.updates, UPDATES_WEIGHTS],
    [answers.experience, EXPERIENCE_WEIGHTS],
    [answers.desktop, DESKTOP_WEIGHTS],
    [answers.hardware, HARDWARE_WEIGHTS],
    [answers.device, DEVICE_WEIGHTS],
    [answers.system, SYSTEM_WEIGHTS],
    [answers.packageStyle, PACKAGE_WEIGHTS],
  ];
}

/**
 * Ignora pesos ausentes (documentos antigos no Mongo ainda não re-seedados)
 * para não penalizar uma distro por uma pergunta que ela não pode pontuar.
 */
function evaluate(
  distro: DistroHubDistro,
  answers: QuizAnswers
): { score: number; max: number } {
  let score = 0;
  let max = 0;

  for (const [answer, weightMap] of answerRules(answers)) {
    if (!answer) continue;
    const key = weightMap[answer];
    if (!key) continue;
    const weight = distro.quizWeights[key];
    if (typeof weight !== "number" || !Number.isFinite(weight)) continue;

    score += Math.min(MAX_POINTS_PER_ANSWER, Math.max(0, weight));
    max += MAX_POINTS_PER_ANSWER;
  }

  return { score, max };
}

export function scoreDistro(
  distro: DistroHubDistro,
  answers: QuizAnswers
): number {
  return evaluate(distro, answers).score;
}

export function rankDistros(
  distros: readonly DistroHubDistro[],
  answers: QuizAnswers
): RankedDistro[] {
  return distros
    .map((distro) => {
      const { score, max } = evaluate(distro, answers);
      return {
        distro,
        score,
        percentage:
          max > 0 ? Math.round((score / max) * 100) : 0,
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
