import { Router } from "express";
import { statsController } from "./stats.controller";
import { authGaud } from "./../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.get(
  "/",
  authGaud(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  statsController.getDashboardStatsData,
);
export const statsRoutes = router;
