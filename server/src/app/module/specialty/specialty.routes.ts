import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { authGaud } from "../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post(
  "/create-specialty",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  specialtyController.createSpecialty,
);
router.get("/get-all-specialties", specialtyController.getAllSpecialties);
router.get("/get-specialty-by-id/:id", specialtyController.getSpecialtyById);
router.patch(
  "/update-specialty/:id",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  specialtyController.updateSpecialty,
);
router.delete(
  "/delete-specialty/:id",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  specialtyController.deleteSpecialty,
);
export const specialtyRoute = router;
