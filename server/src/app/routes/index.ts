import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { specialtyRoute } from "../module/specialty/specialty.routes";
import { userRoutes } from "../module/user/user.routes";

const router=Router()

router.use('/auth',authRoutes)
router.use('/specialty',specialtyRoute)
router.use('/user',userRoutes)
export const IndexRoutes = router;