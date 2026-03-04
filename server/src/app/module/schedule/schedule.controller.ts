import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import sendResponse from "../../shared/sendResponse";
import catchAsync from "../../shared/asyncHandler";
import { scheduleService } from "./schedule.service";

const createSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const schedule = await scheduleService.createSchedule(payload);
  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Schedule created successfully",
    data: schedule,
  });
});

const getAllSchedules = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await scheduleService.getAllSchedules(query as IQueryParams);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Schedules retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getScheduleById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const schedule = await scheduleService.getScheduleById(id as string);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Schedule retrieved successfully",
    data: schedule,
  });
});

const updateSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedSchedule = await scheduleService.updateSchedule(
    id as string,
    payload,
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Schedule updated successfully",
    data: updatedSchedule,
  });
});

const deleteSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  await scheduleService.deleteSchedule(id as string);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Schedule deleted successfully",
  });
});

export const scheduleController = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
