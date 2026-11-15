import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { corsOrigins, env } from "./config/env";
import { logger } from "./logger";
import { AppError } from "./errors/AppError";
import { errorHandler, notFoundHandler } from "./errors/handler";
import { healthRouter } from "./routes/health";

// Builds the app without listening, so tests can import it later.
export function createApp() {
  const app = express();

  // Render sits behind one proxy: needed for correct client IPs in rate limiting
  app.set("trust proxy", 1);

  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(
    cors({
      // No Origin header (curl, server to server) is allowed. Browsers must be on the allowlist.
      origin: (origin, callback) => callback(null, !origin || corsOrigins.includes(origin)),
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  // Mounted BEFORE the rate limiter so uptime monitors never get 429
  app.use(healthRouter);

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      handler: (_req, _res, next) =>
        next(new AppError("RATE_LIMITED", "Too many requests, try again later")),
    }),
  );

  // Feature routes (auth, workspaces, tasks) get mounted here in later steps

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
