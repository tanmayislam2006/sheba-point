import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { IRequestUser } from "../admin/admin.interface";
import { doctorScheduleService } from "./doctorSchedule.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createMyDoctorSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user as IRequestUser;
  const result = await doctorScheduleService.createMyDoctorSchedule(
    user,
    payload,
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Doctor schedule created successfully",
    data: result,
  });
});

const getMyDoctorSchedules = catchAsync(async (req, res) => {
  const query = req.query;
  const user = req.user as IRequestUser;
  const result = await doctorScheduleService.getMyDoctorSchedules(user, query as IQueryParams);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Doctor schedules retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
const getAllDoctorSchedules = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await doctorScheduleService.getAllDoctorSchedules(query as IQueryParams);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Doctor schedules retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
const getDoctorScheduleById = catchAsync(async (req, res) => {
  const { doctorId, scheduleId } = req.params;
  const result = await doctorScheduleService.getDoctorScheduleById(
    doctorId as string,
    scheduleId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Doctor schedule retrieved successfully",
    data: result,
  });
});
const updateMyDoctorSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user as IRequestUser;
  const result = await doctorScheduleService.updateMyDoctorSchedule(
    user,
    payload,
  );
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Doctor schedule updated successfully",
    data: result,
  });
});
const deleteMyDoctorSchedule = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };
  const user = req.user as IRequestUser;
  await doctorScheduleService.deleteMyDoctorSchedule(id, user);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Doctor schedule deleted successfully",
  });
});
export const doctorScheduleController = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
