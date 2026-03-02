import { ErrorRequestHandler } from "express";
import ApiError from "./appError";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { envVars } from "../config/env";
import z from "zod";
import { handleZodError } from "./handleZodError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

const globalErrorHandler: ErrorRequestHandler = async (
  error,
  req,
  res,
  next,
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorMessage: TErrorSources[] = [];
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
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessage = [
      {
        path: "",
        message: error.message,
      },
    ];
  } else if (error instanceof z.ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessage = simplifiedError.errorSources;
  } else if (error instanceof Error) {
    message = error.message;
    errorMessage = [
      {
        path: "",
        message: error.message,
      },
    ];
  }
  const errorResponse: TErrorResponse = {
    statusCode,
    success: false,
    message,
    errorSources: errorMessage,
    stack: envVars.NODE_ENV === "development" ? error.stack : undefined,
    error: envVars.NODE_ENV === "development" ? error : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
export default globalErrorHandler;
