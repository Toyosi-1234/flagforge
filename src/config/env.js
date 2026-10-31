import dotenv from "dotenv";
dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "12h",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000"
};
