import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { IRequestUser } from "../admin/admin.interface";
import { statsService } from "./stats.service";

const getDashboardStatsData = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await statsService.getDashboardStatsData(
    user as IRequestUser,
    req.query,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Stats Data retrieved successfully",
    data: result,
  });
});

const getDashboardKpi = catchAsync(async (req, res) => {
  const result = await statsService.getDashboardKpi(
    req.user as IRequestUser,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Dashboard KPI retrieved successfully",
    data: result,
  });
});

const getAppointmentChartData = catchAsync(async (req, res) => {
  const result = await statsService.getAppointmentChartData(
    req.user as IRequestUser,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Appointment chart data retrieved successfully",
    data: result,
  });
});

const getRevenueChartData = catchAsync(async (req, res) => {
  const result = await statsService.getRevenueChartData(
    req.user as IRequestUser,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Revenue chart data retrieved successfully",
    data: result,
  });
});

const getRecentActivities = catchAsync(async (req, res) => {
  const result = await statsService.getRecentActivities(
    req.user as IRequestUser,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Recent activities retrieved successfully",
    data: result,
  });
});

export const statsController = {
  getDashboardStatsData,
  getDashboardKpi,
  getAppointmentChartData,
  getRevenueChartData,
  getRecentActivities,
};
