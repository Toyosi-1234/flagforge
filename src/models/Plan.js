import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  key: { type: String, enum: ["free", "pro"], required: true, unique: true },
  name: { type: String, required: true },
  priceKobo: { type: Number, required: true, min: 0 },
  projectLimit: { type: Number, required: true },
  monthlyEvaluationLimit: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Plan", planSchema);
