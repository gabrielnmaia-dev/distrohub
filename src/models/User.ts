import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    senha: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favoritos: [{ type: Schema.Types.ObjectId, ref: "Distro" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);