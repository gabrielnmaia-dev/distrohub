import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  CATALOG_DISTROS,
  CATALOG_PACKAGES,
} from "@/lib/distrohub-catalog";
import HubDistro from "@/models/HubDistro";
import ScriptPreset from "@/models/ScriptPreset";
import SoftwarePackageModel from "@/models/SoftwarePackage";
import type { DistroHubDistro, SoftwarePackage } from "@/types/distrohub";

/**
 * Seed idempotente do catálogo DistroHub.
 *
 * Uso: npm run seed
 *
 * Cada documento é atualizado por `slug` (upsert), então rodar várias vezes
 * não duplica nada e mantém o catálogo sincronizado com
 * `src/lib/distrohub-catalog.ts`.
 */

async function seed(): Promise<void> {
  await connectDB();

  await Promise.all([
    HubDistro.init(),
    SoftwarePackageModel.init(),
    ScriptPreset.init(),
  ]);

  const distroResult = await HubDistro.bulkWrite(
    CATALOG_DISTROS.map((distro) => ({
      updateOne: {
        filter: { slug: distro.slug },
        update: { $set: distro },
        upsert: true,
      },
    }))
  );

  const packageResult = await SoftwarePackageModel.bulkWrite(
    CATALOG_PACKAGES.map((pkg) => ({
      updateOne: {
        filter: { slug: pkg.slug },
        update: { $set: pkg },
        upsert: true,
      },
    }))
  );

  const [totalDistros, totalPackages, devCount, creatorCount, gamingCount] =
    await Promise.all([
      HubDistro.countDocuments(),
      SoftwarePackageModel.countDocuments(),
      SoftwarePackageModel.countDocuments({ pack: "dev" }),
      SoftwarePackageModel.countDocuments({ pack: "creator" }),
      SoftwarePackageModel.countDocuments({ pack: "gaming" }),
    ]);

  console.log("");
  console.log("  DistroHub — seed concluído");
  console.log("  --------------------------------------------------");
  console.log(
    `  Distros : ${totalDistros} no banco ` +
      `(upserted ${distroResult.upsertedCount}, modificados ${distroResult.modifiedCount})`
  );
  console.log(
    `  Pacotes : ${totalPackages} no banco ` +
      `(upserted ${packageResult.upsertedCount}, modificados ${packageResult.modifiedCount})`
  );
  console.log(`    dev     : ${devCount}`);
  console.log(`    creator : ${creatorCount}`);
  console.log(`    gaming  : ${gamingCount}`);
  console.log("  --------------------------------------------------");
  console.log("");
}

function assertCatalogIntegrity(): void {
  const distroSlugs = new Set<string>();
  for (const distro of CATALOG_DISTROS) {
    if (distroSlugs.has(distro.slug)) {
      throw new Error(`Distro duplicada no catálogo: ${distro.slug}`);
    }
    distroSlugs.add(distro.slug);
  }

  const packageSlugs = new Set<string>();
  for (const pkg of CATALOG_PACKAGES) {
    if (packageSlugs.has(pkg.slug)) {
      throw new Error(`Pacote duplicado no catálogo: ${pkg.slug}`);
    }
    packageSlugs.add(pkg.slug);
  }

  const packs = new Set<SoftwarePackage["pack"]>(["dev", "creator", "gaming"]);
  for (const pkg of CATALOG_PACKAGES) {
    if (!packs.has(pkg.pack)) {
      throw new Error(`Pacote ${pkg.slug} com pack inválido: ${pkg.pack}`);
    }
  }

  const recommended = new Set<DistroHubDistro["recommendedPacks"][number]>([
    "dev",
    "creator",
    "gaming",
  ]);
  for (const distro of CATALOG_DISTROS) {
    for (const pack of distro.recommendedPacks) {
      if (!recommended.has(pack)) {
        throw new Error(`Distro ${distro.slug} recomenda pack inválido: ${pack}`);
      }
    }
  }
}

assertCatalogIntegrity();

seed()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Falha ao popular o banco:", error);
    await mongoose.disconnect().catch(() => undefined);
    process.exitCode = 1;
  });
