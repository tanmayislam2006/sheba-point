import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { appointmentService } from "./appointment.service";
import { IRequestUser } from "../admin/admin.interface";
import { AppointmentStatus } from "../../../generated/prisma/enums";

const bookAppointment = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user as IRequestUser;
  const result = await appointmentService.bookAppointment(payload, user);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Appointment booked successfully",
    data: result,
  });
});

const bookAppointmentWithPayLater = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user as IRequestUser;
  const result = await appointmentService.bookAppointmentWithPayLater(
    payload,
    user,
  );

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Appointment booked successfully",
    data: result,
  });
});

const getMyAppointments = catchAsync(async (req, res) => {
  const user = req.user as IRequestUser;
  const result = await appointmentService.getMyAppointments(user);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const getMySingleAppointment = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };
  const user = req.user as IRequestUser;
  const result = await appointmentService.getMySingleAppointment(id, user);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Appointment retrieved successfully",
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req, res) => {
  const result = await appointmentService.getAllAppointments();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const changeAppointmentStatus = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };
  const { status: appointmentStatus } = req.body as {
    status: AppointmentStatus;
  };
  const user = req.user as IRequestUser;

  const result = await appointmentService.changeAppointmentStatus(
    id,
    appointmentStatus,
    user,
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Appointment status updated successfully",
    data: result,
  });
});

const initiatePayment = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };
  const user = req.user as IRequestUser;
  const result = await appointmentService.initiatePayment(id, user);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Payment initiated successfully",
    data: result,
  });
});

export const appointmentController = {
  bookAppointment,
  bookAppointmentWithPayLater,
  getMyAppointments,
  getMySingleAppointment,
  getAllAppointments,
  changeAppointmentStatus,
  initiatePayment,
};
