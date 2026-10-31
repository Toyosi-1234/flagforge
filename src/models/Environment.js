import mongoose from "mongoose";

const environmentSchema = new mongoose.Schema({
  name: { type: String, enum: ["dev", "prod"], required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true }
}, { timestamps: true });

environmentSchema.index({ project: 1, name: 1 }, { unique: true });
export default mongoose.model("Environment", environmentSchema);
