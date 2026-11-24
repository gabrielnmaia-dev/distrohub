import type {
  DistroHubDistro,
  InstallMethod,
  PackageTargets,
  SoftwarePackage,
  TargetSpec,
} from "@/types/distrohub";

/**
 * Catálogo canônico do DistroHub.
 *
 * É a fonte da verdade usada pelo seed (`scripts/seed-distrohub.ts`) e como
 * fallback de leitura caso o banco ainda não tenha sido populado.
 */

function spec(method: InstallMethod, pkg: string, postHook?: string): TargetSpec {
  return postHook ? { method, pkg, postHook } : { method, pkg };
}

const native = (pkg: string, postHook?: string) => spec("native", pkg, postHook);
const aur = (pkg: string, postHook?: string) => spec("aur", pkg, postHook);
const flatpak = (pkg: string, postHook?: string) => spec("flatpak", pkg, postHook);
const script = (pkg: string, postHook?: string) => spec("script", pkg, postHook);

/** Comando de "instalação" para apps sem pacote estável: abre a página oficial. */
const downloadPage = (url: string) =>
  `xdg-open "${url}" 2>/dev/null || echo "Baixe manualmente em ${url}"`;

function targets(
  debian: TargetSpec,
  fedora: TargetSpec,
  fedoraAtomic: TargetSpec,
  arch: TargetSpec
): PackageTargets {
  return { debian, fedora, "fedora-atomic": fedoraAtomic, arch };
}

function everywhere(target: TargetSpec): PackageTargets {
  return {
    debian: target,
    fedora: target,
    "fedora-atomic": target,
    arch: target,
  };
}

// ---------------------------------------------------------------------------
// Distros
// ---------------------------------------------------------------------------

export const DISTRO_3D_ICONS: Record<string, string> = {
  "fedora-workstation": "/distro-icons/3d/fedora-3d.png",
  "fedora-design": "/distro-icons/3d/fedora-3d.png",
  "ubuntu-lts": "/distro-icons/3d/ubuntu-3d.png",
  "ubuntu-studio": "/distro-icons/3d/ubuntu-3d.png",
  "pop-os": "/distro-icons/3d/popos-3d.png",
  "arch-linux": "/distro-icons/3d/icons8-arch-linux-24-3d.png",
  endeavouros: "/distro-icons/3d/endeavouros-3d.png",
  nobara: "/distro-icons/3d/nobaralinux-dark-3d.png",
  bazzite: "/distro-icons/3d/bazzite-3d.png",
  garuda: "/distro-icons/3d/garuda-linux-3d.png",
  cachyos: "/distro-icons/3d/cachyos-linux-3d.png",
  "linux-mint": "/distro-icons/3d/linux-mint-3d.png",
};

export function getDistroIconUrl(slug: string, customIconUrl?: string): string {
  if (customIconUrl && customIconUrl.trim().length > 0) {
    return customIconUrl.trim();
  }
  return DISTRO_3D_ICONS[slug] ?? "";
}

