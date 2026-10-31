import crypto from "node:crypto";
import Flag from "../models/Flag.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function matchesRule(rule, context) {
    const actual = context[rule.attribute];
    const expected = rule.comparisonValue;

    switch (rule.operator) {
        case "equals":
            return actual === expected;

        case "not_equals":
            return actual !== undefined && actual !== expected;

        case "in":
            return Array.isArray(expected) && expected.includes(actual);

        case "greater_than":
            return (
                typeof actual === "number" &&
                typeof expected === "number" &&
                actual > expected
            );

        case "less_than":
            return (
                typeof actual === "number" &&
                typeof expected === "number" &&
                actual < expected
            );

        default:
            return false;
    }
}

function isInRollout(flag, userId) {
    if (!userId || flag.rolloutPercentage <= 0) return false;
    if (flag.rolloutPercentage >= 100) return true;

    // Stable assignment for the same flag and user.
    const hash = crypto
        .createHash("sha256")
        .update(`${flag._id}:${userId}`)
        .digest("hex");

    const bucket = parseInt(hash.slice(0, 8), 16) % 100;

    return bucket < flag.rolloutPercentage;
}

export const evaluateFlag = asyncHandler(async (req, res) => {
    const { key, context = {} } = req.body ?? {};

    if (typeof key !== "string" || !key.trim()) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "key is required."
        });
    }

    if (
        !context ||
        typeof context !== "object" ||
        Array.isArray(context)
    ) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "context must be an object."
        });
    }

    const flag = await Flag.findOne({
        environment: req.sdk.environment._id,
        key: key.trim()
    }).lean();

    if (!flag) {
        return res.status(404).json({
            error: "FLAG_NOT_FOUND",
            message: "No flag with that key exists in this environment."
        });
    }

    if (!flag.enabled) {
        return res.json({
            key: flag.key,
            value: flag.defaultValue,
            reason: "FLAG_DISABLED",
            version: flag.version
        });
    }

    for (const rule of flag.rules) {
        if (matchesRule(rule, context)) {
            return res.json({
                key: flag.key,
                value: rule.serveValue,
                reason: "RULE_MATCH",
                version: flag.version
            });
        }
    }

    if (
        flag.rolloutPercentage > 0 &&
        flag.rolloutValue !== null &&
        isInRollout(flag, context.userId)
    ) {
        return res.json({
            key: flag.key,
            value: flag.rolloutValue,
            reason: "PERCENTAGE_ROLLOUT",
            version: flag.version
        });
    }

    return res.json({
        key: flag.key,
        value: flag.defaultValue,
        reason: "DEFAULT",
        version: flag.version
    });
});
