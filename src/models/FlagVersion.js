import mongoose from "mongoose";

const flagVersionSchema = new mongoose.Schema({
  flag: { type: mongoose.Schema.Types.ObjectId, ref: "Flag", required: true, index: true },
  version: { type: Number, required: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  changeNote: { type: String, maxlength: 500, default: "" }
}, { timestamps: true });

flagVersionSchema.index({ flag: 1, version: 1 }, { unique: true });
export default mongoose.model("FlagVersion", flagVersionSchema);
