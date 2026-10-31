import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const header = req.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "ADMIN_AUTH_REQUIRED", message: "Use an admin JWT bearer token." });
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.jwtSecret, { issuer: "flagforge-api", audience: "flagforge-admin" });
  } catch {
    return res.status(401).json({ error: "INVALID_ADMIN_TOKEN", message: "The admin token is invalid or expired." });
  }
  if (payload.type !== "admin") {
    return res.status(403).json({ error: "WRONG_CREDENTIAL_TYPE", message: "An SDK key cannot be used for admin actions." });
  }

  const user = await User.findById(payload.sub).select("name email role account");
  if (!user) return res.status(401).json({ error: "USER_NOT_FOUND", message: "The account user no longer exists." });
  req.user = user;
  next();
});
