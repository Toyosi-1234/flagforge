
import { createClient } from "redis";

let redisClient;
let redisReady = false;

export async function connectRedis() {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",

    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          return new Error("Redis connection unavailable");
        }

        return Math.min(retries * 500, 2000);
      }
    }
  });

  redisClient.on("error", (error) => {
    redisReady = false;
    console.error("Redis error:", error.message);
  });

  redisClient.on("ready", () => {
    redisReady = true;
    console.log("Redis connected");
  });

  redisClient.on("end", () => {
    redisReady = false;
    console.log("Redis connection closed");
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    redisReady = false;
    console.error("Redis unavailable. Continuing without Redis.");
    return null;
  }
}

export function getRedisClient() {
  return redisReady && redisClient?.isReady
    ? redisClient
    : null;
}

export async function closeRedis() {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }

  redisReady = false;
  redisClient = null;
}

