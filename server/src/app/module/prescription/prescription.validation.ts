import { z } from "zod";

const followUpDateSchema = z
  .coerce.date("Follow-up date must be a valid date")
  .refine((date) => !Number.isNaN(date.getTime()), {
    message: "Follow-up date must be a valid date",
  });

const createPrescriptionZodSchema = z.object({
  appointmentId: z.uuid("Appointment ID must be a valid UUID"),
  instructions: z
    .string("Instructions is required")
    .trim()
    .min(1, "Instructions cannot be empty"),
  followUpDate: followUpDateSchema,
});

const updatePrescriptionZodSchema = z
  .object({
    instructions: z
      .string("Instructions is required")
      .trim()
      .min(1, "Instructions cannot be empty")
      .optional(),
    followUpDate: followUpDateSchema.optional(),
  })
  .refine((data) => data.instructions !== undefined || data.followUpDate !== undefined, {
    message: "At least one field is required to update prescription",
  });

export const prescriptionValidation = {
  createPrescriptionZodSchema,
  updatePrescriptionZodSchema,
};
