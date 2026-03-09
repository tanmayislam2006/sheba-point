import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    JWT_ACCESS_SECRET:z.string()
  },

  client: {
    NEXT_PUBLIC_URL: z.string().url(),
  },

  runtimeEnv: {
    JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  },
});
