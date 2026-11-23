import mongoose, { Schema, type Model } from "mongoose";
import type { ScriptPreset } from "@/types/distrohub";

/**
 * Presets compartilháveis: guardam apenas referências (slug da distro +
 * slugs de pacotes), nunca o script compilado. Assim o `.sh` é sempre
 * gerado a partir do catálogo atual e o documento fica pequeno.
 */
const ScriptPresetSchema = new Schema<ScriptPreset>(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      match: /^[a-z0-9]{6,8}$/,
    },
    distroSlug: { type: String, required: true, index: true, trim: true },
    selectedPackageSlugs: { type: [String], default: [] },
    downloadsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "script_presets" }
);

const ScriptPresetModel: Model<ScriptPreset> =
  (mongoose.models.ScriptPreset as Model<ScriptPreset> | undefined) ??
  mongoose.model<ScriptPreset>("ScriptPreset", ScriptPresetSchema);

export default ScriptPresetModel;
