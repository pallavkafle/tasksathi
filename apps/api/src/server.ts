import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./logger";
import { connectDb, disconnectDb } from "./db/connect";

async function main(): Promise<void> {
  await connectDb();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Finish in-flight requests, close the DB, then exit. Force exit after 10 s.
  function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down`);
    server.close(async (err) => {
      try {
        await disconnectDb();
      } catch {
        // ignore disconnect errors on shutdown
      }
      process.exit(err ? 1 : 0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error({ err }, "Fatal error during startup");
  process.exit(1);
});
