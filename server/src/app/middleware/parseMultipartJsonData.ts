import status from "http-status";
import { NextFunction, Request, Response } from "express";
import AppError from "../shared/appError";

export const parseMultipartJsonData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (typeof req.body?.data !== "string") {
    return next();
  }

  try {
    const parsedData = JSON.parse(req.body.data) as Record<string, unknown>;

    req.body = {
      ...req.body,
      ...parsedData,
    };

    delete req.body.data;
    return next();
  } catch {
    return next(
      new AppError(status.BAD_REQUEST, "Invalid JSON format in form-data field `data`"),
    );
  }
};
