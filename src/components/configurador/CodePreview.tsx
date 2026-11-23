"use client";

import { useMemo } from "react";

type TokenKind =
  | "comment"
  | "string"
  | "variable"
  | "keyword"
  | "option"
  | "plain";

interface Token {
  kind: TokenKind;
  text: string;
}

const TOKEN_PATTERN =
  /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\$\{[^}]+\}|\$[A-Za-z_][A-Za-z0-9_]*)|(\b(?:if|then|elif|else|fi|for|while|do|done|case|esac|function|in|set|export|local|readonly|return|sudo|apt|dnf|pacman|flatpak|rpm-ostree|systemctl|has|die|warn|log|command)\b)|(--?[A-Za-z][A-Za-z0-9-]*)/g;

const CLASS_BY_KIND: Record<TokenKind, string> = {
  comment: "text-zinc-500 italic",
  string: "text-emerald-300",
  variable: "text-sky-300",
  keyword: "text-fuchsia-400",
  option: "text-amber-300",
  plain: "text-zinc-200",
};

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      tokens.push({ kind: "plain", text: line.slice(lastIndex, index) });
    }

    const [text, comment, quoted, variable, keyword, option] = match;
    const kind: TokenKind = comment
      ? "comment"
      : quoted
        ? "string"
        : variable
          ? "variable"
          : keyword
            ? "keyword"
            : option
              ? "option"
              : "plain";

    tokens.push({ kind, text });
    lastIndex = index + text.length;
  }

  if (lastIndex < line.length) {
    tokens.push({ kind: "plain", text: line.slice(lastIndex) });
  }

  return tokens;
}

interface CodePreviewProps {
  code: string;
  maxHeightClass?: string;
}

export default function CodePreview({
  code,
  maxHeightClass = "max-h-[32rem]",
}: CodePreviewProps) {
  const highlighted = useMemo(
    () => code.split("\n").map((line) => tokenizeLine(line)),
    [code]
  );

  return (
    <div
      className={`overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 ${maxHeightClass}`}
    >
      <pre className="min-w-full p-3 font-mono text-[12.5px] leading-relaxed">
        <code>
          {highlighted.map((tokens, lineIndex) => (
            <div key={lineIndex} className="flex">
              <span className="w-9 shrink-0 select-none pr-3 text-right text-zinc-600">
                {lineIndex + 1}
              </span>
              <span className="whitespace-pre">
                {tokens.length === 0
                  ? " "
                  : tokens.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        className={CLASS_BY_KIND[token.kind]}
                      >
                        {token.text}
                      </span>
                    ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
