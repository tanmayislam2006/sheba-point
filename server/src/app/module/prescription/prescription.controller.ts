import httpStatus from "http-status";
import { prescriptionService } from "./prescription.service";
import catchAsync from "../../shared/asyncHandler";
import { IRequestUser } from "../admin/admin.interface";
import sendResponse from "../../shared/sendResponse";

const givePrescription = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user as IRequestUser;
  const result = await prescriptionService.givePrescription(user, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const myPrescriptions = catchAsync(async (req, res) => {
  const user = req.user as IRequestUser;
  const result = await prescriptionService.myPrescriptions(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription fetched successfully",
    data: result,
  });
});

const getAllPrescriptions = catchAsync(async (req, res) => {
  const result = await prescriptionService.getAllPrescriptions();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescriptions retrieved successfully",
    data: result,
  });
});

const updatePrescription = catchAsync(async (req, res) => {
  const user = req.user as IRequestUser;
  const prescriptionId = req.params.id;
  const payload = req.body;
  const result = await prescriptionService.updatePrescription(
    user,
    prescriptionId as string,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription updated successfully",
    data: result,
  });
});

const deletePrescription = catchAsync(async (req, res) => {
  const user = req.user as IRequestUser;
  const prescriptionId = req.params.id;
  await prescriptionService.deletePrescription(user, prescriptionId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription deleted successfully",
  });
});

export const prescriptionController = {
  givePrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
