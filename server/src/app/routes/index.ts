import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { specialtyRoute } from "../module/specialty/specialty.routes";
import { userRoutes } from "../module/user/user.routes";
import { doctorRoutes } from "../module/doctor/doctor.routes";
import { adminRoutes } from "../module/admin/admin.routes";
import { notificationRoutes } from "../module/notification/notification.routes";
import { scheduleRoutes } from "../module/schedule/schedule.routes";
import { doctorScheduleRoute } from "../module/doctorSchedule/doctorSchedule.constant";

const router=Router()

router.use('/auth',authRoutes)
router.use('/specialty',specialtyRoute)
router.use('/user',userRoutes)
router.use('/doctor',doctorRoutes)
router.use('/admin',adminRoutes)
router.use('/notification',notificationRoutes)
router.use('/schedule',scheduleRoutes)
router.use('/doctor-schedule',doctorScheduleRoute)
export const IndexRoutes = router;
