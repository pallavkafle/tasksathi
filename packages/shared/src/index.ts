import { z } from "zod";

export const APP_NAME = "TaskSathi";

// Placeholder schema: proves api <-> shared linking works. Real auth schemas come on Day 4.
export const emailSchema = z.string().email();
