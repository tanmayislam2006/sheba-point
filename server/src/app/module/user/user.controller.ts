import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
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
export const userController = {
  createDoctor,
};
