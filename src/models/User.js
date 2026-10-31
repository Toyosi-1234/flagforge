import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["owner", "admin", "member"], default: "owner" },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
