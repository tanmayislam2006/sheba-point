import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { authService } from "./auth.service";
import httpStatus from "http-status";

const registerPatient = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.registerPatient(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Patient registered successfully",
    data: result,
  });
});
const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient logged in successfully",
    data: result,
  });
});

export const authController = {
  registerPatient,
  loginUser,
};
