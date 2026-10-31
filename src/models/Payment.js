import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  transactionRef: { type: String, required: true, unique: true },
  amountKobo: { type: Number, required: true, min: 1 },
  currency: { type: String, default: "NGN" },
  status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
  provider: { type: String, enum: ["squad"], default: "squad" },
  paidAt: { type: Date, default: null },
  rawVerifiedData: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
