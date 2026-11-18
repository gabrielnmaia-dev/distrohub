import mongoose, { Schema } from "mongoose";
import { FOCOS } from "@/types";

const DistroSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    foco: { type: [String], enum: FOCOS, default: [] },
    descricao: { type: String, required: true },
    versao: { type: String, default: "" },
    downloadUrl: { type: String, required: true },
    siteUrl: { type: String, default: "" },
    iconeUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Distro || mongoose.model("Distro", DistroSchema);