export const CATALOG_DISTROS: DistroHubDistro[] = [
  {
    slug: "fedora-workstation",
    name: "Fedora Workstation",
    family: "fedora",
    recommendedPacks: ["dev"],
    tagline:
      "Tecnologia de ponta com ciclo previsível: GNOME puro, Wayland maduro e toolchain sempre recente.",
    isoUrl: "https://fedoraproject.org/workstation/download",
    iconUrl: "/distro-icons/3d/fedora-3d.png",
    quizWeights: {
      goalDev: 9,
      goalCreator: 7,
      goalGaming: 5,
      gpuNvidia: 7,
      gpuAmdIntel: 8,
      updatesStable: 6,
      updatesBalanced: 9,
      updatesRolling: 3,
      expBeginner: 7,
      expAdvanced: 8,
    },
  },
  {
    slug: "ubuntu-lts",
    name: "Ubuntu LTS",
    family: "debian",
    recommendedPacks: ["dev"],
    tagline:
      "O caminho mais previsível: 5 anos de suporte, compatibilidade ampla e documentação em todo lugar.",
    isoUrl: "https://ubuntu.com/download/desktop",
    iconUrl: "/distro-icons/3d/ubuntu-3d.png",
    quizWeights: {
      goalDev: 8,
      goalCreator: 6,
      goalGaming: 6,
      gpuNvidia: 8,
      gpuAmdIntel: 9,
      updatesStable: 10,
      updatesBalanced: 6,
      updatesRolling: 1,
      expBeginner: 9,
      expAdvanced: 5,
    },
  },
  {
    slug: "pop-os",
    name: "Pop!_OS",
    family: "debian",
    recommendedPacks: ["dev", "creator", "gaming"],
    tagline:
      "Ubuntu com polish de desktop: COSMIC, tiling por padrão e ISO com driver NVIDIA pronta.",
    isoUrl: "https://pop.system76.com/",
    iconUrl: "/distro-icons/3d/popos-3d.png",
    quizWeights: {
      goalDev: 8,
      goalCreator: 7,
      goalGaming: 8,
      gpuNvidia: 9,
      gpuAmdIntel: 8,
      updatesStable: 8,
      updatesBalanced: 8,
      updatesRolling: 2,
      expBeginner: 9,
      expAdvanced: 6,
    },
  },
  {
    slug: "arch-linux",
    name: "Arch Linux",
    family: "arch",
    recommendedPacks: ["dev"],
    tagline:
      "Você monta o sistema do zero e recebe em troca controle total e o AUR inteiro ao alcance.",
    isoUrl: "https://archlinux.org/download/",
    iconUrl: "/distro-icons/3d/icons8-arch-linux-24-3d.png",
    quizWeights: {
      goalDev: 9,
      goalCreator: 7,
      goalGaming: 7,
      gpuNvidia: 8,
      gpuAmdIntel: 8,
      updatesStable: 1,
      updatesBalanced: 3,
      updatesRolling: 10,
      expBeginner: 1,
      expAdvanced: 10,
    },
  },
  {
    slug: "endeavouros",
    name: "EndeavourOS",
    family: "arch",
    recommendedPacks: ["dev"],
    tagline:
      "Arch sem o ritual de instalação: base rolling release, instalador amigável e comunidade acolhedora.",
    isoUrl: "https://endeavouros.com/",
    iconUrl: "/distro-icons/3d/endeavouros-3d.png",
    quizWeights: {
      goalDev: 8,
      goalCreator: 6,
      goalGaming: 7,
      gpuNvidia: 8,
      gpuAmdIntel: 8,
      updatesStable: 2,
      updatesBalanced: 5,
      updatesRolling: 9,
      expBeginner: 4,
      expAdvanced: 9,
    },
  },
  {
    slug: "ubuntu-studio",
    name: "Ubuntu Studio",
    family: "debian",
    recommendedPacks: ["creator"],
    tagline:
      "Ubuntu pré-configurado para áudio, vídeo e imagem: kernel de baixa latência e suíte criativa completa.",
    isoUrl: "https://ubuntustudio.org/download/",
    iconUrl: "/distro-icons/3d/ubuntu-3d.png",
    quizWeights: {
      goalDev: 5,
      goalCreator: 10,
      goalGaming: 4,
      gpuNvidia: 7,
      gpuAmdIntel: 8,
      updatesStable: 9,
      updatesBalanced: 6,
      updatesRolling: 1,
      expBeginner: 8,
      expAdvanced: 6,
    },
  },
  {
    slug: "nobara",
    name: "Nobara Linux",
    family: "fedora",
    recommendedPacks: ["creator", "gaming"],
    tagline:
      "Fedora lapidado para jogos e criação: codecs, drivers e patches de performance já embarcados.",
    isoUrl: "https://nobaraproject.org/download-nobara/",
    iconUrl: "/distro-icons/3d/nobaralinux-dark-3d.png",
    quizWeights: {
      goalDev: 6,
      goalCreator: 8,
      goalGaming: 10,
      gpuNvidia: 9,
      gpuAmdIntel: 8,
      updatesStable: 6,
      updatesBalanced: 8,
      updatesRolling: 4,
      expBeginner: 8,
      expAdvanced: 7,
    },
  },
  {
    slug: "fedora-design",
    name: "Fedora Design Suite",
    family: "fedora",
    recommendedPacks: ["creator"],
    tagline:
      "Spin oficial do Fedora com o arsenal criativo do Fedora Design Team pronto para produzir.",
    isoUrl: "https://fedoraproject.org/spins/design-suite/download",
    iconUrl: "/distro-icons/3d/fedora-3d.png",
    quizWeights: {
      goalDev: 5,
      goalCreator: 10,
      goalGaming: 4,
      gpuNvidia: 6,
      gpuAmdIntel: 8,
      updatesStable: 7,
      updatesBalanced: 9,
      updatesRolling: 3,
      expBeginner: 6,
      expAdvanced: 8,
    },
  },
  {
    slug: "bazzite",
    name: "Bazzite",
    family: "fedora-atomic",
    recommendedPacks: ["gaming"],
    tagline:
      "Imagem atômica imutável feita para jogar: Steam, HDR, handhelds e rollback com um comando.",
    isoUrl: "https://bazzite.gg/",
    iconUrl: "/distro-icons/3d/bazzite-3d.png",
    quizWeights: {
      goalDev: 5,
      goalCreator: 5,
      goalGaming: 10,
      gpuNvidia: 9,
      gpuAmdIntel: 9,
      updatesStable: 9,
      updatesBalanced: 7,
      updatesRolling: 2,
      expBeginner: 9,
      expAdvanced: 6,
    },
  },
  {
    slug: "garuda",
    name: "Garuda Linux",
    family: "arch",
    recommendedPacks: ["gaming"],
    tagline:
      "Arch com visual agressivo, snapshots Btrfs automáticos e tweaks de performance para jogos.",
    isoUrl: "https://garudalinux.org/downloads",
    iconUrl: "/distro-icons/3d/garuda-linux-3d.png",
    quizWeights: {
      goalDev: 6,
      goalCreator: 6,
      goalGaming: 9,
      gpuNvidia: 8,
      gpuAmdIntel: 8,
      updatesStable: 2,
      updatesBalanced: 4,
      updatesRolling: 10,
      expBeginner: 4,
      expAdvanced: 9,
    },
  },
  {
    slug: "cachyos",
    name: "CachyOS",
    family: "arch",
    recommendedPacks: ["gaming"],
    tagline:
      "Arch otimizado com kernel próprio, pacotes compilados para x86-64-v3 e foco absoluto em latência.",
    isoUrl: "https://cachyos.org/download/",
    iconUrl: "/distro-icons/3d/cachyos-linux-3d.png",
    quizWeights: {
      goalDev: 7,
      goalCreator: 5,
      goalGaming: 10,
      gpuNvidia: 8,
      gpuAmdIntel: 9,
      updatesStable: 3,
      updatesBalanced: 6,
      updatesRolling: 10,
      expBeginner: 5,
      expAdvanced: 10,
    },
  },
  {
    slug: "linux-mint",
    name: "Linux Mint",
    family: "debian",
    recommendedPacks: ["gaming"],
    tagline:
      "A porta de entrada mais confortável: Cinnamon familiar, base Ubuntu LTS e zero surpresas.",
    isoUrl: "https://linuxmint.com/download.php",
    iconUrl: "/distro-icons/3d/linux-mint-3d.png",
    quizWeights: {
      goalDev: 6,
      goalCreator: 5,
      goalGaming: 6,
      gpuNvidia: 7,
      gpuAmdIntel: 9,
      updatesStable: 10,
      updatesBalanced: 5,
      updatesRolling: 1,
      expBeginner: 10,
      expAdvanced: 3,
    },
  },
];

// ---------------------------------------------------------------------------
// Pack: Desenvolvedores
// ---------------------------------------------------------------------------

