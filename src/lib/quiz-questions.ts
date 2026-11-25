import type { QuizQuestionId } from "@/types/distrohub";

export interface QuizOption {
  value: string;
  label: string;
  description: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  title: string;
  hint: string;
  options: QuizOption[];
}

/**
 * Perguntas do wizard, compartilhadas entre a UI e o motor de recomendação.
 * Os valores das opções são validados em `quiz-engine.ts` contra as constantes
 * de `types/distrohub.ts` e viram chaves de `quizWeights`.
 */
export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
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
  {
    id: "desktop",
    title: "Qual interface você prefere no dia a dia?",
    hint: "O ambiente gráfico muda atalhos, peso e até a forma de multitarefa.",
    options: [
      {
        value: "gnome",
        label: "GNOME",
        description: "Fluidez, gestos e experiência consistente em Wayland.",
      },
      {
        value: "kde",
        label: "KDE Plasma",
        description: "Muito configurável, com widgets e painéis do seu jeito.",
      },
      {
        value: "tiling",
        label: "Tiling / COSMIC / Hyprland",
        description: "Janelas organizadas por teclado e fluxo minimalista.",
      },
      {
        value: "classic",
        label: "Clássico e leve (Cinnamon/XFCE)",
        description: "Painéis tradicionais, baixo consumo e curva suave.",
      },
    ],
  },
  {
    id: "hardware",
    title: "Qual é o perfil do seu hardware?",
    hint: "Equilibra polish visual, peso do sistema e margem para desempenho.",
    options: [
      {
        value: "light",
        label: "Modesto / notebook antigo",
        description: "Até 8 GB de RAM, CPU de entrada ou vídeo integrado.",
      },
      {
        value: "balanced",
        label: "Intermediário",
        description: "16 GB de RAM e CPU/GPU decentes para uso misto.",
      },
      {
        value: "powerful",
        label: "Potente",
        description: "32 GB+, GPU dedicada e vontade de extrair cada FPS.",
      },
    ],
  },
  {
    id: "device",
    title: "Onde essa distro vai rodar?",
    hint: "Notebook e handheld cobram coisas bem diferentes de um desktop.",
    options: [
      {
        value: "desktop",
        label: "Desktop / torre",
        description: "Mesa fixa, com folga para ventilação e GPU.",
      },
      {
        value: "laptop",
        label: "Notebook",
        description: "Wi-Fi, suspensão, trackpad e bateria importam muito.",
      },
      {
        value: "handheld",
        label: "Handheld / mini PC",
        description: "Tela pequena, controles e suspensão instantânea.",
      },
    ],
  },
  {
    id: "system",
    title: "Como você quer que seu sistema evolua?",
    hint: "Define o quanto você abre mão de flexibilidade em troca de segurança.",
    options: [
      {
        value: "immutable",
        label: "Imutável com rollback",
        description: "Base somente leitura e atualizações atômicas.",
      },
      {
        value: "snapshots",
        label: "Tradicional com snapshots",
        description: "Btrfs/Timeshift para voltar antes de qualquer update.",
      },
      {
        value: "traditional",
        label: "Tradicional simples",
        description: "Atualizações convencionais e menos camadas para gerenciar.",
      },
    ],
  },
  {
    id: "packageStyle",
    title: "Como você prefere instalar aplicativos?",
    hint: "O ecossistema de pacotes costuma ser o maior fator de fricção depois da instalação.",
    options: [
      {
        value: "aur",
        label: "AUR e pacotes da comunidade",
        description: "Qualquer coisa compila a partir de um PKGBUILD.",
      },
      {
        value: "flatpak",
        label: "Flatpak primeiro",
        description: "Versões recentes e isoladas, iguais em qualquer distro.",
      },
      {
        value: "official",
        label: "Repositórios oficiais",
        description: "Pacotes verificados pela distro, sem surpresas.",
      },
    ],
  },
];
