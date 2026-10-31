import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

projectSchema.index({ account: 1, name: 1 }, { unique: true });
export default mongoose.model("Project", projectSchema);
