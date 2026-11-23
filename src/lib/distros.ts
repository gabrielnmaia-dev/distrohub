import { connectDB } from "@/lib/mongodb";
import Distro from "@/models/Distro";
import type { Distro as DistroType } from "@/types";

export async function getDistros(foco?: string): Promise<DistroType[]> {
  await connectDB();
  const filtro = foco ? { foco } : {};
  const distros = await Distro.find(filtro).sort({ nome: 1 }).lean();
  return JSON.parse(JSON.stringify(distros));
}

export async function getDistroBySlug(slug: string): Promise<DistroType | null> {
  await connectDB();
  const distro = await Distro.findOne({ slug }).lean();
  return distro ? JSON.parse(JSON.stringify(distro)) : null;
}