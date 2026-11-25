/**
 * Tipos do motor de recomendação (quiz), catálogo de packs e presets.
 *
 * Estes tipos são compartilhados entre servidor (Mongoose/rotas de API) e
 * cliente (configurador + preview do script), por isso não podem importar
 * nada de `node:*` nem do Mongoose.
 */

export const DISTRO_FAMILIES = [
  "debian",
  "fedora",
  "fedora-atomic",
  "arch",
] as const;

export type DistroFamily = (typeof DISTRO_FAMILIES)[number];

export const FAMILY_LABELS: Record<DistroFamily, string> = {
  debian: "Debian/Ubuntu",
  fedora: "Fedora",
  "fedora-atomic": "Fedora Atomic (imutável)",
  arch: "Arch Linux",
};

export const PACKS = ["dev", "creator", "gaming"] as const;

export type Pack = (typeof PACKS)[number];

export const PACK_LABELS: Record<Pack, string> = {
  dev: "Desenvolvedores",
  creator: "Editores de Conteúdo",
  gaming: "Jogos",
};

export const PACK_TAGLINES: Record<Pack, string> = {
  dev: "IDEs, agentes de IA, containers, bancos de dados e runtimes.",
  creator: "Foto, vídeo, design, 3D, áudio e codecs multimídia.",
  gaming: "Lojas, Proton/Wine, HUDs de performance, RGB e controles.",
};

export const INSTALL_METHODS = [
  "native",
  "aur",
  "flatpak",
  "script",
] as const;

export type InstallMethod = (typeof INSTALL_METHODS)[number];

export const METHOD_LABELS: Record<InstallMethod, string> = {
  native: "Repositório oficial",
  aur: "AUR",
  flatpak: "Flatpak",
  script: "Script oficial",
};

/** Pesos usados pelo motor do quiz (0-10 por critério). */
export interface QuizWeights {
  goalDev: number;
  goalCreator: number;
  goalGaming: number;
  gpuNvidia: number;
  gpuAmdIntel: number;
  updatesStable: number;
  updatesBalanced: number;
  updatesRolling: number;
  expBeginner: number;
  expAdvanced: number;
  desktopGnome: number;
  desktopKde: number;
  desktopTiling: number;
  desktopClassic: number;
  hardwareLight: number;
  hardwareBalanced: number;
  hardwarePowerful: number;
  deviceDesktop: number;
  deviceLaptop: number;
  deviceHandheld: number;
  systemImmutable: number;
  systemSnapshots: number;
  systemTraditional: number;
  packageAur: number;
  packageFlatpak: number;
  packageOfficial: number;
}

export const QUIZ_WEIGHT_KEYS = [
  "goalDev",
  "goalCreator",
  "goalGaming",
  "gpuNvidia",
  "gpuAmdIntel",
  "updatesStable",
  "updatesBalanced",
  "updatesRolling",
  "expBeginner",
  "expAdvanced",
  "desktopGnome",
  "desktopKde",
  "desktopTiling",
  "desktopClassic",
  "hardwareLight",
  "hardwareBalanced",
  "hardwarePowerful",
  "deviceDesktop",
  "deviceLaptop",
  "deviceHandheld",
  "systemImmutable",
  "systemSnapshots",
  "systemTraditional",
  "packageAur",
  "packageFlatpak",
  "packageOfficial",
] as const satisfies readonly (keyof QuizWeights)[];

export const QUIZ_GOALS = ["dev", "creator", "gaming"] as const;
export type QuizGoal = (typeof QUIZ_GOALS)[number];

export const QUIZ_GPUS = ["nvidia", "amd-intel"] as const;
export type QuizGpu = (typeof QUIZ_GPUS)[number];

export const QUIZ_UPDATE_STYLES = ["stable", "balanced", "rolling"] as const;
export type QuizUpdates = (typeof QUIZ_UPDATE_STYLES)[number];

export const QUIZ_EXPERIENCES = ["beginner", "advanced"] as const;
export type QuizExperience = (typeof QUIZ_EXPERIENCES)[number];

export const QUIZ_DESKTOPS = ["gnome", "kde", "tiling", "classic"] as const;
export type QuizDesktop = (typeof QUIZ_DESKTOPS)[number];

export const QUIZ_HARDWARE_PROFILES = [
  "light",
  "balanced",
  "powerful",
] as const;
export type QuizHardware = (typeof QUIZ_HARDWARE_PROFILES)[number];

export const QUIZ_DEVICES = ["desktop", "laptop", "handheld"] as const;
export type QuizDevice = (typeof QUIZ_DEVICES)[number];

export const QUIZ_SYSTEM_STYLES = [
  "immutable",
  "snapshots",
  "traditional",
] as const;
export type QuizSystem = (typeof QUIZ_SYSTEM_STYLES)[number];

export const QUIZ_PACKAGE_STYLES = ["aur", "flatpak", "official"] as const;
export type QuizPackageStyle = (typeof QUIZ_PACKAGE_STYLES)[number];

/**
 * As quatro primeiras respostas são obrigatórias. As novas perguntas são
 * opcionais no tipo para que respostas salvas antes delas continuem válidas;
 * o motor pontua apenas os critérios realmente respondidos.
 */
export interface QuizAnswers {
  goal: QuizGoal;
  gpu: QuizGpu;
  updates: QuizUpdates;
  experience: QuizExperience;
  desktop?: QuizDesktop;
  hardware?: QuizHardware;
  device?: QuizDevice;
  system?: QuizSystem;
  packageStyle?: QuizPackageStyle;
}

export type QuizQuestionId = keyof QuizAnswers;

export interface TargetSpec {
  method: InstallMethod;
  /** Nome do pacote (apt/dnf/pacman/AUR), ID do Flathub ou comando. */
  pkg: string;
  /** Comando opcional executado depois da instalação em lote. */
  postHook?: string;
}

export type PackageTargets = Record<DistroFamily, TargetSpec>;

export interface DistroHubDistro {
  _id?: string;
  slug: string;
  name: string;
  family: DistroFamily;
  recommendedPacks: Pack[];
  tagline: string;
  isoUrl: string;
  iconUrl?: string;
  quizWeights: QuizWeights;
  createdAt?: string;
  updatedAt?: string;
}

export interface SoftwarePackage {
  _id?: string;
  slug: string;
  name: string;
  pack: Pack;
  subcategory: string;
  description: string;
  defaultSelected: boolean;
  targets: PackageTargets;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScriptPreset {
  _id?: string;
  shortId: string;
  distroSlug: string;
  selectedPackageSlugs: string[];
  downloadsCount: number;
  createdAt: string;
}

export interface PresetRequest {
  distroSlug: string;
  selectedPackageSlugs: string[];
}

export interface PresetResponse {
  shortId: string;
  rawUrl: string;
  curlCommand: string;
}

export interface ApiError {
  erro: string;
}

/** Um distro ranqueada pelo quiz. */
export interface RankedDistro {
  distro: DistroHubDistro;
  score: number;
  /** Score normalizado em 0-100. */
  percentage: number;
}
