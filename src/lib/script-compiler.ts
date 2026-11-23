import type {
  DistroFamily,
  Pack,
  PackageTargets,
  TargetSpec,
} from "@/types/distrohub";
import { PACK_LABELS } from "@/types/distrohub";

/**
 * Compilador puro de scripts.
 *
 * Roda tanto no browser (preview instantâneo do configurador) quanto no
 * servidor (`GET /api/script/[shortId]`). Não importa nada de `node:*`,
 * `mongoose` ou `next` — só tipos.
 */

export const SCRIPT_FILENAME = "distrohub-setup.sh";

export interface CompilerDistro {
  slug: string;
  name: string;
  family: DistroFamily;
  isoUrl?: string;
}

export interface CompilerPackage {
  slug: string;
  name: string;
  pack: Pack;
  targets: PackageTargets;
}

export interface CompileInput {
  distro: CompilerDistro;
  packages: CompilerPackage[];
}

const NATIVE_COMMAND: Record<DistroFamily, string> = {
  debian: "sudo apt install -y",
  fedora: "sudo dnf install -y",
  "fedora-atomic": "sudo rpm-ostree install --idempotent --allow-inactive",
  arch: "sudo pacman -S --needed --noconfirm",
};

const NATIVE_LABEL: Record<DistroFamily, string> = {
  debian: "APT",
  fedora: "DNF",
  "fedora-atomic": "rpm-ostree",
  arch: "Pacman",
};

/** Remove quebras de linha e aspas duplas de valores vindos do catálogo. */
function sanitize(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/"/g, "'").trim();
}