const DEV_PACKAGES: SoftwarePackage[] = [
  {
    slug: "vscode",
    name: "Visual Studio Code",
    pack: "dev",
    subcategory: "IDEs & Editores",
    description:
      "Editor da Microsoft com ecossistema gigante de extensões, Dev Containers e Remote SSH.",
    defaultSelected: true,
    targets: targets(
      flatpak("com.visualstudio.code"),
      flatpak("com.visualstudio.code"),
      flatpak("com.visualstudio.code"),
      native("code")
    ),
  },
  {
    slug: "antigravity",
    name: "Google Antigravity",
    pack: "dev",
    subcategory: "IDEs & Editores",
    description:
      "IDE agêntica do Google: orquestra agentes de IA com navegador e terminal integrados (download manual).",
    defaultSelected: false,
    targets: everywhere(script(downloadPage("https://antigravity.google/download"))),
  },
  {
    slug: "cursor",
    name: "Cursor",
    pack: "dev",
    subcategory: "IDEs & Editores",
    description:
      "Fork do VS Code com edição multi-arquivo por IA, tab completion preditivo e agentes.",
    defaultSelected: true,
    targets: everywhere(
      script(
        "curl -fsSL https://cursor.com/install -o /tmp/cursor-install.sh && bash /tmp/cursor-install.sh"
      )
    ),
  },
  {
    slug: "zed",
    name: "Zed",
    pack: "dev",
    subcategory: "IDEs & Editores",
    description:
      "Editor nativo em Rust, colaborativo por padrão e com GPU rendering — leve e rápido.",
    defaultSelected: true,
    targets: targets(
      script("curl -fsSL https://zed.dev/install.sh | sh"),
      script("curl -fsSL https://zed.dev/install.sh | sh"),
      script("curl -fsSL https://zed.dev/install.sh | sh"),
      native("zed")
    ),
  },
  {
    slug: "neovim",
    name: "Neovim",
    pack: "dev",
    subcategory: "IDEs & Editores",
    description:
      "Sucessor moderno do Vim com LSP nativo, Lua e ecossistema de plugins (LazyVim, AstroNvim).",
    defaultSelected: false,
    targets: targets(
      native("neovim"),
      native("neovim"),
      flatpak("io.neovim.nvim"),
      native("neovim")
    ),
  },
  {
    slug: "claude-code",
    name: "Claude Code (CLI)",
    pack: "dev",
    subcategory: "IA & Agentes CLI",
    description:
      "Agente de código da Anthropic no terminal: lê o repositório, edita arquivos e roda comandos.",
    defaultSelected: true,
    targets: everywhere(script("curl -fsSL https://claude.ai/install.sh | bash")),
  },
  {
    slug: "github-copilot-cli",
    name: "GitHub Copilot CLI",
    pack: "dev",
    subcategory: "IA & Agentes CLI",
    description:
      "Copilot no terminal para explicar, gerar e executar comandos shell (requer Node.js/npm).",
    defaultSelected: false,
    targets: everywhere(script("npm install -g @github/copilot")),
  },
  {
    slug: "ollama",
    name: "Ollama",
    pack: "dev",
    subcategory: "IA & Agentes CLI",
    description:
      "Roda LLMs localmente (Llama, Qwen, DeepSeek) com uma API compatível com OpenAI.",
    defaultSelected: true,
    targets: everywhere(script("curl -fsSL https://ollama.com/install.sh | sh")),
  },
  {
    slug: "git",
    name: "Git",
    pack: "dev",
    subcategory: "Controle de Versão",
    description: "Controle de versão distribuído e base de todo o fluxo de desenvolvimento.",
    defaultSelected: true,
    targets: everywhere(native("git")),
  },
  {
    slug: "github-cli",
    name: "GitHub CLI (gh)",
    pack: "dev",
    subcategory: "Controle de Versão",
    description:
      "Gerencia PRs, issues, releases e Actions direto do terminal com autenticação OAuth.",
    defaultSelected: false,
    targets: everywhere(native("gh")),
  },
  {
    slug: "lazygit",
    name: "Lazygit",
    pack: "dev",
    subcategory: "Controle de Versão",
    description:
      "Interface TUI para Git: stage por hunk, rebase interativo e resolução de conflitos sem decorar flags.",
    defaultSelected: false,
    targets: everywhere(native("lazygit")),
  },
  {
    slug: "docker",
    name: "Docker Engine + Compose",
    pack: "dev",
    subcategory: "Containers & DevOps",
    description:
      "Runtime de containers oficial com o plugin Compose v2 e serviço systemd habilitado.",
    defaultSelected: true,
    targets: targets(
      script("curl -fsSL https://get.docker.com | sh", 'sudo systemctl enable --now docker && sudo usermod -aG docker "$USER"'),
      script("curl -fsSL https://get.docker.com | sh", 'sudo systemctl enable --now docker && sudo usermod -aG docker "$USER"'),
      native("moby-engine docker-compose", 'sudo systemctl enable --now docker && sudo usermod -aG docker "$USER"'),
      script("curl -fsSL https://get.docker.com | sh", 'sudo systemctl enable --now docker && sudo usermod -aG docker "$USER"')
    ),
  },
  {
    slug: "lazydocker",
    name: "Lazydocker",
    pack: "dev",
    subcategory: "Containers & DevOps",
    description:
      "Dashboard TUI para containers, imagens, volumes e logs — o Lazygit do Docker.",
    defaultSelected: false,
    targets: everywhere(
      script(
        "curl -fsSL https://raw.githubusercontent.com/jesseduffield/lazydocker/master/scripts/install_update_linux.sh | bash"
      )
    ),
  },
  {
    slug: "kubectl",
    name: "kubectl",
    pack: "dev",
    subcategory: "Containers & DevOps",
    description:
      "CLI oficial do Kubernetes, baixada direto do release estável e instalada em /usr/local/bin.",
    defaultSelected: false,
    targets: everywhere(
      script(
        'KUBECTL_VERSION="$(curl -fsSL https://dl.k8s.io/release/stable.txt)" && curl -fsSLo /tmp/kubectl "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" && sudo install -m 0755 /tmp/kubectl /usr/local/bin/kubectl'
      )
    ),
  },
  {
    slug: "pgadmin4",
    name: "pgAdmin 4",
    pack: "dev",
    subcategory: "Bancos de Dados",
    description: "Interface web/desktop completa para administrar PostgreSQL.",
    defaultSelected: false,
    targets: targets(
      flatpak("org.pgadmin.pgadmin4"),
      flatpak("org.pgadmin.pgadmin4"),
      flatpak("org.pgadmin.pgadmin4"),
      aur("pgadmin4")
    ),
  },
  {
    slug: "dbeaver",
    name: "DBeaver Community",
    pack: "dev",
    subcategory: "Bancos de Dados",
    description:
      "Cliente universal de bancos (Postgres, MySQL, SQLite, Mongo, Oracle) com editor SQL avançado.",
    defaultSelected: false,
    targets: targets(
      flatpak("io.dbeaver.DBeaverCommunity"),
      flatpak("io.dbeaver.DBeaverCommunity"),
      flatpak("io.dbeaver.DBeaverCommunity"),
      native("dbeaver")
    ),
  },
  {
    slug: "mongodb-compass",
    name: "MongoDB Compass",
    pack: "dev",
    subcategory: "Bancos de Dados",
    description:
      "GUI oficial do MongoDB para explorar documentos, rodar aggregation pipelines e analisar schema.",
    defaultSelected: false,
    targets: targets(
      script(downloadPage("https://www.mongodb.com/try/download/compass")),
      script(downloadPage("https://www.mongodb.com/try/download/compass")),
      script(downloadPage("https://www.mongodb.com/try/download/compass")),
      aur("mongodb-compass")
    ),
  },
  {
    slug: "redis-insight",
    name: "Redis Insight",
    pack: "dev",
    subcategory: "Bancos de Dados",
    description:
      "Cliente gráfico do Redis: browser de chaves, CLI integrada e análise de memória em tempo real.",
    defaultSelected: false,
    targets: targets(
      script(downloadPage("https://redis.io/insight/")),
      script(downloadPage("https://redis.io/insight/")),
      script(downloadPage("https://redis.io/insight/")),
      aur("redisinsight")
    ),
  },
  {
    slug: "postman",
    name: "Postman",
    pack: "dev",
    subcategory: "APIs & Redes",
    description: "Plataforma completa para testar, documentar e mockar APIs REST/GraphQL.",
    defaultSelected: false,
    targets: targets(
      flatpak("com.getpostman.Postman"),
      flatpak("com.getpostman.Postman"),
      flatpak("com.getpostman.Postman"),
      aur("postman-bin")
    ),
  },
  {
    slug: "insomnia",
    name: "Insomnia",
    pack: "dev",
    subcategory: "APIs & Redes",
    description: "Cliente de APIs leve com suporte a REST, GraphQL, gRPC e WebSockets.",
    defaultSelected: false,
    targets: targets(
      flatpak("rest.insomnia.Insomnia"),
      flatpak("rest.insomnia.Insomnia"),
      flatpak("rest.insomnia.Insomnia"),
      aur("insomnia-bin")
    ),
  },
  {
    slug: "bruno",
    name: "Bruno",
    pack: "dev",
    subcategory: "APIs & Redes",
    description:
      "Cliente de APIs offline-first: coleções versionadas em arquivos e sem sincronização na nuvem.",
    defaultSelected: false,
    targets: targets(
      flatpak("com.usebruno.Bruno"),
      flatpak("com.usebruno.Bruno"),
      flatpak("com.usebruno.Bruno"),
      aur("bruno-bin")
    ),
  },
  {
    slug: "ngrok",
    name: "ngrok",
    pack: "dev",
    subcategory: "APIs & Redes",
    description: "Expõe localhost na internet com túneis HTTPS, inspeção de tráfego e webhooks.",
    defaultSelected: false,
    targets: everywhere(
      script(
        "curl -fsSL https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz | sudo tar -xz -C /usr/local/bin"
      )
    ),
  },
  {
    slug: "nvm",
    name: "NVM (Node.js/Bun/pnpm)",
    pack: "dev",
    subcategory: "Runtimes & SDKs",
    description:
      "Version manager do Node.js com suporte a Bun e pnpm; permite alternar versões por projeto.",
    defaultSelected: true,
    targets: everywhere(
      script(
        "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
      )
    ),
  },
  {
    slug: "pyenv",
    name: "Pyenv",
    pack: "dev",
    subcategory: "Runtimes & SDKs",
    description:
      "Instala e alterna entre múltiplas versões do Python sem tocar no Python do sistema.",
    defaultSelected: false,
    targets: everywhere(script("curl -fsSL https://pyenv.run | bash")),
  },
  {
    slug: "rustup",
    name: "Rustup",
    pack: "dev",
    subcategory: "Runtimes & SDKs",
    description:
      "Toolchain oficial do Rust: stable/beta/nightly, componentes e targets cruzados.",
    defaultSelected: false,
    targets: everywhere(
      script(
        "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
      )
    ),
  },
  {
    slug: "sdkman",
    name: "SDKMAN",
    pack: "dev",
    subcategory: "Runtimes & SDKs",
    description:
      "Gerencia JDKs (Temurin, GraalVM), Maven, Gradle, Kotlin e Scala com um comando.",
    defaultSelected: false,
    targets: everywhere(script('curl -s "https://get.sdkman.io" | bash')),
  },
  {
    slug: "go",
    name: "Go",
    pack: "dev",
    subcategory: "Runtimes & SDKs",
    description:
      "Toolchain do Go direto do repositório da distro, pronta para módulos e cross-compile.",
    defaultSelected: false,
    targets: targets(
      native("golang-go"),
      native("golang"),
      native("golang"),
      native("go")
    ),
  },
  {
    slug: "zsh-ohmyzsh",
    name: "Zsh + Oh My Zsh",
    pack: "dev",
    subcategory: "Terminal & Shell",
    description:
      "Shell Zsh com o framework Oh My Zsh, tema e plugins configurados (sem trocar o shell padrão).",
    defaultSelected: true,
    targets: targets(
      script(
        'sudo apt install -y zsh && RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
        'sudo chsh -s "$(command -v zsh)" "$USER"'
      ),
      script(
        'sudo dnf install -y zsh && RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
        'sudo chsh -s "$(command -v zsh)" "$USER"'
      ),
      script(
        'if has zsh; then RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"; else warn "Instale o zsh via rpm-ostree e rode o instalador do Oh My Zsh depois."; fi',
        'sudo chsh -s "$(command -v zsh)" "$USER"'
      ),
      script(
        'sudo pacman -S --needed --noconfirm zsh && RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
        'sudo chsh -s "$(command -v zsh)" "$USER"'
      )
    ),
  },
  {
    slug: "kitty",
    name: "Kitty",
    pack: "dev",
    subcategory: "Terminal & Shell",
    description:
      "Emulador de terminal acelerado por GPU com splits, ligaduras e protocolo de imagens.",
    defaultSelected: false,
    targets: targets(
      native("kitty"),
      native("kitty"),
      flatpak("net.kovidgoyal.kitty"),
      native("kitty")
    ),
  },
  {
    slug: "warp",
    name: "Warp",
    pack: "dev",
    subcategory: "Terminal & Shell",
    description:
      "Terminal moderno com blocos, autocomplete por IA e workflows compartilháveis (download manual).",
    defaultSelected: false,
    targets: targets(
      script(downloadPage("https://www.warp.dev/download")),
      script(downloadPage("https://www.warp.dev/download")),
      script(downloadPage("https://www.warp.dev/download")),
      aur("warp-terminal")
    ),
  },
  {
    slug: "tmux",
    name: "Tmux",
    pack: "dev",
    subcategory: "Terminal & Shell",
    description:
      "Multiplexador de terminal para sessões persistentes, splits e pareamento remoto.",
    defaultSelected: false,
    targets: everywhere(native("tmux")),
  },
  {
    slug: "jq",
    name: "jq",
    pack: "dev",
    subcategory: "Terminal & Shell",
    description: "Processador de JSON no terminal — indispensável em scripts e debug de APIs.",
    defaultSelected: false,
    targets: everywhere(native("jq")),
  },
  {
    slug: "ripgrep",
    name: "ripgrep (rg)",
    pack: "dev",
    subcategory: "Terminal & Shell",
    description: "Busca recursiva em arquivos muito mais rápida que grep, respeitando .gitignore.",
    defaultSelected: false,
    targets: everywhere(native("ripgrep")),
  },
  {
    slug: "fzf",
    name: "fzf",
    pack: "dev",
    subcategory: "Terminal & Shell",
    description:
      "Fuzzy finder para histórico, arquivos e branches — integra com zsh, vim e tmux.",
    defaultSelected: true,
    targets: everywhere(native("fzf")),
  },
  {
    slug: "discord-dev",
    name: "Discord",
    pack: "dev",
    subcategory: "Comunicação",
    description: "Comunidade e calls para times de desenvolvimento, com compartilhamento de tela.",
    defaultSelected: false,
    targets: everywhere(flatpak("com.discordapp.Discord")),
  },
  {
    slug: "slack",
    name: "Slack",
    pack: "dev",
    subcategory: "Comunicação",
    description: "Mensageria corporativa com huddles, threads e integrações de CI/CD.",
    defaultSelected: false,
    targets: everywhere(flatpak("com.slack.Slack")),
  },
];

