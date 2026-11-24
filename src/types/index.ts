export const FOCOS = ["dev", "criadores", "jogos", "iniciantes"] as const;

export type Foco = (typeof FOCOS)[number];

export const FOCO_LABELS: Record<Foco, string> = {
  dev: "Desenvolvedores",
  criadores: "Criadores & Edição",
  jogos: "Jogos",
  iniciantes: "Iniciantes",
};

export const FOCO_PACK_MAP: Record<Foco, "dev" | "creator" | "gaming"> = {
  dev: "dev",
  criadores: "creator",
  jogos: "gaming",
  iniciantes: "gaming",
};

export type Role = "user" | "admin";

export type StatusScript = "pendente" | "aprovado" | "rejeitado";

export interface Distro {
  _id: string;
  nome: string;
  slug: string;
  foco: Foco[];
  descricao: string;
  versao: string;
  downloadUrl: string;
  siteUrl: string;
  iconeUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  _id: string;
  titulo: string;
  descricao: string;
  distro: string;
  foco: Foco;
  scriptUrl: string;
  comando: string;
  autor: string;
  status: StatusScript;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  role: Role;
  favoritos: string[];
}
