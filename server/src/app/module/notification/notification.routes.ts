import { Router } from "express";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";
import { notificationController } from "./notification.controller";

const router = Router();

router.get(
  "/my-notifications",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  notificationController.getMyNotifications,
);

router.patch(
  "/read/:id",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  notificationController.markAsRead,
);

router.patch(
  "/read-all",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  notificationController.markAllAsRead,
);

export const notificationRoutes = router;
