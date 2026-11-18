import mongoose, { Schema } from "mongoose";
import { FOCOS } from "@/types";

const ScriptSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, default: "" },
    distro: { type: Schema.Types.ObjectId, ref: "Distro", required: true },
    foco: { type: String, enum: FOCOS, required: true },
    scriptUrl: { type: String, required: true },
    comando: { type: String, default: "" },
    autor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pendente", "aprovado", "rejeitado"],
      default: "pendente",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Script || mongoose.model("Script", ScriptSchema);