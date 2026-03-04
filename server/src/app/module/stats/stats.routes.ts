import { Router } from "express";
import { statsController } from "./stats.controller";
import { authGaud } from "./../../middleware/authGaud";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

const roles = [Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT];

router.get(
  "/",
  authGaud(...roles),
  statsController.getDashboardStatsData,
);
router.get("/kpi", authGaud(...roles), statsController.getDashboardKpi);
router.get(
  "/charts/appointments",
  authGaud(...roles),
  statsController.getAppointmentChartData,
);
router.get(
  "/charts/revenue",
  authGaud(...roles),
  statsController.getRevenueChartData,
);
router.get(
  "/recent-activities",
  authGaud(...roles),
  statsController.getRecentActivities,
);
export const statsRoutes = router;
