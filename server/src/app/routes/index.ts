import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { specialtyRoute } from "../module/specialty/specialty.routes";
import { userRoutes } from "../module/user/user.routes";
import { doctorRoutes } from "../module/doctor/doctor.routes";

const router=Router()

router.use('/auth',authRoutes)
router.use('/specialty',specialtyRoute)
router.use('/user',userRoutes)
router.use('/doctor',doctorRoutes)

export const IndexRoutes = router;