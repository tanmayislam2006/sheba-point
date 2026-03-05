import { z } from 'zod';

const createReviewZodSchema = z.object({
    appointmentId: z.string("Appointment ID is required").uuid("Appointment ID must be a valid UUID"),
    rating: z.number("Rating is required").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
    comment: z.string("Comment is required").min(1, "Comment cannot be empty")
});

const updateReviewZodSchema = z.object({
    rating: z.number("Rating is required").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5").optional(),
    comment: z.string("Comment is required").min(1, "Comment cannot be empty").optional()
}).refine((value) => value.rating !== undefined || value.comment !== undefined, {
    message: "At least one field (rating or comment) is required to update the review"
});

export const reviewValidation = {
    createReviewZodSchema,
    updateReviewZodSchema
};
