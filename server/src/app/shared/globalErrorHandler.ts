import { ErrorRequestHandler } from "express";
import ApiError from "./appError";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { envVars } from "../config/env";
import z from "zod";
import { handleZodError } from "./handleZodError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { Prisma } from "../../generated/prisma/client";
import { handlePrismaClientKnownRequestError, handlePrismaClientUnknownError, handlePrismaClientValidationError, handlerPrismaClientInitializationError, handlerPrismaClientRustPanicError } from "./handlePrismaError";

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
  try {
    if (req.file) {
      await deleteFileFromCloudinary(req.file.path);
    }
    // delete multiple files if exist
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const deleteFilePromises = req.files.map((file) =>
        deleteFileFromCloudinary(file.path),
      );
      await Promise.all(deleteFilePromises);
    }
    if (req.files && !Array.isArray(req.files)) {
      const filesFromFields = Object.values(req.files).flat();
      const deleteFilePromises = filesFromFields.map((file) =>
        deleteFileFromCloudinary(file.path),
      );
      await Promise.all(deleteFilePromises);
    }
  } catch (cleanupError) {
    console.error("Cloudinary cleanup failed:", cleanupError);
  }
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

  res.status(statusCode).json(errorResponse);
};
export default globalErrorHandler;
