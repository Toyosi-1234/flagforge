import Account from "../models/Account.js";
import Project from "../models/Project.js";
import Environment from "../models/Environment.js";
import SDKKey from "../models/SDKKey.js";
import { createSdkSecret } from "../utils/crypto.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res) => {
  const { name } = req.body ?? {};
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "VALIDATION_ERROR", message: "Project name is required." });
  }

  const account = await Account.findById(req.user.account);
  if (!account) return res.status(404).json({ error: "ACCOUNT_NOT_FOUND", message: "Account not found." });
  const count = await Project.countDocuments({ account: account._id });
  if (count >= account.projectLimit) {
    return res.status(402).json({ error: "PROJECT_LIMIT_REACHED", message: "Your current plan's project limit has been reached." });
  }

  let project;
  let environments = [];
  const createdKeyIds = [];
  const createdKeys = [];
  try {
    project = await Project.create({ name: name.trim(), account: account._id, createdBy: req.user._id });
    environments = await Environment.create([
      { name: "dev", project: project._id },
      { name: "prod", project: project._id }
    ]);
    for (const environment of environments) {
      const generated = createSdkSecret(environment.name);
      const keyRecord = await SDKKey.create({
        environment: environment._id,
        name: `${environment.name} default key`,
        prefix: generated.prefix,
        keyHash: generated.hash
      });
      createdKeyIds.push(keyRecord._id);
      createdKeys.push({ environment: environment.name, id: keyRecord._id, key: generated.secret, note: "Shown only once. Store securely." });
    }
  } catch (error) {
    // Compensating cleanup keeps the bootstrap endpoint usable without MongoDB replica-set transactions.
    if (createdKeyIds.length) await SDKKey.deleteMany({ _id: { $in: createdKeyIds } });
    if (environments.length) await Environment.deleteMany({ _id: { $in: environments.map(e => e._id) } });
    if (project) await Project.deleteOne({ _id: project._id });
    throw error;
  }

  res.status(201).json({
    project: { id: project._id, name: project.name, createdAt: project.createdAt },
    environments: environments.map(e => ({ id: e._id, name: e.name })),
    sdkKeys: createdKeys
  });
});

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ account: req.user.account }).sort({ createdAt: -1 }).lean();
  res.json({ projects });
});
