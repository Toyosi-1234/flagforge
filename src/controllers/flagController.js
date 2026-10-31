import Flag from "../models/Flag.js";
import Project from "../models/Project.js";
import Environment from "../models/Environment.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedFields = [
    "key",
    "type",
    "enabled",
    "defaultValue",
    "rules",
    "rolloutPercentage",
    "rolloutValue"
];

const validTypes = ["boolean", "string", "number"];

function valueMatchesType(value, type) {
    if (type === "boolean") return typeof value === "boolean";
    if (type === "string") return typeof value === "string";
    if (type === "number") {
        return typeof value === "number" && Number.isFinite(value);
    }
    return false;
}

function validateFlagData(data) {
    if (!validTypes.includes(data.type)) {
        return "type must be boolean, string, or number.";
    }

    if (
        typeof data.key !== "string" ||
        !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(data.key)
    ) {
        return "key must be 1-100 characters and contain only letters, numbers, dots, underscores, or hyphens.";
    }

    if (!valueMatchesType(data.defaultValue, data.type)) {
        return "defaultValue must match the flag type.";
    }

    if (typeof data.enabled !== "boolean") {
        return "enabled must be a boolean.";
    }

    if (
        !Number.isFinite(data.rolloutPercentage) ||
        data.rolloutPercentage < 0 ||
        data.rolloutPercentage > 100
    ) {
        return "rolloutPercentage must be between 0 and 100.";
    }

    if (
        data.rolloutValue !== null &&
        data.rolloutValue !== undefined &&
        !valueMatchesType(data.rolloutValue, data.type)
    ) {
        return "rolloutValue must match the flag type.";
    }

    if (!Array.isArray(data.rules)) {
        return "rules must be an array.";
    }

    const operators = [
        "equals",
        "not_equals",
        "in",
        "greater_than",
        "less_than"
    ];

    for (const rule of data.rules) {
        if (
            !rule ||
            typeof rule.attribute !== "string" ||
            !rule.attribute.trim()
        ) {
            return "Every rule must have a non-empty attribute.";
        }

        if (!operators.includes(rule.operator)) {
            return "A rule contains an unsupported operator.";
        }

        if (!Object.hasOwn(rule, "comparisonValue")) {
            return "Every rule must have a comparisonValue.";
        }

        if (!valueMatchesType(rule.serveValue, data.type)) {
            return "Each rule's serveValue must match the flag type.";
        }

        if (
            rule.operator === "in" &&
            !Array.isArray(rule.comparisonValue)
        ) {
            return "The comparisonValue for the in operator must be an array.";
        }
    }

    return null;
}

function rejectUnknownFields(body) {
    return Object.keys(body).find(
        (key) => !allowedFields.includes(key)
    );
}

const getEnvironmentScope = async (req, res) => {
    const project = await Project.findOne({
        _id: req.params.projectId,
        account: req.user.account
    });

    if (!project) {
        res.status(404).json({
            error: "PROJECT_NOT_FOUND",
            message: "Project not found."
        });
        return null;
    }

    const environment = await Environment.findOne({
        _id: req.params.environmentId,
        project: project._id
    });

    if (!environment) {
        res.status(404).json({
            error: "ENVIRONMENT_NOT_FOUND",
            message: "Environment not found in this project."
        });
        return null;
    }

    return environment;
};

export const createFlag = asyncHandler(async (req, res) => {
    const environment = await getEnvironmentScope(req, res);
    if (!environment) return;

    const body = req.body ?? {};
    const unknown = rejectUnknownFields(body);

    if (unknown) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: `Unsupported field: ${unknown}`
        });
    }

    const required = ["key", "type", "defaultValue"];
    const missing = required.find(
        (field) => !Object.hasOwn(body, field)
    );

    if (missing) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: `${missing} is required.`
        });
    }

    const data = {
        key: body.key,
        type: body.type,
        enabled: body.enabled ?? false,
        defaultValue: body.defaultValue,
        rules: body.rules ?? [],
        rolloutPercentage: body.rolloutPercentage ?? 0,
        rolloutValue: body.rolloutValue ?? null
    };

    const validationError = validateFlagData(data);

    if (validationError) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: validationError
        });
    }

    const flag = await Flag.create({
        ...data,
        environment: environment._id
    });

    return res.status(201).json({ flag });
});

// GET: List flags in this environment.
export const listFlags = asyncHandler(async (req, res) => {
    const environment = await getEnvironmentScope(req, res);
    if (!environment) return;

    const flags = await Flag.find({
        environment: environment._id
    })
        .sort({ key: 1 })
        .lean();

    res.json({ flags });
});

export const getFlag = asyncHandler(async (req, res) => {
    const environment = await getEnvironmentScope(req, res);
    if (!environment) return;

    const flag = await Flag.findOne({
        _id: req.params.flagId,
        environment: environment._id
    }).lean();

    if (!flag) {
        return res.status(404).json({
            error: "FLAG_NOT_FOUND",
            message: "Flag not found in this environment."
        });
    }

    res.json({ flag });
});

export const updateFlag = asyncHandler(async (req, res) => {
    const environment = await getEnvironmentScope(req, res);
    if (!environment) return;

    const body = req.body ?? {};
    const unknown = rejectUnknownFields(body);

    if (unknown) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: `Unsupported field: ${unknown}`
        });
    }

    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "Provide at least one field to update."
        });
    }

    const flag = await Flag.findOne({
        _id: req.params.flagId,
        environment: environment._id
    });

    if (!flag) {
        return res.status(404).json({
            error: "FLAG_NOT_FOUND",
            message: "Flag not found in this environment."
        });
    }

    const merged = {
        key: flag.key,
        type: flag.type,
        enabled: flag.enabled,
        defaultValue: flag.defaultValue,
        rules: flag.rules.map((rule) => rule.toObject()),
        rolloutPercentage: flag.rolloutPercentage,
        rolloutValue: flag.rolloutValue,
        ...body
    };

    const validationError = validateFlagData(merged);

    if (validationError) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: validationError
        });
    }

    flag.set(body);
    flag.version += 1;

    await flag.save();

    res.json({ flag });
});

export const deleteFlag = asyncHandler(async (req, res) => {
    const environment = await getEnvironmentScope(req, res);
    if (!environment) return;

    const flag = await Flag.findOneAndDelete({
        _id: req.params.flagId,
        environment: environment._id
    });

    if (!flag) {
        return res.status(404).json({
            error: "FLAG_NOT_FOUND",
            message: "Flag not found in this environment."
        });
    }

    res.status(204).end();
});
