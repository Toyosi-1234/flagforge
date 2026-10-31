import mongoose from "mongoose";

const sdkKeySchema = new mongoose.Schema({
  environment: { type: mongoose.Schema.Types.ObjectId, ref: "Environment", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  prefix: { type: String, required: true, unique: true, index: true },
  keyHash: { type: String, required: true, select: false },
  revokedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("SDKKey", sdkKeySchema);
