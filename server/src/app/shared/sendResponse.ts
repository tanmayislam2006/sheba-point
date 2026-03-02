import { Response } from "express";

type TSendResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const sendResponse = <T>(res: Response, resData: TSendResponse<T>) => {
  return res.status(resData.statusCode).json({
    status: resData.statusCode,
    success: resData.success,
    message: resData.message,
    data: resData.data,
    meta: resData.meta,
  });
};
export default sendResponse;
