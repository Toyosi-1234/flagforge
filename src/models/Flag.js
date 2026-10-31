import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  attribute: { type: String, required: true },
  operator: { type: String, enum: ["equals", "not_equals", "in", "greater_than", "less_than"], required: true },
  comparisonValue: { type: mongoose.Schema.Types.Mixed, required: true },
  serveValue: { type: mongoose.Schema.Types.Mixed, required: true }
}, { _id: true });

const flagSchema = new mongoose.Schema({
  environment: { type: mongoose.Schema.Types.ObjectId, ref: "Environment", required: true, index: true },
  key: { type: String, required: true, trim: true, match: /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/ },
  type: { type: String, enum: ["boolean", "string", "number"], required: true },
  enabled: { type: Boolean, default: false },
  defaultValue: { type: mongoose.Schema.Types.Mixed, required: true },
  rules: { type: [ruleSchema], default: [] },
  rolloutPercentage: { type: Number, min: 0, max: 100, default: 0 },
  rolloutValue: { type: mongoose.Schema.Types.Mixed, default: null },
  version: { type: Number, default: 1, min: 1 }
}, { timestamps: true });

flagSchema.index({ environment: 1, key: 1 }, { unique: true });
export default mongoose.model("Flag", flagSchema);
