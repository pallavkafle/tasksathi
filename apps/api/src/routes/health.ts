import { Router } from "express";
import type { HealthResponse } from "@tasksathi/shared";
import { env } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const body: HealthResponse = {
    status: "ok",
    uptime: Math.round(process.uptime()),
    version: env.APP_VERSION,
  };
  res.json(body);
});
