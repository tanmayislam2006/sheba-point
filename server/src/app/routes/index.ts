import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { specialtyRoute } from "../module/specialty/specialty.routes";

const router=Router()

router.use('/auth',authRoutes)
router.use('/specialty',specialtyRoute)
export const IndexRoutes = router;