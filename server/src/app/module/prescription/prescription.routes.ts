import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { authGaud } from "../../middleware/authGaud";
import { validateRequest } from "../../middleware/validateRequest";
import { prescriptionController } from "./prescription.controller";
import { prescriptionValidation } from "./prescription.validation";
const router = express.Router();

router.get(
  "/",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  prescriptionController.getAllPrescriptions,
);

router.get(
  "/my-prescriptions",
  authGaud(Role.PATIENT, Role.DOCTOR),
  prescriptionController.myPrescriptions,
);

router.post(
  "/",
  authGaud(Role.DOCTOR),
  validateRequest(prescriptionValidation.createPrescriptionZodSchema),
  prescriptionController.givePrescription,
);

router.patch(
  "/:id",
  authGaud(Role.DOCTOR),
  validateRequest(prescriptionValidation.updatePrescriptionZodSchema),
  prescriptionController.updatePrescription,
);

router.delete(
  "/:id",
  authGaud(Role.DOCTOR),
  prescriptionController.deletePrescription,
);

export const prescriptionRoutes = router;
