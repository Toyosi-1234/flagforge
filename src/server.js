

import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { connectRedis, closeRedis } from "./config/redis.js";

let server;

async function startServer() {
  try {
    // MongoDB is required for initial application startup.
    await connectDB();

    // Redis is optional during startup.
    await connectRedis();

    server = app.listen(env.port, () => {
      console.log(`FlagForge API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await closeRedis();

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
