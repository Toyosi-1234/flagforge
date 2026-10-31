import { Router } from "express";
import { authenticateSDK } from "../middleware/authenticateSDK.js";
import { evaluateFlag } from "../controllers/evaluationController.js";

const router = Router();

router.get("/whoami", authenticateSDK, (req, res) => {
  res.json({
    ok: true,
    project: { id: req.sdk.project._id, name: req.sdk.project.name },
    environment: {
      id: req.sdk.environment._id,
      name: req.sdk.environment.name
    },
    permissions: ["evaluate"]
  });
});

router.post("/evaluate", authenticateSDK, evaluateFlag);

export default router;
