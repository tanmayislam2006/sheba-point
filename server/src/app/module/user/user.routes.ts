import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();
router.post(
  "/create-doctor",
  validateRequest(createDoctorZodSchema),
  userController.createDoctor,
);
export const userRoutes = router;
