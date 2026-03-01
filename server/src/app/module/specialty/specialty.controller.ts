import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { specialtyService } from "./specialty.service";

// createSpecialty
const createSpecialty = catchAsync(async (req, res) => {
  const specialty = await specialtyService.createSpecialty(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Specialty created successfully",
    data: specialty,
  });
});
// getAllSpecialties
const getAllSpecialties = catchAsync(async (req, res) => {
  const specialties = await specialtyService.getAllSpecialties();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Specialties retrieved successfully",
    data: specialties,
  });
});
// getSpecialtyById
const getSpecialtyById = catchAsync(async (req, res) => {
  const specialty = await specialtyService.getSpecialtyById(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Specialty retrieved successfully",
    data: specialty,
  });
});
// updateSpecialty
const updateSpecialty = catchAsync(async (req, res) => {
  const specialty = await specialtyService.updateSpecialty(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Specialty updated successfully",
    data: specialty,
  });
});
// deleteSpecialty
const deleteSpecialty = catchAsync(async (req, res) => {
  const specialty = await specialtyService.deleteSpecialty(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: specialty,
  });
});
export const specialtyController = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
};
