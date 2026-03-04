import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { IRequestUser } from "../admin/admin.interface";
import { IUserListQuery } from "./user.interface";
import { userService } from "./user.service";

const createDoctor = catchAsync(async (req, res) => {
  const payload = req.body;
  const doctor = await userService.createDoctor(payload);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Doctor created successfully",
    data: doctor,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const payload = req.body;
  const admin = await userService.createAdmin(payload);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Admin created successfully",
    data: admin,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(
    req.query as IUserListQuery,
    req.user as IRequestUser,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(
    req.params.id as string,
    req.user as IRequestUser,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const user = await userService.updateUserStatus(
    req.params.id as string,
    req.body,
    req.user as IRequestUser,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User status updated successfully",
    data: user,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const user = await userService.updateUserRole(
    req.params.id as string,
    req.body,
    req.user as IRequestUser,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User role updated successfully",
    data: user,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id as string, req.user as IRequestUser);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User deleted successfully",
  });
});

const restoreUser = catchAsync(async (req, res) => {
  const user = await userService.restoreUser(
    req.params.id as string,
    req.user as IRequestUser,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User restored successfully",
    data: user,
  });
});

const bulkUpdateUserStatus = catchAsync(async (req, res) => {
  const result = await userService.bulkUpdateUserStatus(
    req.body,
    req.user as IRequestUser,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User statuses updated successfully",
    data: result,
  });
});

const bulkDeleteUsers = catchAsync(async (req, res) => {
  const result = await userService.bulkDeleteUsers(
    req.body,
    req.user as IRequestUser,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users deleted successfully",
    data: result,
  });
});

export const userController = {
  createDoctor,
  createAdmin,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  restoreUser,
  bulkUpdateUserStatus,
  bulkDeleteUsers,
};
