import { Router } from "express";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateDoctorZodSchema } from "./doctor.validation";

const router = Router();
router.get(
  "/",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  doctorController.getAllDoctors,
);
router.get(
  "/:id",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  doctorController.getDoctorById,
);
router.patch(
  "/:id",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateDoctorZodSchema),
  doctorController.updateDoctor,
);
router.delete(
  "/:id",
  authGaud(Role.ADMIN, Role.SUPER_ADMIN),
  doctorController.deleteDoctor,
);

export const doctorRoutes = router;
