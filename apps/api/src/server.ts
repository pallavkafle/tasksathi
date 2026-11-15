import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Finish in-flight requests, then exit. Force exit after 10 s.
function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close((err) => process.exit(err ? 1 : 0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
