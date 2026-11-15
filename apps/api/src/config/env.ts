import { z } from "zod";

// Load apps/api/.env if it exists. On Render the variables come from the platform instead.
try {
  process.loadEnvFile();
} catch {
  // no .env file: fine
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  // Comma-separated list of allowed browser origins
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  APP_VERSION: z.string().default("0.0.0"),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  // Placeholders: may stay empty until Day 3 (DB) and Day 4 (JWT)
  MONGODB_URI: z.string().default(""),
  JWT_ACCESS_SECRET: z.string().default(""),
  JWT_REFRESH_SECRET: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
