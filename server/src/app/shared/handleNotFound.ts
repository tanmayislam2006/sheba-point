import { Request, Response } from "express";
import httpStatus from "http-status";

const handleNotFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessage: [
      {
        path: req.originalUrl,
        message: "Not Found",
      },
    ],
  });
};

export default handleNotFound;
