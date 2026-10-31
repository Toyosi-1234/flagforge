import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["free", "pro"], default: "free" },
  proExpiresAt: { type: Date, default: null },
  billingPeriodStart: { type: Date, default: Date.now },
  billingPeriodEnd: { type: Date, default: () => new Date(Date.now() + 30 * 86400000) },
  monthlyEvaluationLimit: { type: Number, default: 1000000, min: 0 },
  projectLimit: { type: Number, default: 1, min: 1 }
}, { timestamps: true });

export default mongoose.model("Account", accountSchema);