function splitTokens(pkg: string): string[] {
  return pkg
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

/** Quebra um comando longo em várias linhas com `\` para manter o `.sh` legível. */
function commandLines(command: string, args: string[]): string[] {
  const limit = 78;
  const chunks: string[] = [];
  let current = command;

  for (const arg of args) {
    if (current !== command && current.length + arg.length + 1 > limit) {
      chunks.push(`${current} \\`);
      current = `  ${arg}`;
    } else {
      current = `${current} ${arg}`;
    }
  }

  chunks.push(current);
  return chunks;
}

/** Quebra uma lista de nomes em comentários de até ~100 colunas. */
function wrapComment(prefix: string, items: string[], limit = 100): string[] {
  const out: string[] = [];
  let line = prefix;

  for (const item of items) {
    const piece = line === prefix ? ` ${item}` : `, ${item}`;
    if (line !== prefix && line.length + piece.length > limit) {
      out.push(`${line},`);
      line = `#     ${item}`;
    } else {
      line += piece;
    }
  }

  out.push(line);
  return out;
}

interface Collected {
  native: string[];
  aur: string[];
  flatpak: string[];
  scripts: { name: string; command: string }[];
  hooks: { name: string; command: string }[];
  packs: Set<Pack>;
  namesByPack: Map<Pack, string[]>;
}

function collect(
  distro: CompilerDistro,
  packages: CompilerPackage[]
): Collected {
  const native = new Set<string>();
  const aur = new Set<string>();
  const flatpak = new Set<string>();
  const scripts: { name: string; command: string }[] = [];
  const hooks: { name: string; command: string }[] = [];
  const packs = new Set<Pack>();
  const namesByPack = new Map<Pack, string[]>();
  const seenScripts = new Set<string>();

  for (const pkg of packages) {
    const target: TargetSpec | undefined = pkg.targets[distro.family];
    if (!target || !target.pkg.trim()) continue;

    packs.add(pkg.pack);
    const names = namesByPack.get(pkg.pack) ?? [];
    names.push(pkg.name);
    namesByPack.set(pkg.pack, names);

    if (target.postHook && target.postHook.trim().length > 0) {
      hooks.push({ name: pkg.name, command: target.postHook });
    }

    switch (target.method) {
      case "native":
        for (const token of splitTokens(target.pkg)) native.add(token);
        break;
      case "aur":
        if (distro.family === "arch") {
          for (const token of splitTokens(target.pkg)) aur.add(token);
        }
        break;
      case "flatpak":
        for (const token of splitTokens(target.pkg)) flatpak.add(token);
        break;
      case "script": {
        const command = target.pkg.trim();
        if (!seenScripts.has(command)) {
          seenScripts.add(command);
          scripts.push({ name: pkg.name, command });
        }
        break;
      }
    }
  }

  return {
    native: [...native],
    aur: [...aur],
    flatpak: [...flatpak],
    scripts,
    hooks,
    packs,
    namesByPack,
  };
}

function stepTwo(distro: CompilerDistro, packs: Set<Pack>): string[] {
  switch (distro.family) {
    case "debian":
      return [
        'log "Atualizando índices do APT"',
        "sudo apt update",
        'log "Garantindo Flatpak e o repositório Flathub"',
        "sudo apt install -y flatpak ca-certificates curl gnupg",
        "if ! flatpak remotes --columns=name | grep -qx flathub; then",
        "  sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
        "fi",
      ];

    case "fedora":
      return [
        'log "Habilitando RPM Fusion (free e nonfree)"',
        "sudo dnf install -y \\",
        '  "https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm" \\',
        '  "https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm"',
        'log "Garantindo Flatpak e o repositório Flathub"',
        "sudo dnf install -y flatpak",
        "sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
      ];

    case "fedora-atomic":
      return [
        'log "Imagem atômica detectada: sem dnf, apenas Flatpak e rpm-ostree"',
        "if has rpm-ostree; then",
        '  log "rpm-ostree disponível: pacotes nativos serão sobrepostos na etapa 3"',
        "else",
        '  warn "rpm-ostree não encontrado; somente pacotes Flatpak serão instalados"',
        "fi",
        'has flatpak || die "flatpak não encontrado nesta imagem"',
        "sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo",
      ];

    case "arch": {
      const lines = [
        'log "Verificando helper de AUR (paru ou yay)"',
        "if ! has paru && ! has yay; then",
        '  log "Nenhum helper encontrado: compilando yay-bin a partir do AUR"',
        "  sudo pacman -S --needed --noconfirm base-devel git",
        '  BUILD_DIR="$(mktemp -d)"',
        '  git clone --depth=1 https://aur.archlinux.org/yay-bin.git "$BUILD_DIR/yay-bin"',
        '  ( cd "$BUILD_DIR/yay-bin" && makepkg -si --noconfirm )',
        '  rm -rf "$BUILD_DIR"',
        "fi",
        'AUR_HELPER="$(command -v paru || command -v yay)"',
        'log "Helper AUR: $AUR_HELPER"',
      ];

      if (packs.has("gaming")) {
        lines.push(
          "if ! grep -q '^\\[multilib\\]' /etc/pacman.conf; then",
          '  log "Habilitando o repositório multilib (Steam/Wine 32-bit)"',
          "  sudo sed -i '/^#\\[multilib\\]/,/^#Include/ s/^#//' /etc/pacman.conf",
          "fi"
        );
      }

      lines.push('log "Sincronizando o sistema"', "sudo pacman -Syu --noconfirm");
      return lines;
    }
  }
}

function stepThree(
  distro: CompilerDistro,
  collected: Collected
): string[] {
  const lines: string[] = [];
  const { native, aur, flatpak, scripts } = collected;

  if (native.length > 0) {
    lines.push(
      `log "Instalando ${native.length} pacote(s) nativos via ${NATIVE_LABEL[distro.family]}"`,
      ...commandLines(NATIVE_COMMAND[distro.family], native)
    );
    if (distro.family === "fedora-atomic") {
      lines.push(
        'warn "Pacotes sobrepostos via rpm-ostree entram em vigor após reiniciar a máquina."'
      );
    }
    lines.push("");
  }

  if (aur.length > 0) {
    lines.push(
      `log "Instalando ${aur.length} pacote(s) do AUR"`,
      ...commandLines('"$AUR_HELPER" -S --needed --noconfirm', aur),
      ""
    );
  }

  if (flatpak.length > 0) {
    lines.push(
      `log "Instalando ${flatpak.length} app(s) Flatpak do Flathub"`,
      ...commandLines("sudo flatpak install -y --noninteractive flathub", flatpak),
      ""
    );
  }

  for (const entry of scripts) {
    const name = sanitize(entry.name);
    lines.push(
      `log "Executando instalador: ${name}"`,
      `if ! ( ${entry.command} ); then`,
      `  warn "Falha ao executar o instalador de ${name}."`,
      "fi",
      ""
    );
  }

  if (lines.length === 0) {
    lines.push('warn "Nenhum pacote selecionado para esta distro."', "");
  }

  return lines;
}

function stepFour(
  distro: CompilerDistro,
  collected: Collected
): string[] {
  const lines: string[] = [];
  const { hooks, packs } = collected;

  for (const hook of hooks) {
    const name = sanitize(hook.name);
    lines.push(
      `log "Hook: ${name}"`,
      `if ! ( ${hook.command} ); then`,
      `  warn "Falha no hook de ${name}."`,
      "fi",
      ""
    );
  }

  if (packs.has("creator")) {
    const codecs: Record<DistroFamily, string> = {
      debian:
        "sudo apt install -y gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav libavcodec-extra",
      fedora:
        "sudo dnf install -y gstreamer1-plugins-good gstreamer1-plugins-bad-free gstreamer1-plugins-ugly-free ffmpeg",
      "fedora-atomic":
        "sudo flatpak install -y --noninteractive flathub org.freedesktop.Platform.ffmpeg-full",
      arch: "sudo pacman -S --needed --noconfirm gst-plugins-good gst-plugins-bad gst-plugins-ugly gst-libav ffmpeg",
    };

    lines.push(
      'log "Pacote criativo detectado: garantindo codecs multimídia"',
      `if ! ( ${codecs[distro.family]} ); then`,
      '  warn "Não foi possível instalar todos os codecs; verifique os repositórios."',
      "fi",
      "",
      'log "Configurando regras udev para mesas digitalizadoras (Wacom/Huion)"',
      "sudo tee /etc/udev/rules.d/99-distrohub-tablets.rules >/dev/null <<'UDEV'",
      "# DistroHub - acesso de usuario a mesas digitalizadoras",
      'SUBSYSTEM=="usb", ATTR{idVendor}=="056a", MODE="0666", GROUP="users"',
      'SUBSYSTEM=="usb", ATTR{idVendor}=="256c", MODE="0666", GROUP="users"',
      'SUBSYSTEM=="usb", ATTR{idVendor}=="2922", MODE="0666", GROUP="users"',
      "UDEV",
      "sudo udevadm control --reload-rules",
      "sudo udevadm trigger",
      "",
      "if has nvidia-smi; then",
      '  warn "GPU NVIDIA detectada: instale o toolkit CUDA para acelerar Blender, Resolve e modelos locais."',
      "elif has clinfo; then",
      '  log "OpenCL disponível: $(clinfo -l 2>/dev/null | head -n1 || true)"',
      "else",
      '  warn "OpenCL/CUDA não detectados: drivers proprietários podem ser necessários para IA e 3D."',
      "fi",
      ""
    );
  }

  if (packs.has("gaming")) {
    lines.push(
      'log "Pacote de jogos detectado: ativando GameMode e variáveis de performance"',
      "if systemctl --user list-unit-files 2>/dev/null | grep -q '^gamemoded.service'; then",
      '  systemctl --user enable --now gamemoded || warn "Não foi possível iniciar o gamemoded agora."',
      "else",
      '  warn "Serviço gamemoded não encontrado; o GameMode será ativado no próximo login."',
      "fi",
      'mkdir -p "$HOME/.config/environment.d"',
      'cat > "$HOME/.config/environment.d/90-distrohub-gaming.conf" <<\'ENV\'',
      "MANGOHUD=1",
      "MANGOHUD_CONFIG=compact",
      "WINEFSYNC=1",
      "PROTON_ENABLE_NVAPI=1",
      "DXVK_HUD=0",
      "ENV",
      'log "Variáveis gravadas em ~/.config/environment.d/90-distrohub-gaming.conf"',
      'warn "Faça logout e login novamente para aplicar as variáveis de ambiente."',
      ""
    );
  }

  if (lines.length === 0) {
    lines.push('log "Nenhum hook adicional necessário para os pacotes selecionados."', "");
  }

  return lines;
}

/**
 * Gera o `.sh` completo. Função pura: mesma entrada ⇒ mesma saída.
 */
export function compileScript({ distro, packages }: CompileInput): string {
  const collected = collect(distro, packages);
  const lines: string[] = [];

  lines.push(
    "#!/usr/bin/env bash",
    "# ==============================================================================",
    "#  DistroHub — instalador automático",
    `#  Distro : ${sanitize(distro.name)} (${distro.family})`,
    `#  Pacotes: ${packages.length} selecionado(s)`,
    "#",
    "#  Revise o script antes de executar. Gerado por DistroHub.",
    "# ==============================================================================",
    "set -euo pipefail",
    "",
    'LOG_PREFIX="[distrohub]"',
    "log()  { printf '\\033[1;34m%s\\033[0m %s\\n' \"$LOG_PREFIX\" \"$*\"; }",
    "warn() { printf '\\033[1;33m%s AVISO:\\033[0m %s\\n' \"$LOG_PREFIX\" \"$*\" >&2; }",
    "die()  { printf '\\033[1;31m%s ERRO:\\033[0m %s\\n' \"$LOG_PREFIX\" \"$*\" >&2; exit 1; }",
    'has()  { command -v "$1" >/dev/null 2>&1; }',
    ""
  );

  if (packages.length > 0) {
    lines.push("# Pacotes selecionados:");
    for (const pack of ["dev", "creator", "gaming"] as const) {
      const names = collected.namesByPack.get(pack);
      if (!names || names.length === 0) continue;
      lines.push(
        ...wrapComment(`#   [${pack}] ${PACK_LABELS[pack]}:`, names)
      );
    }
    lines.push("");
  }

  lines.push(
    "# ------------------------------------------------------------------------------",
    'log "[1/4] Verificação de ambiente"',
    "# ------------------------------------------------------------------------------",
    'sudo -v || die "é necessário sudo para instalar os pacotes"',
    "",
    'GPU_INFO="$( (lspci 2>/dev/null || true) | grep -iE \'vga|3d|display\' || true )"',
    'GPU="desconhecida"',
    "if printf '%s' \"$GPU_INFO\" | grep -qi 'nvidia'; then",
    '  GPU="nvidia"',
    "elif printf '%s' \"$GPU_INFO\" | grep -qiE 'amd|ati|radeon'; then",
    '  GPU="amd"',
    "elif printf '%s' \"$GPU_INFO\" | grep -qi 'intel'; then",
    '  GPU="intel"',
    "fi",
    'log "GPU detectada: $GPU"',
    "",
    "# ------------------------------------------------------------------------------",
    'log "[2/4] Preparação de repositórios e gerenciadores"',
    "# ------------------------------------------------------------------------------",
    ...stepTwo(distro, collected.packs),
    "",
    "# ------------------------------------------------------------------------------",
    'log "[3/4] Instalação em lote"',
    "# ------------------------------------------------------------------------------",
    ...stepThree(distro, collected),
    "# ------------------------------------------------------------------------------",
    'log "[4/4] Hooks técnicos pós-instalação"',
    "# ------------------------------------------------------------------------------",
    ...stepFour(distro, collected),
    'log "Instalação concluída. Reinicie a sessão para aplicar todos os ajustes."',
    'log "DistroHub: bom proveito!"',
    ""
  );

  return lines.join("\n");
}

/** Conta pacotes por método para exibir no preview do configurador. */
export function summarizeSelection(
  distro: CompilerDistro,
  packages: CompilerPackage[]
): Record<"native" | "aur" | "flatpak" | "script", number> {
  const collected = collect(distro, packages);
  return {
    native: collected.native.length,
    aur: collected.aur.length,
    flatpak: collected.flatpak.length,
    script: collected.scripts.length,
  };
}
