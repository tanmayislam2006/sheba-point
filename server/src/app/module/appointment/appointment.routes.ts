import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { appointmentValidation } from "./appointment.validation";

const router = Router();

router.post(
  "/book",
  authGaud(Role.PATIENT),
  validateRequest(appointmentValidation.bookAppointmentZodSchema),
  appointmentController.bookAppointment,
);

router.post(
  "/book-pay-later",
  authGaud(Role.PATIENT),
  validateRequest(appointmentValidation.bookAppointmentZodSchema),
  appointmentController.bookAppointmentWithPayLater,
);

router.get(
  "/my-appointments",
  authGaud(Role.PATIENT, Role.DOCTOR),
  appointmentController.getMyAppointments,
);

router.get(
  "/my-appointments/:id",
  authGaud(Role.PATIENT, Role.DOCTOR),
  appointmentController.getMySingleAppointment,
);

router.get(
  "/",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  appointmentController.getAllAppointments,
);

router.patch(
  "/:id/status",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT),
  validateRequest(appointmentValidation.changeAppointmentStatusZodSchema),
  appointmentController.changeAppointmentStatus,
);

router.post(
  "/:id/initiate-payment",
  authGaud(Role.PATIENT),
  appointmentController.initiatePayment,
);

export const appointmentRoutes = router;
