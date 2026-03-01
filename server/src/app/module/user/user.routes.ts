import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.validation";

const router = Router();
router.post(
  "/create-doctor",
  validateRequest(createDoctorZodSchema),
  userController.createDoctor,
);
router.post(
  "/create-admin",
  validateRequest(createAdminZodSchema),
  userController.createAdmin,
);
export const userRoutes = router;
