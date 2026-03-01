import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { doctorService } from "./doctor.service";

const getAllDoctors = catchAsync(async (req, res) => {
  const doctors = await doctorService.getAllDoctors();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctors retrieved successfully",
    data: doctors,
  });
});

const getDoctorById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const doctor = await doctorService.getDoctorById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor retrieved successfully",
    data: doctor,
  });
});
const updateDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const doctor = await doctorService.updateDoctor(id as string, payload);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor updated successfully",
    data: doctor,
  });
});

const deleteDoctor = catchAsync(async (req, res) => {
  const { id } = req.params;
  await doctorService.deleteDoctor(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor deleted successfully",
  });
});

export const doctorController = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
