import mongoose from "mongoose";
import { env } from "../config/env";

export async function connectDb(): Promise<void> {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment");
  }

  mongoose.set("sanitizeFilter", true);

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
