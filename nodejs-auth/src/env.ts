import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  JWT_SECRET: z.string(),
});

function parseSchema() {
  const parsedEnvSchema = envSchema.safeParse({
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!parsedEnvSchema.success) {
    throw new Error("Missing ENV variables");
  }

  return parsedEnvSchema.data;
}

export const env = parseSchema();
