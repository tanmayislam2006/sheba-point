import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import status from "http-status";

export const handleZodError = (error: z.ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const errorMessage = "Validation Error";
  const errorSources: TErrorSources[] = [];
  error.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join("=>"),
      message: issue.message,
    });
  });
  return {
    success: false,
    statusCode,
    message: errorMessage,
    errorSources,
  };
};
