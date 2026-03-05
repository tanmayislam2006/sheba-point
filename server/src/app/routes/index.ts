import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { specialtyRoute } from "../module/specialty/specialty.routes";
import { userRoutes } from "../module/user/user.routes";
import { doctorRoutes } from "../module/doctor/doctor.routes";
import { adminRoutes } from "../module/admin/admin.routes";
import { notificationRoutes } from "../module/notification/notification.routes";
import { scheduleRoutes } from "../module/schedule/schedule.routes";
import { doctorScheduleRoute } from "../module/doctorSchedule/doctorSchedule.routes";
import { statsRoutes } from "../module/stats/stats.routes";
import { appointmentRoutes } from "../module/appointment/appointment.routes";
import { patientRoutes } from "../module/patient/patient.routes";
import { reviewRoutes } from "../module/review/review.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialty", specialtyRoute);
router.use("/user", userRoutes);
router.use("/patient", patientRoutes);
router.use("/doctor", doctorRoutes);
router.use("/admin", adminRoutes);
router.use("/notification", notificationRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/doctor-schedules", doctorScheduleRoute);
router.use("/stats", statsRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/reviews", reviewRoutes);
export const IndexRoutes = router;
