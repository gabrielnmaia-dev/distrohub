import mongoose, { Schema, type Model } from "mongoose";
import {
  DISTRO_FAMILIES,
  PACKS,
  type DistroFamily,
  type DistroHubDistro,
  type Pack,
  type QuizWeights,
} from "@/types/distrohub";

/**
 * Distros do motor de recomendação.
 *
 * A coleção é separada da coleção legada `distros` (que usa campos em
 * português e alimenta as páginas antigas) para não quebrar o site atual.
 */
const QuizWeightsSchema = new Schema<QuizWeights>(
  {
    goalDev: { type: Number, required: true, default: 0, min: 0, max: 10 },
    goalCreator: { type: Number, required: true, default: 0, min: 0, max: 10 },
    goalGaming: { type: Number, required: true, default: 0, min: 0, max: 10 },
    gpuNvidia: { type: Number, required: true, default: 0, min: 0, max: 10 },
    gpuAmdIntel: { type: Number, required: true, default: 0, min: 0, max: 10 },
    updatesStable: { type: Number, required: true, default: 0, min: 0, max: 10 },
    updatesBalanced: { type: Number, required: true, default: 0, min: 0, max: 10 },
    updatesRolling: { type: Number, required: true, default: 0, min: 0, max: 10 },
    expBeginner: { type: Number, required: true, default: 0, min: 0, max: 10 },
    expAdvanced: { type: Number, required: true, default: 0, min: 0, max: 10 },
    desktopGnome: { type: Number, default: 0, min: 0, max: 10 },
    desktopKde: { type: Number, default: 0, min: 0, max: 10 },
    desktopTiling: { type: Number, default: 0, min: 0, max: 10 },
    desktopClassic: { type: Number, default: 0, min: 0, max: 10 },
    hardwareLight: { type: Number, default: 0, min: 0, max: 10 },
    hardwareBalanced: { type: Number, default: 0, min: 0, max: 10 },
    hardwarePowerful: { type: Number, default: 0, min: 0, max: 10 },
    deviceDesktop: { type: Number, default: 0, min: 0, max: 10 },
    deviceLaptop: { type: Number, default: 0, min: 0, max: 10 },
    deviceHandheld: { type: Number, default: 0, min: 0, max: 10 },
    systemImmutable: { type: Number, default: 0, min: 0, max: 10 },
    systemSnapshots: { type: Number, default: 0, min: 0, max: 10 },
    systemTraditional: { type: Number, default: 0, min: 0, max: 10 },
    packageAur: { type: Number, default: 0, min: 0, max: 10 },
    packageFlatpak: { type: Number, default: 0, min: 0, max: 10 },
    packageOfficial: { type: Number, default: 0, min: 0, max: 10 },
  },
  { _id: false }
);

const HubDistroSchema = new Schema<DistroHubDistro>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    family: {
      type: String,
      enum: DISTRO_FAMILIES,
      required: true,
    },
    recommendedPacks: {
      type: [String],
      enum: PACKS,
      default: [],
    },
    tagline: { type: String, required: true, trim: true },
    isoUrl: { type: String, required: true, trim: true },
    iconUrl: { type: String, default: "", trim: true },
    quizWeights: { type: QuizWeightsSchema, required: true },
  },
  { timestamps: true, collection: "distrohub_distros" }
);

export type HubDistroDocument = DistroHubDistro & {
  family: DistroFamily;
  recommendedPacks: Pack[];
};

const HubDistro: Model<DistroHubDistro> =
  (mongoose.models.HubDistro as Model<DistroHubDistro> | undefined) ??
  mongoose.model<DistroHubDistro>("HubDistro", HubDistroSchema);

export default HubDistro;
