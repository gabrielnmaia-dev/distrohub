export const FOCOS = [
  "dev",
  "jogos",
  "produtividade",
  "iniciantes",
  "servidor",
] as const;

export type Foco = (typeof FOCOS)[number];

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