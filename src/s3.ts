import { S3Client } from "bun";

// Load env vars manually for simplicity in this demo
const env = await Bun.file(".env").text();
const envVars: Record<string, string> = {};
env.split("\n").forEach(line => {
  const [key, value] = line.split("=");
  if (key && value) envVars[key.trim()] = value.trim();
});

export const r2 = new S3Client({
  accessKeyId: envVars.R2_ACCESS_KEY_ID,
  secretAccessKey: envVars.R2_SECRET_ACCESS_KEY,
  bucket: envVars.R2_BUCKET,
  endpoint: envVars.R2_ENDPOINT,
});
