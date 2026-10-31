import crypto from "node:crypto";

export function createSdkSecret(environment) {
  const secret = `ff_${environment}_${crypto.randomBytes(32).toString("hex")}`;
  return {
    secret,
    prefix: secret.slice(0, 18),
    hash: crypto.createHash("sha256").update(secret).digest("hex")
  };
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
