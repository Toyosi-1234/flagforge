import express from "express";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import flagRoutes from "./routes/flagRoutes.js";
import sdkRoutes from "./routes/sdkRoutes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "FlagForge API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", flagRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/sdk", sdkRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Route not found.",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    error: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Something went wrong.",
  });
});

export { app };
