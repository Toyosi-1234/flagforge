import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema({
  provider: { type: String, enum: ["squad"], default: "squad" },
  transactionRef: { type: String, required: true },
  eventType: { type: String, required: true },
  bodyHash: { type: String, required: true },
  processedAt: { type: Date, default: null },
  status: { type: String, enum: ["received", "processed", "rejected"], default: "received" }
}, { timestamps: true });

webhookEventSchema.index({ provider: 1, transactionRef: 1, eventType: 1 }, { unique: true });
export default mongoose.model("WebhookEvent", webhookEventSchema);
