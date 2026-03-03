import { Router } from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post(
  "/create-my-doctor-schedule",
  authGaud(Role.DOCTOR),
  doctorScheduleController.createMyDoctorSchedule,
);
router.get(
  "/my-doctor-schedules",
  authGaud(Role.DOCTOR),
  doctorScheduleController.getMyDoctorSchedules,
);
router.get(
  "/",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  doctorScheduleController.getAllDoctorSchedules,
);
router.get(
  "/:doctorId/schedule/:scheduleId",
  doctorScheduleController.getDoctorScheduleById,
);
router.patch(
  "/update-my-doctor-schedule",
  authGaud(Role.DOCTOR),
  doctorScheduleController.updateMyDoctorSchedule,
);
router.delete(
  "/delete-my-doctor-schedule/:id",
  authGaud(Role.DOCTOR),
  doctorScheduleController.deleteMyDoctorSchedule,
);

export const doctorScheduleRoute = router;
