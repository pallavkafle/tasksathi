import { z } from "zod";

// Trimmed and lowercased before validation so "A@B.com " and "a@b.com" are the same user.
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const nameSchema = z.string().trim().min(1, "Name is required").max(80);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Login does not enforce password rules, only that something was sent.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// The only user fields the API ever returns (never _id, passwordHash, refreshTokens).
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
export type User = z.infer<typeof userSchema>;

// Response of register, login and refresh. The refresh token is a cookie, never in the body.
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

// Response of GET /auth/me.
export const meResponseSchema = z.object({ user: userSchema });
export type MeResponse = z.infer<typeof meResponseSchema>;

// Response of GET /health.
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  uptime: z.number(),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
