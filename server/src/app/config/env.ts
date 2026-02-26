import dotenv from "dotenv";
import path from "path";
import status from "http-status";
import AppError from "../shared/appError";

dotenv.config({ path: path.join(process.cwd(), ".env") });
interface EnvConfig {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}
const loadedEnvConfig = (): EnvConfig => {
  const requireEnvVariables = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
  ];
  requireEnvVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${envVar} is required but not set in .env file.`,
      );
    }
  });
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  };
};
