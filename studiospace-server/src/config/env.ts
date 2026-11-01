import "dotenv/config";

/** Centralised, validated environment configuration. */
function required(name: string, fallbackInDev?: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (fallbackInDev !== undefined && process.env.NODE_ENV !== "production") {
    return fallbackInDev;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required("MONGODB_URI", "").replace(/<([^>]+)>/g, "$1"),
  dbName: process.env.DB_NAME ?? "studiospace",
  jwtSecret: required("JWT_SECRET", "studiospace-dev-jwt-secret-key-change-in-prod"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientOrigins: (process.env.CLIENT_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};
