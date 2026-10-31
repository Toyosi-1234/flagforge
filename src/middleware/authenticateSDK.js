import SDKKey from "../models/SDKKey.js";
import Environment from "../models/Environment.js";
import Project from "../models/Project.js";
import { sha256 } from "../utils/crypto.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticateSDK = asyncHandler(async (req, res, next) => {
  const key = req.get("x-flagforge-sdk-key");
  if (!key || !/^ff_(dev|prod)_[a-f0-9]{64}$/.test(key)) {
    return res.status(401).json({ error: "SDK_KEY_REQUIRED", message: "Provide a valid SDK key in x-flagforge-sdk-key." });
  }

  const prefix = key.slice(0, 18);
  const record = await SDKKey.findOne({ prefix, revokedAt: null }).select("+keyHash");
  if (!record || record.keyHash !== sha256(key)) {
    return res.status(401).json({ error: "INVALID_SDK_KEY", message: "The SDK key is invalid or revoked." });
  }

  const environment = await Environment.findById(record.environment);
  if (!environment) return res.status(401).json({ error: "ENVIRONMENT_NOT_FOUND", message: "SDK environment no longer exists." });
  const project = await Project.findById(environment.project);
  if (!project) return res.status(401).json({ error: "PROJECT_NOT_FOUND", message: "SDK project no longer exists." });

  req.sdk = { keyId: record._id, environment, project, accountId: project.account };
  next();
});
