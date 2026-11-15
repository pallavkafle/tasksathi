import { pino } from "pino";
import { env } from "./config/env";

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : env.NODE_ENV === "production" ? "info" : "debug",
  // Never log credentials
  redact: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
});
