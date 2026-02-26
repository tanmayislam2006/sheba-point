import { ErrorRequestHandler } from "express";
import ApiError from "./apiError";

type IGenericErrorMessages = {
  path: string | number;
  message: string;
};
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorMessage: IGenericErrorMessages[] = [];
  
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessage = [
      {
        path: "",
        message: error.message,
      },
    ];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessage = [
      {
        path: "",
        message: error.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessage,
  });
};