// ---------------------------------------------------------------------------
// Pack: Editores de Conteúdo
// ---------------------------------------------------------------------------

const CREATOR_PACKAGES: SoftwarePackage[] = [
  {
    slug: "photocraft",
    name: "PhotoCraft",
    pack: "creator",
    subcategory: "Suíte Craft (Open-Source Adobe)",
    description:
      "Pacote integrador da suíte fotográfica: instala GIMP, Krita e Darktable em um passo.",
    defaultSelected: false,
    targets: targets(
      native("gimp krita darktable"),
      native("gimp krita darktable"),
      flatpak("org.gimp.GIMP org.kde.krita org.darktable.Darktable"),
      native("gimp krita darktable")
    ),
  },
  {
    slug: "videocraft",
    name: "VideoCraft",
    pack: "creator",
    subcategory: "Suíte Craft (Open-Source Adobe)",
    description:
      "Pacote integrador de vídeo: instala Kdenlive, Shotcut e HandBrake para edição e transcodificação.",
    defaultSelected: false,
    targets: targets(
      native("kdenlive shotcut handbrake"),
      native("kdenlive shotcut handbrake-gui"),
      flatpak("org.kde.kdenlive org.shotcut.Shotcut fr.handbrake.ghb"),
      native("kdenlive shotcut handbrake")
    ),
  },
  {
    slug: "vectorcraft",
    name: "VectorCraft",
    pack: "creator",
    subcategory: "Suíte Craft (Open-Source Adobe)",
    description:
      "Pacote integrador de vetores e diagramação: instala Inkscape e Scribus.",
    defaultSelected: false,
    targets: targets(
      native("inkscape scribus"),
      native("inkscape scribus"),
      flatpak("org.inkscape.Inkscape net.scribus.Scribus"),
      native("inkscape scribus")
    ),
  },
  {
    slug: "motioncraft",
    name: "MotionCraft",
    pack: "creator",
    subcategory: "Suíte Craft (Open-Source Adobe)",
    description:
      "Pacote integrador de motion e 3D: instala Blender e Natron para composição e VFX.",
    defaultSelected: false,
    targets: targets(
      native("blender natron"),
      flatpak("org.blender.Blender fr.natron.Natron"),
      flatpak("org.blender.Blender fr.natron.Natron"),
      script(
        'sudo pacman -S --needed --noconfirm blender && "$AUR_HELPER" -S --needed --noconfirm natron-bin'
      )
    ),
  },
  {
    slug: "gimp",
    name: "GIMP",
    pack: "creator",
    subcategory: "Foto & Tratamento RAW",
    description:
      "Editor de imagens raster completo: camadas, máscaras, scripts e suporte a CMYK via plugins.",
    defaultSelected: true,
    targets: targets(
      native("gimp"),
      native("gimp"),
      flatpak("org.gimp.GIMP"),
      native("gimp")
    ),
  },
  {
    slug: "photogimp",
    name: "PhotoGIMP",
    pack: "creator",
    subcategory: "Foto & Tratamento RAW",
    description:
      "Patch que deixa o GIMP com atalhos e layout no estilo Photoshop para quem está migrando.",
    defaultSelected: false,
    targets: everywhere(
      script(
        'curl -fsSL -o /tmp/photogimp.zip https://github.com/Diolinux/PhotoGIMP/releases/latest/download/PhotoGIMP-linux.zip && unzip -o /tmp/photogimp.zip -d "$HOME/.config"'
      )
    ),
  },
  {
    slug: "krita",
    name: "Krita",
    pack: "creator",
    subcategory: "Foto & Tratamento RAW",
    description:
      "Pintura digital e ilustração com pincéis avançados, estabilizador e animação quadro a quadro.",
    defaultSelected: false,
    targets: targets(
      native("krita"),
      native("krita"),
      flatpak("org.kde.krita"),
      native("krita")
    ),
  },
  {
    slug: "darktable",
    name: "Darktable",
    pack: "creator",
    subcategory: "Foto & Tratamento RAW",
    description:
      "Workflow RAW não-destrutivo com gerenciamento de catálogo, perfis de cor e módulos de correção.",
    defaultSelected: false,
    targets: targets(
      native("darktable"),
      native("darktable"),
      flatpak("org.darktable.Darktable"),
      native("darktable")
    ),
  },
  {
    slug: "rawtherapee",
    name: "RawTherapee",
    pack: "creator",
    subcategory: "Foto & Tratamento RAW",
    description:
      "Revelador RAW com controle fino de demosaicing, nitidez e recuperação de altas luzes.",
    defaultSelected: false,
    targets: targets(
      native("rawtherapee"),
      native("rawtherapee"),
      flatpak("com.rawtherapee.RawTherapee"),
      native("rawtherapee")
    ),
  },
  {
    slug: "inkscape",
    name: "Inkscape",
    pack: "creator",
    subcategory: "Design Vetorial & UI/UX",
    description:
      "Editor vetorial SVG profissional para logotipos, ícones, ilustrações e protótipos.",
    defaultSelected: true,
    targets: targets(
      native("inkscape"),
      native("inkscape"),
      flatpak("org.inkscape.Inkscape"),
      native("inkscape")
    ),
  },
  {
    slug: "scribus",
    name: "Scribus",
    pack: "creator",
    subcategory: "Design Vetorial & UI/UX",
    description:
      "Diagramação editorial com preflight, CMYK, PDF/X e marcas de corte para impressão.",
    defaultSelected: false,
    targets: targets(
      native("scribus"),
      native("scribus"),
      flatpak("net.scribus.Scribus"),
      native("scribus")
    ),
  },
  {
    slug: "penpot",
    name: "Penpot Desktop",
    pack: "creator",
    subcategory: "Design Vetorial & UI/UX",
    description:
      "Ferramenta open-source de design de produto e prototipagem colaborativa, alternativa ao Figma.",
    defaultSelected: false,
    targets: targets(
      script(downloadPage("https://penpot.app")),
      script(downloadPage("https://penpot.app")),
      script(downloadPage("https://penpot.app")),
      aur("penpot-desktop-bin")
    ),
  },
  {
    slug: "kdenlive",
    name: "Kdenlive",
    pack: "creator",
    subcategory: "Edição de Vídeo & Cor",
    description:
      "Editor não-linear multipista com proxies, gerenciamento de cor e renderização em lote.",
    defaultSelected: true,
    targets: targets(
      native("kdenlive"),
      native("kdenlive"),
      flatpak("org.kde.kdenlive"),
      native("kdenlive")
    ),
  },
  {
    slug: "davinci-resolve",
    name: "DaVinci Resolve (auto-deps)",
    pack: "creator",
    subcategory: "Edição de Vídeo & Cor",
    description:
      "Suíte profissional de cor, edição e VFX. Instala as dependências e abre o download oficial.",
    defaultSelected: false,
    targets: targets(
      script(
        'sudo apt install -y libapr1 libaprutil1 libasound2 libglu1-mesa libxcb-cursor0 ocl-icd-libopencl1 && echo "Baixe o DaVinci Resolve em https://www.blackmagicdesign.com/products/davinciresolve"'
      ),
      script(
        'sudo dnf install -y apr apr-util mesa-libGLU libxcrypt-compat ocl-icd && echo "Baixe o DaVinci Resolve em https://www.blackmagicdesign.com/products/davinciresolve"'
      ),
      script(
        'echo "Baixe o DaVinci Resolve em https://www.blackmagicdesign.com/products/davinciresolve"'
      ),
      aur("davinci-resolve")
    ),
  },
  {
    slug: "shotcut",
    name: "Shotcut",
    pack: "creator",
    subcategory: "Edição de Vídeo & Cor",
    description:
      "Editor de vídeo simples e estável, com timeline multipista e presets de exportação.",
    defaultSelected: false,
    targets: targets(
      native("shotcut"),
      native("shotcut"),
      flatpak("org.shotcut.Shotcut"),
      native("shotcut")
    ),
  },
  {
    slug: "blender",
    name: "Blender",
    pack: "creator",
    subcategory: "3D & Motion Graphics",
    description:
      "Suíte 3D completa: modelagem, escultura, animação, render Cycles/EEVEE e composição.",
    defaultSelected: true,
    targets: targets(
      native("blender"),
      native("blender"),
      flatpak("org.blender.Blender"),
      native("blender")
    ),
  },
  {
    slug: "natron",
    name: "Natron",
    pack: "creator",
    subcategory: "3D & Motion Graphics",
    description:
      "Composição nodal open-source inspirada no Nuke, com suporte a OpenFX e render em cluster.",
    defaultSelected: false,
    targets: targets(
      native("natron"),
      flatpak("fr.natron.Natron"),
      flatpak("fr.natron.Natron"),
      aur("natron-bin")
    ),
  },
  {
    slug: "obs-studio",
    name: "OBS Studio",
    pack: "creator",
    subcategory: "Gravação & Lives",
    description:
      "Transmissão e gravação com cenas, fontes, filtros, replay buffer e plugins de áudio.",
    defaultSelected: true,
    targets: targets(
      native("obs-studio"),
      native("obs-studio"),
      flatpak("com.obsproject.Studio"),
      native("obs-studio")
    ),
  },
  {
    slug: "kooha",
    name: "Kooha",
    pack: "creator",
    subcategory: "Gravação & Lives",
    description:
      "Gravador de tela minimalista para Wayland com áudio do sistema e região selecionável.",
    defaultSelected: false,
    targets: targets(
      native("kooha"),
      native("kooha"),
      flatpak("io.github.seadve.Kooha"),
      native("kooha")
    ),
  },
  {
    slug: "audacity",
    name: "Audacity",
    pack: "creator",
    subcategory: "Áudio, Voz & Podcast",
    description:
      "Edição e masterização de áudio multipista, com redução de ruído e análise espectral.",
    defaultSelected: false,
    targets: targets(
      native("audacity"),
      native("audacity"),
      flatpak("org.audacityteam.Audacity"),
      native("audacity")
    ),
  },
  {
    slug: "tenacity",
    name: "Tenacity",
    pack: "creator",
    subcategory: "Áudio, Voz & Podcast",
    description:
      "Fork comunitário do Audacity, sem telemetria e com foco em privacidade.",
    defaultSelected: false,
    targets: targets(
      native("tenacity"),
      native("tenacity"),
      flatpak("org.tenacityaudio.Tenacity"),
      native("tenacity")
    ),
  },
  {
    slug: "ardour",
    name: "Ardour",
    pack: "creator",
    subcategory: "Áudio, Voz & Podcast",
    description:
      "DAW profissional multipista com roteamento JACK/PipeWire, automação e edição não-destrutiva.",
    defaultSelected: false,
    targets: targets(
      native("ardour"),
      native("ardour"),
      flatpak("org.ardour.Ardour"),
      native("ardour")
    ),
  },
  {
    slug: "easyeffects",
    name: "EasyEffects",
    pack: "creator",
    subcategory: "Áudio, Voz & Podcast",
    description:
      "Cadeia de efeitos PipeWire: EQ paramétrico, compressor, gate e redução de ruído para microfone.",
    defaultSelected: false,
    targets: targets(
      native("easyeffects"),
      native("easyeffects"),
      flatpak("com.github.wwmm.easyeffects"),
      native("easyeffects")
    ),
  },
  {
    slug: "ffmpeg",
    name: "FFmpeg",
    pack: "creator",
    subcategory: "Codecs & Utilitários",
    description:
      "Canivete suíço de áudio e vídeo: conversão, corte, streaming e extração de frames.",
    defaultSelected: true,
    targets: everywhere(native("ffmpeg")),
  },
  {
    slug: "handbrake",
    name: "HandBrake",
    pack: "creator",
    subcategory: "Codecs & Utilitários",
    description:
      "Transcodificador com presets para web, dispositivos e arquivamento, usando x264/x265/SVT-AV1.",
    defaultSelected: false,
    targets: targets(
      native("handbrake"),
      native("handbrake-gui"),
      flatpak("fr.handbrake.ghb"),
      native("handbrake")
    ),
  },
  {
    slug: "upscayl",
    name: "Upscayl (IA)",
    pack: "creator",
    subcategory: "Codecs & Utilitários",
    description:
      "Aumenta a resolução de imagens com modelos de IA (Real-ESRGAN) rodando localmente.",
    defaultSelected: false,
    targets: targets(
      flatpak("io.github.upscayl.Upscayl"),
      flatpak("io.github.upscayl.Upscayl"),
      flatpak("io.github.upscayl.Upscayl"),
      aur("upscayl-bin")
    ),
  },
  {
    slug: "font-manager",
    name: "Font Manager",
    pack: "creator",
    subcategory: "Codecs & Utilitários",
    description:
      "Instala, visualiza e organiza fontes do sistema com preview de famílias e pesos.",
    defaultSelected: false,
    targets: targets(
      native("font-manager"),
      native("font-manager"),
      flatpak("org.gnome.FontManager"),
      native("font-manager")
    ),
  },
];

