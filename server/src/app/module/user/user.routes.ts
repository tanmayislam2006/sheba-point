import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.validation";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post(
  "/create-doctor",
  validateRequest(createDoctorZodSchema),
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  userController.createDoctor,
);
router.post(
  "/create-admin",
  validateRequest(createAdminZodSchema),
  authGaud(Role.SUPER_ADMIN),
  userController.createAdmin,
);
export const userRoutes = router;
