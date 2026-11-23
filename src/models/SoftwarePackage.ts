import mongoose, { Schema, type Model } from "mongoose";
import {
  INSTALL_METHODS,
  PACKS,
  type PackageTargets,
  type SoftwarePackage,
  type TargetSpec,
} from "@/types/distrohub";

const TargetSchema = new Schema<TargetSpec>(
  {
    method: {
      type: String,
      enum: INSTALL_METHODS,
      required: true,
    },
    pkg: { type: String, required: true, trim: true },
    postHook: { type: String, default: undefined },
  },
  { _id: false }
);

const TargetsSchema = new Schema<PackageTargets>(
  {
    debian: { type: TargetSchema, required: true },
    fedora: { type: TargetSchema, required: true },
    "fedora-atomic": { type: TargetSchema, required: true },
    arch: { type: TargetSchema, required: true },
  },
  { _id: false }
);

const SoftwarePackageSchema = new Schema<SoftwarePackage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    pack: { type: String, enum: PACKS, required: true },
    subcategory: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    defaultSelected: { type: Boolean, default: false },
    targets: { type: TargetsSchema, required: true },
  },
  { timestamps: true, collection: "software_packages" }
);

export type SoftwarePackageDocument = SoftwarePackage & {
  targets: PackageTargets;
  pack: (typeof PACKS)[number];
};

const SoftwarePackageModel: Model<SoftwarePackage> =
  (mongoose.models.SoftwarePackage as Model<SoftwarePackage> | undefined) ??
  mongoose.model<SoftwarePackage>("SoftwarePackage", SoftwarePackageSchema);

export default SoftwarePackageModel;
