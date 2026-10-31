import mongoose from "mongoose";

const auditEntrySchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  environment: { type: mongoose.Schema.Types.ObjectId, ref: "Environment", required: true },
  flag: { type: mongoose.Schema.Types.ObjectId, ref: "Flag", required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["created", "updated", "rollback"], required: true },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, required: true },
  version: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("AuditEntry", auditEntrySchema);
