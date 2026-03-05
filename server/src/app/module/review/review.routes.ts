import express from "express";
import { Role } from "../../../generated/prisma/enums";

import { validateRequest } from "../../middleware/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";
import { authGaud } from "../../middleware/authGaud";

const router = express.Router();

router.get("/", reviewController.getAllReviews);

router.post(
  "/",
  authGaud(Role.PATIENT),
  validateRequest(reviewValidation.createReviewZodSchema),
  reviewController.giveReview,
);

router.get(
  "/my-reviews",
  authGaud(Role.PATIENT, Role.DOCTOR),
  reviewController.myReviews,
);

router.patch(
  "/:id",
  authGaud(Role.PATIENT),
  validateRequest(reviewValidation.updateReviewZodSchema),
  reviewController.updateReview,
);

router.delete("/:id", authGaud(Role.PATIENT), reviewController.deleteReview);

export const reviewRoutes = router;
