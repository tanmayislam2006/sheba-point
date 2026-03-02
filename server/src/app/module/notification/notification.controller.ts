import status from "http-status";
import catchAsync from "../../shared/asyncHandler";
import sendResponse from "../../shared/sendResponse";
import { notificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req, res) => {
  const userId = req.user?.userId as string;
  const result = await notificationService.getMyNotifications(
    userId,
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user?.userId as string;
  const { id } = req.params;
  const result = await notificationService.markAsRead(userId, id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user?.userId as string;
  const result = await notificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
});

export const notificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
