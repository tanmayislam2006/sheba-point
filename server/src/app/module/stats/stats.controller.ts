import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { IRequestUser } from "../admin/admin.interface";
import { statsService } from "./stats.service";

const getDashboardStatsData = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await statsService.getDashboardStatsData(user as IRequestUser);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Stats Data retrieved successfully",
    data: result,
  });
});
export const statsController = {
  getDashboardStatsData,
};
