# DistroHub

Catálogo de distros Linux com **quiz de recomendação**, **configurador de packs** (estilo Ninite) e **gerador de scripts `.sh`** prontos para `curl | bash`.

## Stack

- Next.js 16 (App Router + Cache Components)
- TypeScript estrito
- Tailwind CSS v4
- MongoDB + Mongoose
- NextAuth (área admin existente)

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha MONGODB_URI e NEXTAUTH_SECRET
npm run seed                 # popula distros + catálogo de pacotes (idempotente)
npm run dev
```

Variáveis de ambiente:

| Variável              | Uso                                                        |
| --------------------- | ---------------------------------------------------------- |
| `MONGODB_URI`         | Conexão do MongoDB                                         |
| `NEXTAUTH_SECRET`     | Sessão do NextAuth                                         |
| `NEXTAUTH_URL`        | URL base do NextAuth                                       |
| `NEXT_PUBLIC_SITE_URL`| Base dos links `curl \| bash` (default: origem da request) |

## Funcionalidades

### Quiz (`/quiz`)

Quatro perguntas (objetivo, GPU, estilo de atualização, experiência) pontuam cada distro
com os pesos de `quizWeights`. O resultado mostra a vencedora, o percentual de aderência,
duas alternativas e um CTA que abre o configurador já com distro + pack recomendado.

Motor puro em `src/lib/quiz-engine.ts` (sem dependências de servidor).

### Configurador (`/configurador`)

Duas colunas no desktop:

- **Esquerda:** seletor de distro, abas dos packs (`dev`, `creator`, `gaming`), busca,
  “Selecionar padrão” / “Limpar” e cards agrupados por subcategoria.
- **Direita (sticky):** preview do `.sh` com syntax highlighting, contagem por método de
  instalação, copiar, baixar via `Blob` e gerar link `curl | bash`.

O preview roda o mesmo compilador do servidor, no browser — nada é enviado até você pedir
o link.

### Compilador (`src/lib/script-compiler.ts`)

Função pura e isomórfica (`compileScript({ distro, packages })`) que gera um `.sh` com
`set -euo pipefail` em 4 etapas:

1. `sudo -v` + detecção de GPU via `lspci`.
2. Repositórios por família: APT + Flathub, DNF + RPM Fusion + Flathub,
   rpm-ostree/Flathub (sem `dnf`) ou `paru`/`yay` + `multilib` (Arch).
3. Instalação em lote: nativos (`apt`/`dnf`/`pacman`/`rpm-ostree`), AUR, Flatpak e
   instaladores oficiais (nvm, rustup, SDKMAN, Oh My Zsh com `RUNZSH=no`, …).
4. Hooks pós-instalação: `postHook` de cada pacote, codecs + regras udev de mesa
   digitalizadora + alerta CUDA/OpenCL (pack creator) e GameMode + variáveis de ambiente
   (pack gaming).

### API

| Método | Rota                    | Descrição                                                        |
| ------ | ----------------------- | ---------------------------------------------------------------- |
| `POST` | `/api/presets`          | Salva `{ distroSlug, selectedPackageSlugs }` e devolve `shortId`, `rawUrl` e `curlCommand` |
| `GET`  | `/api/script/[shortId]` | Compila o preset, incrementa `downloadsCount` e devolve o `.sh` como `text/x-shellscript` |

Exemplo:

```bash
curl -X POST http://localhost:3000/api/presets \
  -H 'Content-Type: application/json' \
  -d '{"distroSlug":"fedora-workstation","selectedPackageSlugs":["vscode","git","docker"]}'

# resposta:
# { "shortId": "abc1234", "rawUrl": "...", "curlCommand": "curl -fsSL ... | bash" }
```

## Modelos (`src/models`)

- `HubDistro` → `distrohub_distros` (slug, name, family, recommendedPacks, tagline, isoUrl, quizWeights)
- `SoftwarePackage` → `software_packages` (slug, pack, subcategory, targets por família, postHook)
- `ScriptPreset` → `script_presets` (shortId, distroSlug, selectedPackageSlugs, downloadsCount)

> A coleção `distros` (campos em português) continua sendo usada pelas páginas antigas.
> Os modelos novos vivem em coleções próprias para não quebrar o catálogo legado.

O catálogo canônico fica em `src/lib/distrohub-catalog.ts` e é aplicado pelo seed
(`npm run seed`), que faz `upsert` por `slug` — rodar várias vezes não duplica nada.