// ---------------------------------------------------------------------------
// Pack: Jogos
// ---------------------------------------------------------------------------

const GAMING_PACKAGES: SoftwarePackage[] = [
  {
    slug: "steam",
    name: "Steam",
    pack: "gaming",
    subcategory: "Lojas & Launchers",
    description:
      "Loja e launcher da Valve com Proton integrado, Remote Play e suporte a controles.",
    defaultSelected: true,
    targets: targets(
      native("steam-installer"),
      native("steam"),
      flatpak("com.valvesoftware.Steam"),
      native("steam")
    ),
  },
  {
    slug: "heroic",
    name: "Heroic Games Launcher",
    pack: "gaming",
    subcategory: "Lojas & Launchers",
    description:
      "Launcher open-source para Epic Games, GOG e Amazon Games com gerenciamento de Wine/Proton.",
    defaultSelected: true,
    targets: everywhere(flatpak("com.heroicgameslauncher.hgl")),
  },
  {
    slug: "lutris",
    name: "Lutris",
    pack: "gaming",
    subcategory: "Lojas & Launchers",
    description:
      "Agregador de jogos com instaladores comunitários, runners Wine/Proton e emuladores.",
    defaultSelected: false,
    targets: targets(
      native("lutris"),
      native("lutris"),
      flatpak("net.lutris.Lutris"),
      native("lutris")
    ),
  },
  {
    slug: "bottles",
    name: "Bottles",
    pack: "gaming",
    subcategory: "Lojas & Launchers",
    description:
      "Gerencia prefixos Wine em containers separados, com runners, DLLs e backups versionados.",
    defaultSelected: false,
    targets: targets(
      native("bottles"),
      native("bottles"),
      flatpak("com.usebottles.bottles"),
      native("bottles")
    ),
  },
  {
    slug: "protonup-qt",
    name: "ProtonUp-Qt (Proton-GE)",
    pack: "gaming",
    subcategory: "Camadas Proton & Wine",
    description:
      "Instala e atualiza Proton-GE, Luxtorpeda e Wine-GE para Steam, Heroic e Lutris.",
    defaultSelected: true,
    targets: everywhere(flatpak("net.davidotek.pupgui2")),
  },
  {
    slug: "wine-staging",
    name: "Wine-Staging",
    pack: "gaming",
    subcategory: "Camadas Proton & Wine",
    description:
      "Camada de compatibilidade com patches experimentais para rodar jogos e apps Windows.",
    defaultSelected: false,
    targets: targets(
      native("wine-staging"),
      native("wine"),
      native("wine"),
      native("wine-staging")
    ),
  },
  {
    slug: "winetricks",
    name: "Winetricks",
    pack: "gaming",
    subcategory: "Camadas Proton & Wine",
    description:
      "Script auxiliar para instalar componentes do Windows (VC++ runtimes, .NET, DirectX) em prefixos Wine.",
    defaultSelected: false,
    targets: targets(
      native("winetricks"),
      native("winetricks"),
      script(
        "curl -fsSL https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks -o /tmp/winetricks && chmod +x /tmp/winetricks && sudo install -m 0755 /tmp/winetricks /usr/local/bin/winetricks"
      ),
      native("winetricks")
    ),
  },
  {
    slug: "gamemode",
    name: "GameMode (Feral)",
    pack: "gaming",
    subcategory: "Performance & HUD",
    description:
      "Ajusta governor de CPU, prioridade e I/O automaticamente enquanto o jogo está em execução.",
    defaultSelected: true,
    targets: everywhere(native("gamemode")),
  },
  {
    slug: "mangohud",
    name: "MangoHud",
    pack: "gaming",
    subcategory: "Performance & HUD",
    description:
      "Overlay Vulkan/OpenGL com FPS, frametime, temperaturas e uso de GPU/CPU.",
    defaultSelected: true,
    targets: everywhere(native("mangohud")),
  },
  {
    slug: "goverlay",
    name: "GOverlay",
    pack: "gaming",
    subcategory: "Performance & HUD",
    description:
      "Interface gráfica para configurar MangoHud, vkBasalt e outros overlays sem editar arquivos.",
    defaultSelected: false,
    targets: targets(
      native("goverlay"),
      native("goverlay"),
      flatpak("io.github.benjamimgois.goverlay"),
      native("goverlay")
    ),
  },
  {
    slug: "vkbasalt",
    name: "vkBasalt",
    pack: "gaming",
    subcategory: "Performance & HUD",
    description:
      "Pós-processamento Vulkan: FXAA, SMAA, CAS (sharpening) e efeitos de cor em jogos.",
    defaultSelected: false,
    targets: everywhere(native("vkbasalt")),
  },
  {
    slug: "corectrl",
    name: "CoreCtrl",
    pack: "gaming",
    subcategory: "Hardware, GPU & RGB",
    description:
      "Controla curvas de ventoinha, limites de energia e overclock de GPUs AMD e CPUs.",
    defaultSelected: false,
    targets: everywhere(native("corectrl")),
  },
  {
    slug: "lact",
    name: "LACT",
    pack: "gaming",
    subcategory: "Hardware, GPU & RGB",
    description:
      "Controle avançado de GPUs AMD: clocks, tensão, ventoinhas e monitoramento em tempo real.",
    defaultSelected: false,
    targets: targets(
      script(downloadPage("https://github.com/ilya-zlobintsev/LACT/releases")),
      native("lact"),
      native("lact"),
      aur("lact")
    ),
  },
  {
    slug: "openrgb",
    name: "OpenRGB",
    pack: "gaming",
    subcategory: "Hardware, GPU & RGB",
    description:
      "Centraliza o RGB de teclados, mice, RAM e placas-mãe de vários fabricantes.",
    defaultSelected: false,
    targets: targets(
      flatpak("org.openrgb.OpenRGB"),
      flatpak("org.openrgb.OpenRGB"),
      flatpak("org.openrgb.OpenRGB"),
      native("openrgb")
    ),
  },
  {
    slug: "piper",
    name: "Piper",
    pack: "gaming",
    subcategory: "Hardware, GPU & RGB",
    description:
      "Configura DPI, botões, macros e iluminação de mice gamer (Logitech, SteelSeries e outros).",
    defaultSelected: false,
    targets: targets(
      native("piper"),
      native("piper"),
      flatpak("org.freedesktop.Piper"),
      native("piper")
    ),
  },
  {
    slug: "input-remapper",
    name: "Input Remapper",
    pack: "gaming",
    subcategory: "Hardware, GPU & RGB",
    description:
      "Remapeia botões, cria macros e transforma teclado em gamepad — funciona em Wayland e X11.",
    defaultSelected: false,
    targets: targets(
      native("input-remapper"),
      native("input-remapper"),
      flatpak("io.github.sezanzeb.input_remapper"),
      aur("input-remapper-git")
    ),
  },
  {
    slug: "sunshine",
    name: "Sunshine + Moonlight",
    pack: "gaming",
    subcategory: "Remote Play & Controles",
    description:
      "Servidor de game streaming de baixa latência (protocolo Moonlight) com encoder por GPU.",
    defaultSelected: false,
    targets: everywhere(flatpak("dev.lizardbyte.app.Sunshine")),
  },
  {
    slug: "moonlight",
    name: "Moonlight",
    pack: "gaming",
    subcategory: "Remote Play & Controles",
    description:
      "Cliente de streaming para jogar o PC na TV, celular ou outro computador.",
    defaultSelected: false,
    targets: everywhere(flatpak("com.moonlight_stream.Moonlight")),
  },
  {
    slug: "oversteer",
    name: "Oversteer",
    pack: "gaming",
    subcategory: "Remote Play & Controles",
    description:
      "Configura force feedback, ângulo de rotação e curvas de volantes Logitech, Thrustmaster e Fanatec.",
    defaultSelected: false,
    targets: targets(
      native("oversteer"),
      native("oversteer"),
      flatpak("io.github.berarma.Oversteer"),
      native("oversteer")
    ),
  },
  {
    slug: "antimicrox",
    name: "AntiMicroX",
    pack: "gaming",
    subcategory: "Remote Play & Controles",
    description:
      "Mapeia gamepads para teclado e mouse, com perfis por jogo e suporte a múltiplos controles.",
    defaultSelected: false,
    targets: targets(
      native("antimicrox"),
      native("antimicrox"),
      flatpak("io.github.antimicrox.antimicrox"),
      native("antimicrox")
    ),
  },
  {
    slug: "discord",
    name: "Discord",
    pack: "gaming",
    subcategory: "Voice Chat & Comunidade",
    description:
      "Voz, vídeo e compartilhamento de tela com baixa latência e overlay de jogo.",
    defaultSelected: true,
    targets: everywhere(flatpak("com.discordapp.Discord")),
  },
  {
    slug: "vesktop",
    name: "Vesktop",
    pack: "gaming",
    subcategory: "Voice Chat & Comunidade",
    description:
      "Cliente Discord leve (Vencord) com screenshare funcionando em Wayland e tema customizável.",
    defaultSelected: false,
    targets: everywhere(flatpak("dev.vencord.Vesktop")),
  },
  {
    slug: "teamspeak",
    name: "TeamSpeak",
    pack: "gaming",
    subcategory: "Voice Chat & Comunidade",
    description:
      "Voz por canais com latência baixíssima, codecs opus e controle de servidor próprio.",
    defaultSelected: false,
    targets: everywhere(flatpak("com.teamspeak.TeamSpeak3")),
  },
];

export const CATALOG_PACKAGES: SoftwarePackage[] = [
  ...DEV_PACKAGES,
  ...CREATOR_PACKAGES,
  ...GAMING_PACKAGES,
];

export const CATALOG_PACKAGES_BY_SLUG: ReadonlyMap<string, SoftwarePackage> =
  new Map(CATALOG_PACKAGES.map((pkg) => [pkg.slug, pkg]));

export const CATALOG_DISTROS_BY_SLUG: ReadonlyMap<string, DistroHubDistro> =
  new Map(CATALOG_DISTROS.map((distro) => [distro.slug, distro]));
