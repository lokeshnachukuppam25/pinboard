import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:4000")
});

export const env = EnvSchema.parse(process.env);

