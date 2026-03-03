import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import {
  bulkDeleteUserZodSchema,
  bulkUpdateUserStatusZodSchema,
  createAdminZodSchema,
  createDoctorZodSchema,
  updateUserRoleZodSchema,
  updateUserStatusZodSchema,
} from "./user.validation";
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

router.get("/", authGaud(Role.SUPER_ADMIN, Role.ADMIN), userController.getAllUsers);
router.post(
  "/bulk/status",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(bulkUpdateUserStatusZodSchema),
  userController.bulkUpdateUserStatus,
);
router.post(
  "/bulk/delete",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(bulkDeleteUserZodSchema),
  userController.bulkDeleteUsers,
);
router.get("/:id", authGaud(Role.SUPER_ADMIN, Role.ADMIN), userController.getUserById);
router.patch(
  "/:id/status",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(updateUserStatusZodSchema),
  userController.updateUserStatus,
);
router.patch(
  "/:id/role",
  authGaud(Role.SUPER_ADMIN),
  validateRequest(updateUserRoleZodSchema),
  userController.updateUserRole,
);
router.delete(
  "/:id",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  userController.deleteUser,
);
router.post(
  "/:id/restore",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN),
  userController.restoreUser,
);

export const userRoutes = router;
