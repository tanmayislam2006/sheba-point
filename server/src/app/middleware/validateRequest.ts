import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationResult = zodSchema.safeParse(req.body);
    if (!validationResult.success) {
      return next(validationResult.error);
    }
    //sanitizing the data
    req.body = validationResult.data;
    return next();
  };
};
