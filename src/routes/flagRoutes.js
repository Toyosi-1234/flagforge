import { Router } from "express";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js";

import {
    createFlag,
    listFlags,
    getFlag,
    updateFlag,
    deleteFlag
} from "../controllers/flagController.js";

const router = Router({ mergeParams: true });

// All flag management routes require an admin JWT.
router.use(authenticateAdmin);

router.post(
    "/:projectId/environments/:environmentId/flags",
    createFlag
);

router.get(
    "/:projectId/environments/:environmentId/flags",
    listFlags
);

router.get(
    "/:projectId/environments/:environmentId/flags/:flagId",
    getFlag
);

router.patch(
    "/:projectId/environments/:environmentId/flags/:flagId",
    updateFlag
);

router.delete(
    "/:projectId/environments/:environmentId/flags/:flagId",
    deleteFlag
);

export default router;
