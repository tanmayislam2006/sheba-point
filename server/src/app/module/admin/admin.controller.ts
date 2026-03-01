import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../shared/appError";
import { adminService } from "./admin.service";

const getAllAdmins = catchAsync(async (req, res) => {
  const admins = await adminService.getAllAdmins();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admins retrieved successfully",
    data: admins,
  });
});

const getAdminById = catchAsync(async (req, res) => {
  const admin = await adminService.getAdminById(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin retrieved successfully",
    data: admin,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const admin = await adminService.updateAdmin(
    req.params.id as string,
    req.body,
    req.user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin updated successfully",
    data: admin,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const result = await adminService.deleteAdmin(req.params.id as string, req.user);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const adminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
