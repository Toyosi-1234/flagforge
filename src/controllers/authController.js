import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Account from "../models/Account.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function issueToken(user) {
  return jwt.sign(
    { type: "admin", role: user.role, accountId: String(user.account) },
    env.jwtSecret,
    { subject: String(user._id), expiresIn: env.jwtExpiresIn, issuer: "flagforge-api", audience: "flagforge-admin" }
  );
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, accountName } = req.body ?? {};
  if (!name || !email || !password || !accountName) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "name, email, password, and accountName are required." });
  }
  if (typeof password !== "string" || password.length < 12) {
    return res.status(400).json({ error: "WEAK_PASSWORD", message: "Password must be at least 12 characters." });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL", message: "Provide a valid email address." });
  }
  if (await User.exists({ email: email.toLowerCase().trim() })) {
    return res.status(409).json({ error: "EMAIL_IN_USE", message: "An account already exists for this email." });
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  // Registration is a bootstrap endpoint for local development. Before production,
  // add email verification and restrict account creation/invitations.
  const user = await User.create({ name, email, passwordHash, role: "owner", account: new mongoose.Types.ObjectId() });
  try {
    const account = await Account.create({ name: accountName, owner: user._id });
    user.account = account._id;
    await user.save();
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      account: { id: account._id, name: account.name, plan: account.plan },
      token: issueToken(user)
    });
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "VALIDATION_ERROR", message: "email and password are required." });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Email or password is incorrect." });
  }

  return res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role, accountId: user.account },
    token: issueToken(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, accountId: req.user.account } });
});
