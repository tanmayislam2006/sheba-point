import { ErrorRequestHandler } from "express";
import ApiError from "./appError";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { envVars } from "../config/env";
import z from "zod";
import { handleZodError } from "./handleZodError";
import { Prisma } from "../../generated/prisma/client";
import { handlePrismaClientKnownRequestError, handlePrismaClientUnknownError, handlePrismaClientValidationError, handlerPrismaClientInitializationError, handlerPrismaClientRustPanicError } from "./handlePrismaError";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";

const globalErrorHandler: ErrorRequestHandler = async (
  error,
  req,
  res,
  _next,
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorSources: TErrorSources[] = [];
  let stack: string | undefined;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = error.stack;
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = error.stack;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = error.stack;
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = error.stack;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = error.stack;
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorSources = [
      {
        path: error.name || "ApiError",
        message: error.message,
      },
    ];
    stack = error.stack;
  } else if (error instanceof z.ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
    stack = error.stack;
  } else if (error instanceof Error) {
    message = error.message;
    errorSources = [
      {
        path: error.name || "Error",
        message: error.message,
      },
    ];
    stack = error.stack;
  }
  const errorResponse: TErrorResponse = {
    statusCode,
    success: false,
    message,
    errorSources,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
    error: envVars.NODE_ENV === "development" ? error : undefined,
  };

  await deleteUploadedFilesFromGlobalErrorHandler(req);
  res.status(statusCode).json(errorResponse);
};
export default globalErrorHandler;
