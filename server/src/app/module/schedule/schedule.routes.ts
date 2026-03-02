import { Router } from "express";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";
import { scheduleValidation } from "./schedule.validation";
import { scheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();
router.post(
  "/",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(scheduleValidation.createScheduleZodSchema),
  scheduleController.createSchedule,
);
router.get(
  "/",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  scheduleController.getAllSchedules,
);
router.get(
  "/:id",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  scheduleController.getScheduleById,
);
router.patch(
  "/:id",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(scheduleValidation.updateScheduleZodSchema),
  scheduleController.updateSchedule,
);
router.delete(
  "/:id",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  scheduleController.deleteSchedule,
);

export const scheduleRoutes = router;
