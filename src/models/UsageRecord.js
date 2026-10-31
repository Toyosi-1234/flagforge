import mongoose from "mongoose";

const usageRecordSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  evaluations: { type: Number, default: 0, min: 0 },
  source: { type: String, enum: ["redis_flush", "reconciliation"], default: "redis_flush" }
}, { timestamps: true });

usageRecordSchema.index({ account: 1, periodStart: 1, periodEnd: 1 });
export default mongoose.model("UsageRecord", usageRecordSchema);
